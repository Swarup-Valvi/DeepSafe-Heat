from rest_framework.routers import DefaultRouter

from .views import RiskRuleViewSet


router = DefaultRouter()

router.register(
    "rules",
    RiskRuleViewSet,
    basename="risk-rules",
)


urlpatterns = router.urls