from django.urls import path
from . import views

urlpatterns = [
    path('urls/create/', views.create_short_url, name='create_short_url'),
    path('urls/', views.get_user_urls, name='get_user_urls'),
    path('urls/<int:url_id>/analytics/', views.get_url_analytics, name='url_analytics'),
    path('urls/<int:url_id>/delete/', views.delete_url, name='delete_url'),
    path('s/<str:short_code>/', views.redirect_short_url, name='redirect_short_url'),
]