from cms.models.pluginmodel import CMSPlugin
from django.db import models
from djangocms_text_ckeditor.fields import HTMLField
from filer.fields.image import FilerImageField
from django.utils.safestring import mark_safe
from django.conf import settings
from easy_thumbnails.files import get_thumbnailer

class ExhibitionObject(CMSPlugin):
    author = models.CharField(max_length=255, null=True, blank=True)
    date_author = models.CharField(max_length=128, null=True, blank=True)

    image = FilerImageField(null=True, blank=True,
                            related_name="exhibition_object_image", on_delete=models.PROTECT)

    info_object_fr = models.TextField(null=True, blank=True)
    date_object_fr = models.CharField(max_length=128, null=True, blank=True)
    comment_fr = HTMLField(null=True, blank=True)

    info_object_de = models.TextField(null=True, blank=True)
    date_object_de = models.CharField(max_length=128, null=True, blank=True)
    comment_de = HTMLField(null=True, blank=True)

    info_object_en = models.TextField(null=True, blank=True)
    date_object_en = models.CharField(max_length=128, null=True, blank=True)
    comment_en = HTMLField(null=True, blank=True)

    def __str__(self):
        return self.author or self.info_object_fr

    @property
    @mark_safe
    def image_thumbnail(self):
        if self.image:
            tn = get_thumbnailer(self.image)
            nail = tn.get_thumbnail({'size': (42, 25), 'crop': True})
            return f'<img src="{settings.MEDIA_URL}{nail}" alt="{self.author}"/>'
        else:
            return '-'

    @property
    def page(self):
        if self.placeholder:
            return self.placeholder.page
        else:
            '-'
