from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated

from activities.permissions import IsAdministrator

from .models import RiskRule
from .rule_serializers import RiskRuleSerializer


class RiskRuleViewSet(viewsets.ModelViewSet):
    serializer_class = RiskRuleSerializer
    permission_classes = [
        IsAuthenticated,
        IsAdministrator,
    ]

    queryset = RiskRule.objects.all()