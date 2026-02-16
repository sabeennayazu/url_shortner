import json
import logging

from django.conf import settings
from django.shortcuts import redirect
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import csrf_exempt
from django.core.validators import URLValidator
from django.core.exceptions import ValidationError
from django.db import IntegrityError, transaction
from django.db.models import Count
from django.contrib.auth.decorators import login_required

from .models import Url, Click

logger = logging.getLogger(__name__)

# -------------------------
# Base62 encoding
# -------------------------
BASE62_ALPHABET = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz"

def encode_base62(num):
    if num == 0:
        return BASE62_ALPHABET[0]
    arr = []
    while num:
        num, rem = divmod(num, 62)
        arr.append(BASE62_ALPHABET[rem])
    arr.reverse()
    return ''.join(arr)

def decode_base62(s):
    result = 0
    for char in s:
        result = result * 62 + BASE62_ALPHABET.index(char)
    return result

# -------------------------
# URL validation
# -------------------------
def validate_url(url):
    validator = URLValidator()
    try:
        if not url.startswith(('http://', 'https://')):
            url = 'https://' + url
        validator(url)
        return True, url
    except ValidationError:
        return False, None

# -------------------------
# Utility: get client IP
# -------------------------
def get_client_ip(request):
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0]
    else:
        ip = request.META.get('REMOTE_ADDR')
    return ip

# -------------------------
# Create short URL
# -------------------------
@csrf_exempt  # remove in production if using CSRF properly
@require_http_methods(["POST"])
def create_short_url(request):
    try:
        data = json.loads(request.body.decode("utf-8"))
    except (json.JSONDecodeError, UnicodeDecodeError):
        return JsonResponse({"error": "Invalid JSON"}, status=400)

    original_url = data.get("original_url", "").strip()
    if not original_url:
        return JsonResponse({"error": "original_url is required"}, status=400)

    is_valid, validated_url = validate_url(original_url)
    if not is_valid:
        return JsonResponse({"error": "Invalid URL format"}, status=400)

    try:
        # Check existing URL
        existing_url = Url.objects.filter(original_url=validated_url).first()
        if existing_url:
            short_url = f"{settings.SHORT_URL_DOMAIN}/s/{existing_url.short_code}"
            return JsonResponse({
                "id": existing_url.id,
                "short_code": existing_url.short_code,
                "short_url": short_url,
                "original_url": existing_url.original_url,
                "created_at": existing_url.created_at.isoformat(),
                "message": "URL already shortened"
            }, status=200)

        # Create new URL atomically
        with transaction.atomic():
            url_obj = Url.objects.create(original_url=validated_url, short_code="temp")
            url_obj.short_code = encode_base62(url_obj.id)
            url_obj.save(update_fields=["short_code"])

        short_url = f"{settings.SHORT_URL_DOMAIN}/s/{url_obj.short_code}"
        return JsonResponse({
            "id": url_obj.id,
            "short_code": url_obj.short_code,
            "short_url": short_url,
            "original_url": url_obj.original_url,
            "created_at": url_obj.created_at.isoformat()
        }, status=201)

    except IntegrityError as e:
        logger.error(f"Integrity Error: {e}")
        return JsonResponse({"error": "Database integrity error"}, status=500)
    except Exception as e:
        logger.exception("Unexpected error creating short URL")
        return JsonResponse({"error": "An unexpected error occurred"}, status=500)

# -------------------------
# Redirect short URL
# -------------------------
@require_http_methods(["GET"])
def redirect_short_url(request, short_code):
    try:
        url_obj = Url.objects.get(short_code=short_code)
        Click.objects.create(
            url=url_obj,
            ip_address=get_client_ip(request),
            user_agent=request.META.get('HTTP_USER_AGENT', '')
        )
        return redirect(url_obj.original_url)
    except Url.DoesNotExist:
        return JsonResponse({"error": "Short URL not found"}, status=404)
    except Exception as e:
        logger.error(f"Error redirecting short URL: {e}")
        return JsonResponse({"error": "An error occurred"}, status=500)

# -------------------------
# Get all user URLs
# -------------------------
@require_http_methods(["GET"])
@login_required
def get_user_urls(request):
    try:
        urls = Url.objects.all().values(
            "id", "original_url", "short_code", "created_at"
        ).annotate(clicks_count=Count("clicks")).order_by("-created_at")

        urls_list = []
        for url in urls:
            urls_list.append({
                "id": url["id"],
                "short_code": url["short_code"],
                "short_url": f"{settings.SHORT_URL_DOMAIN}/s/{url['short_code']}",
                "original_url": url["original_url"],
                "created_at": url["created_at"].isoformat(),
                "clicks": url.get("clicks_count", 0)
            })

        return JsonResponse({"count": len(urls_list), "urls": urls_list}, status=200)
    except Exception as e:
        logger.error(f"Error fetching user URLs: {e}")
        return JsonResponse({"error": "An error occurred"}, status=500)

# -------------------------
# URL Analytics
# -------------------------
@require_http_methods(["GET"])
@login_required
def get_url_analytics(request, url_id):
    try:
        url_obj = Url.objects.get(id=url_id)
        clicks = Click.objects.filter(url=url_obj).values(
            "clicked_at", "ip_address", "user_agent"
        ).order_by("-clicked_at")

        clicks_list = [
            {
                "clicked_at": click["clicked_at"].isoformat(),
                "ip_address": click["ip_address"],
                "user_agent": click["user_agent"]
            } for click in clicks
        ]

        return JsonResponse({
            "id": url_obj.id,
            "short_code": url_obj.short_code,
            "short_url": f"{settings.SHORT_URL_DOMAIN}/s/{url_obj.short_code}",
            "original_url": url_obj.original_url,
            "total_clicks": len(clicks_list),
            "created_at": url_obj.created_at.isoformat(),
            "clicks": clicks_list
        }, status=200)
    except Url.DoesNotExist:
        return JsonResponse({"error": "URL not found"}, status=404)
    except Exception as e:
        logger.error(f"Error fetching URL analytics: {e}")
        return JsonResponse({"error": "An error occurred"}, status=500)

# -------------------------
# Delete URL
# -------------------------
@require_http_methods(["DELETE"])
@login_required
def delete_url(request, url_id):
    try:
        url_obj = Url.objects.get(id=url_id)
        short_code = url_obj.short_code
        url_obj.delete()
        return JsonResponse({"message": f"URL {short_code} deleted successfully"}, status=200)
    except Url.DoesNotExist:
        return JsonResponse({"error": "URL not found"}, status=404)
    except Exception as e:
        logger.error(f"Error deleting URL: {e}")
        return JsonResponse({"error": "An error occurred"}, status=500)
