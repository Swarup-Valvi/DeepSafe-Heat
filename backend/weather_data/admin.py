from django.contrib import admin

from .models import WeatherRecord


@admin.register(WeatherRecord)
class WeatherRecordAdmin(admin.ModelAdmin):
    list_display = [
        "location",
        "recorded_at",
        "temperature",
        "feels_like",
        "humidity",
        "uv_index",
        "source",
        "status",
    ]

    list_filter = [
        "source",
        "status",
        "recorded_at",
    ]

    search_fields = ["location"]