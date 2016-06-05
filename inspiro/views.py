import logging

from django.views.generic import TemplateView

from rest_framework.views import APIView
from rest_framework import status
from rest_framework.response import Response


#########
# Setup #
#########

logger = logging.getLogger(__name__)

# Add some additional HTTP status codes that are not contained in the DRF list
# TODO: Create pull request
status.HTTP_422_UNPROCESSABLE_ENTITY = 422


#########
# Views #
#########

class IndexView(TemplateView):
    template_name = 'index.html'


class ExampleViewSet(APIView):
    def get(self, request, format=None):
        return Response({"json key": "json value"})
