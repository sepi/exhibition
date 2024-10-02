# -*- coding: utf-8 -*-
from __future__ import absolute_import, print_function, unicode_literals

from cms.sitemaps import CMSSitemap
from django.conf import settings
from django.urls import include, path
from django.conf.urls.i18n import i18n_patterns
from django.contrib import admin
from django.contrib.sitemaps.views import sitemap
from django.contrib.staticfiles.urls import staticfiles_urlpatterns
from django.views.static import serve

admin.autodiscover()

urlpatterns = [
    path('sitemap.xml', sitemap,
         {'sitemaps': {'cmspages': CMSSitemap}}),
    path('admin/', admin.site.urls),  # NOQA
    path('', include('cms.urls')),
]

# This is only needed when using runserver.
if settings.DEBUG:
    urlpatterns = [
        path('media/:path', serve,
             {'document_root': settings.MEDIA_ROOT, 'show_indexes': True}),
        ] + staticfiles_urlpatterns() + urlpatterns
