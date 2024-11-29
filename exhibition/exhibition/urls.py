from cms.sitemaps import CMSSitemap
from django.conf import settings
from django.urls import include, path
from django.conf.urls.i18n import i18n_patterns
from django.contrib import admin
from django.contrib.sitemaps.views import sitemap
from django.contrib.staticfiles.urls import staticfiles_urlpatterns
from django.views.static import serve
from django.views.generic.base import RedirectView
from django.conf.urls.static import static

from constance import config

admin.autodiscover()

catalog_site_url = f'{config.CATALOG_SITE_NAME}/'

urlpatterns = [
    path('admin/', admin.site.urls),
    path('sitemap.xml', sitemap,
         {'sitemaps': {'cmspages': CMSSitemap}}),
    path(catalog_site_url, include('cms.urls')),
    path('', RedirectView.as_view(url=catalog_site_url, permanent=False)),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
