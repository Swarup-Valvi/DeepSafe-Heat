from django.contrib import admin

from .models import ActivityType, PlannedActivity


@admin.register(ActivityType)
class ActivityTypeAdmin(admin.ModelAdmin):
    list_display = [
        "name",
        "intensity",
        "default_exposure",
        "default_duration",
        "is_active",
    ]

    list_filter = [
        "intensity",
        "default_exposure",
        "is_active",
    ]

    search_fields = ["name"]


@admin.register(PlannedActivity)
class PlannedActivityAdmin(admin.ModelAdmin):
    list_display = [
        "activity_type",
        "supervisor",
        "location",
        "activity_date",
        "start_time",
        "status",
    ]

    list_filter = [
        "status",
        "activity_type",
        "sun_exposure",
        "activity_date",
    ]

    search_fields = [
        "location",
        "supervisor__email",
        "supervisor__username",
    ]