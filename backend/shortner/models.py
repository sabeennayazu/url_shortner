
from django.db import models



class Url(models.Model):
    original_url = models.URLField()
    short_code = models.CharField(max_length=10, unique=True)
    created_at = models.DateTimeField(auto_now_add=True, null=True)

    def __str__(self):
        return f"{self.original_url} -> {self.short_code}"

class Click(models.Model):
    url = models.ForeignKey(Url, on_delete=models.CASCADE, related_name="clicks")
    clicked_at = models.DateTimeField(auto_now_add=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(null=True, blank=True)

    def __str__(self):
        return f"Click on {self.url.short_code} at {self.clicked_at}"


    