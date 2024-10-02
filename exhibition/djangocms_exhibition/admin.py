from django.contrib import admin

from .models import ExhibitionObject

# Register your models here.
@admin.register(ExhibitionObject)
class ExhibitionObjectAdmin(admin.ModelAdmin):
    model = ExhibitionObject

    list_display = ["id", "author", "date_author"]
