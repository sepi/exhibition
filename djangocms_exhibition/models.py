from cms.models.pluginmodel import CMSPlugin
from django.db import models
from djangocms_text_ckeditor.fields import HTMLField

class ExhibitionObject(CMSPlugin):
    author = models.CharField(max_length=255, null=True, blank=True)
    date_author = models.CharField(max_length=128, null=True, blank=True)

    info_object = models.TextField(null=True, blank=True)
    date_object = models.CharField(max_length=128, null=True, blank=True)

    comment_fr = HTMLField(null=True, blank=True)
    comment_de = HTMLField(null=True, blank=True)
    comment_en = HTMLField(null=True, blank=True)
