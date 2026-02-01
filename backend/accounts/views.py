import json
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import ensure_csrf_cookie, csrf_protect
from django.contrib.auth.decorators import login_required
from django.utils.decorators import method_decorator
from django.views.decorators.cache import never_cache


@ensure_csrf_cookie
@require_http_methods(["GET"])
def get_csrf_token(request):
    """Get CSRF token - sets cookie automatically"""
    return JsonResponse({'detail': 'CSRF cookie set'})


@never_cache
@require_http_methods(["GET"])
def get_current_user(request):
    """Get current authenticated user"""
    if request.user.is_authenticated:
        return JsonResponse({
            'user': {
                'id': request.user.id,
                'username': request.user.username,
                'email': request.user.email
            }
        })
    return JsonResponse({'user': None})


@csrf_protect
@require_http_methods(["POST"])
def user_register(request):
    """Register new user"""
    try:
        # Debug logging
        print("=" * 50)
        print("RAW BODY:", request.body)
        print("CONTENT TYPE:", request.META.get('CONTENT_TYPE'))
        print("=" * 50)
        
        data = json.loads(request.body)
        print("PARSED DATA:", data)
        
        username = data.get('username', '').strip()
        email = data.get('email', '').strip()
        password = data.get('password', '')
        password_confirm = data.get('password_confirm', '')
        
        print(f"Username: {username}, Email: {email}")
        print(f"Password exists: {bool(password)}, Confirm exists: {bool(password_confirm)}")

        # Validation
        if not all([username, email, password, password_confirm]):
            return JsonResponse({'error': 'All fields are required'}, status=400)
        
        if len(password) < 8:
            return JsonResponse({'error': 'Password must be at least 8 characters'}, status=400)
        
        if password != password_confirm:
            return JsonResponse({'error': 'Passwords do not match'}, status=400)
        
        if User.objects.filter(username=username).exists():
            return JsonResponse({'error': 'Username already exists'}, status=400)
        
        if User.objects.filter(email=email).exists():
            return JsonResponse({'error': 'Email already exists'}, status=400)

        # Create user and log them in
        user = User.objects.create_user(
            username=username,
            email=email,
            password=password
        )
        login(request, user)
        
        print(f"User created successfully: {user.username}")
        
        return JsonResponse({
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email
            }
        }, status=201)
        
    except json.JSONDecodeError as e:
        print(f"JSON DECODE ERROR: {e}")
        return JsonResponse({'error': 'Invalid JSON'}, status=400)
    except Exception as e:
        print(f"EXCEPTION: {type(e).__name__}: {e}")
        return JsonResponse({'error': 'Registration failed'}, status=500)


@csrf_protect
@require_http_methods(["POST"])
def user_login(request):
    """Login user"""
    try:
        print("=" * 50)
        print("LOGIN - RAW BODY:", request.body)
        print("=" * 50)
        
        data = json.loads(request.body)
        print("LOGIN - PARSED DATA:", data)
        
        username = data.get('username', '').strip()
        password = data.get('password', '')

        if not username or not password:
            return JsonResponse({'error': 'Username and password are required'}, status=400)

        user = authenticate(request, username=username, password=password)
        
        if not user:
            return JsonResponse({'error': 'Invalid username or password'}, status=401)

        login(request, user)
        
        print(f"User logged in successfully: {user.username}")
        
        return JsonResponse({
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email
            }
        })
        
    except json.JSONDecodeError as e:
        print(f"JSON DECODE ERROR: {e}")
        return JsonResponse({'error': 'Invalid JSON'}, status=400)
    except Exception as e:
        print(f"EXCEPTION: {type(e).__name__}: {e}")
        return JsonResponse({'error': 'Login failed'}, status=500)


@csrf_protect
@require_http_methods(["POST"])
def user_logout(request):
    """Logout user"""
    if not request.user.is_authenticated:
        return JsonResponse({'error': 'Not authenticated'}, status=401)
    
    logout(request)
    return JsonResponse({'detail': 'Logged out successfully'})


@login_required
@require_http_methods(["GET"])
def home(request):
    """Protected route example"""
    return JsonResponse({
        'message': f'Welcome {request.user.username}!'
    })