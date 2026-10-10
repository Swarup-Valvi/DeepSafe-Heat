from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import (
    ActivityTypeViewSet,
    PlannedActivityViewSet,
)


router = DefaultRouter()

router.register(
    "activity-types",
    ActivityTypeViewSet,
    basename="activity-type",
)

router.register(
    "activities",
    PlannedActivityViewSet,
    basename="activity",
)


urlpatterns = [
    path("", include(router.urls)),
]