from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated

from activities.permissions import IsAdministrator

from .models import WeatherRecord
from .serializers import WeatherRecordSerializer


class WeatherRecordViewSet(
    viewsets.ReadOnlyModelViewSet
):
    serializer_class = WeatherRecordSerializer

    def get_queryset(self):
        queryset = WeatherRecord.objects.all()

        location = self.request.query_params.get(
            "location"
        )

        if location:
            queryset = queryset.filter(
                location__icontains=location
            )

        return queryset

    def get_permissions(self):
        return [
            IsAuthenticated(),
            IsAdministrator(),
        ]