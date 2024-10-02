from django.utils.translation import gettext_lazy as _
from django.contrib import admin
from cms.models.titlemodels import Title

from .models import ExhibitionObject

class PageFilter(admin.SimpleListFilter):
    title = _("Page")
    parameter_name = 'page'

    def lookups(self, request, model_admin):
        return [(title.page.id, title.title) for title in Title.objects.public() if title.published]

    def queryset(self, request, queryset):
        value = self.value()
        if value:
            return queryset.filter(placeholder__page__id=value)
        else:
            return queryset

# Register your models here.
@admin.register(ExhibitionObject)
class ExhibitionObjectAdmin(admin.ModelAdmin):
    model = ExhibitionObject

    list_display = ["author", "date_author", "page", "image_thumbnail"]

    list_filter = (PageFilter, "author", "date_author")
