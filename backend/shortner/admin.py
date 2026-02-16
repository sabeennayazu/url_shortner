from django.contrib import admin
from .models import Url, Click


@admin.register(Url)
class UrlAdmin(admin.ModelAdmin):
    list_display = ("original_url", "short_code", "created_at", "click_count")
    search_fields = ("original_url", "short_code")
    list_filter = ("created_at",)
    ordering = ("-created_at",)

    def click_count(self, obj):
        return obj.clicks.count()
    click_count.short_description = "Clicks"


@admin.register(Click)
class ClickAdmin(admin.ModelAdmin):
    list_display = ("url", "clicked_at", "ip_address")
    search_fields = ("url__short_code", "ip_address")
    list_filter = ("clicked_at",)
    ordering = ("-clicked_at",)
