from cms.models.pluginmodel import CMSPlugin
from django.db import models

class ExhibitionObject(CMSPlugin):
    author = models.CharField(max_length=255)
    date = models.CharField(max_length=128)
    name_en = models.CharField(max_length=255)
    description_en = models.TextField()
    name_fr = models.CharField(max_length=255)
    description_fr = models.TextField()
    name_de = models.CharField(max_length=255)
    description_de = models.TextField()
