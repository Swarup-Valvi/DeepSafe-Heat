from django.urls import path

from .views import (
    DashboardReportView,
    RiskDistributionView,
    RiskTrendView,
)


urlpatterns = [
    path(
        "dashboard/",
        DashboardReportView.as_view(),
        name="dashboard-report",
    ),

    path(
        "trends/",
        RiskTrendView.as_view(),
        name="risk-trends",
    ),

    path(
        "distribution/",
        RiskDistributionView.as_view(),
        name="risk-distribution",
    ),
]