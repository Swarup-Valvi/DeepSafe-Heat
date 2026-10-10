from django.contrib import admin

from .models import RiskAssessment, RiskRule


@admin.register(RiskRule)
class RiskRuleAdmin(admin.ModelAdmin):
    list_display = [
        "name",
        "temperature_weight",
        "humidity_weight",
        "uv_weight",
        "activity_weight",
        "duration_weight",
        "is_active",
    ]

    list_filter = ["is_active"]


@admin.register(RiskAssessment)
class RiskAssessmentAdmin(admin.ModelAdmin):
    list_display = [
        "activity",
        "risk_score",
        "risk_level",
        "assessment_method",
        "temperature",
        "humidity",
        "created_at",
    ]

    list_filter = [
        "risk_level",
        "assessment_method",
        "created_at",
    ]

    search_fields = [
        "activity__location",
        "activity__supervisor__email",
    ]