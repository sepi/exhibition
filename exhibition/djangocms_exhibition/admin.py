from django.utils.translation import gettext_lazy as _
from django.contrib import admin

from cms.models.titlemodels import Title

from import_export import resources, fields
from import_export.admin import ExportMixin


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

class ExhibitionObjectResource(resources.ModelResource):
    class Meta:
        model = ExhibitionObject
        fields = ('author', 'date_author',
                  'info_object_fr', 'date_object_fr', 'comment_fr',
                  'info_object_de', 'date_object_de', 'comment_de',
                  'info_object_en', 'date_object_en', 'comment_en')

@admin.register(ExhibitionObject)
class ExhibitionObjectAdmin(ExportMixin, admin.ModelAdmin):
    list_display = ["author", "date_author", "page", "image_thumbnail"]

    list_filter = (PageFilter, "author", "date_author")

    def get_queryset(self, request):
        qs = (
            super()
            .get_queryset(request)
            .exclude(placeholder__page__publisher_is_draft=True)
        )
        return qs
    
    resource_classes = [ExhibitionObjectResource]
