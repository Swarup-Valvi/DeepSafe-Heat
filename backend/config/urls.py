from django.contrib import admin
from django.urls import include, path
from heatcast.views import ForecastView
from .views import HealthCheckView


urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/forecast/", ForecastView.as_view()),
    path(
        "api/health/",
        HealthCheckView.as_view(),
        name="health-check",
    ),

    path(
        "api/auth/",
        include("accounts.urls"),
    ),

    path(
        "api/",
        include("activities.urls"),
    ),
    
    path("api/reports/", include("reports.urls")),
    
    path(
    "api/weather/",
    include("weather_data.urls"),
),
    
    path(
    "api/risk/",
    include("risk_engine.urls"),
),
]