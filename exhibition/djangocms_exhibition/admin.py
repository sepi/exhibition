from django.utils.translation import gettext_lazy as _
from django.contrib import admin

from cms.models.titlemodels import Title
from cms.models.pluginmodel import CMSPlugin
from cms.constants import PUBLISHER_STATE_DIRTY

from import_export import resources, fields
from import_export.admin import ImportMixin, ExportMixin, ImportExportMixin


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

def add_to_placeholder(instance, page_slug, is_draft):
    title = Title.objects.get(slug=page_slug, publisher_is_draft=is_draft)
    title.publisher_state = PUBLISHER_STATE_DIRTY # So that in edit mode we know this is dirty
    title.save()
    
    placeholder = title.page.placeholders.get(slot='content')

    instance.placeholder = placeholder
    instance.language = 'en'

    new_pos = CMSPlugin.objects.filter(language='en',
                                       parent__isnull=True,
                                       placeholder=placeholder).count()
    instance.position = new_pos
    instance.plugin_type = 'ExhibitionObjectPlugin'
    instance.add_root(instance=instance)

        
class ExhibitionObjectResource(resources.ModelResource):
    page_slug = fields.Field()

    def dehydrate_page_slug(self, eo):
        page = eo.placeholder.page
        if page:
            title = Title.objects.get(page=page)
            return title.slug
        else:
            return ''

    def before_save_instance(self, instance, row, **kwargs):
        page_slug = row.get('page_slug')

        add_to_placeholder(instance, page_slug, True)

    class Meta:
        model = ExhibitionObject
        fields = ('page_slug', 'author', 'date_author',
                  'info_object_fr', 'date_object_fr', 'comment_fr',
                  'info_object_de', 'date_object_de', 'comment_de',
                  'info_object_en', 'date_object_en', 'comment_en')

        import_id_fields = []

@admin.register(ExhibitionObject)
class ExhibitionObjectAdmin(ImportExportMixin, admin.ModelAdmin):
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

    # This disable the add button which makes no sense here.
    def has_add_permission(self, request, obj=None):
        return False
