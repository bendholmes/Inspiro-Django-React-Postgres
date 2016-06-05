# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.conf import settings
from django.conf.urls import include, url
from django.conf.urls.static import static
from django.contrib import admin

admin.autodiscover()

urlpatterns = [
    # Django Admin
    url(r'^admin/', include(admin.site.urls)),

    # Inspuro
    url(r'^', include("inspiro.urls", namespace="inspiro")),

] + static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
