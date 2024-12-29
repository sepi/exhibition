from django.contrib import admin
from django import forms
from django.utils.html import mark_safe
from django.urls import reverse

from .models import ImageSet, ImageSetImage, DifficultyLevel, JigsawPuzzleDifficultyLevel, JigsawPuzzle


class ImageSetImageInline(admin.TabularInline):
    model = ImageSetImage
    extra = 2


@admin.register(ImageSet)
class ImageSetAdmin(admin.ModelAdmin):
    inlines = [
        ImageSetImageInline
    ]


@admin.register(DifficultyLevel)
class DifficultyLevelAdmin(admin.ModelAdmin):
    pass


class JigsawPuzzleDifficultyLevelInline(admin.TabularInline):
    model = JigsawPuzzleDifficultyLevel
    extra = 0


@admin.register(JigsawPuzzle)
class JigsawPuzzleAdmin(admin.ModelAdmin):
    readonly_fields = ('info_text',)
    
    inlines = [
        JigsawPuzzleDifficultyLevelInline
    ]

    fieldsets = (
        (None, {
            'fields': ('info_text', 'name', 'copyright_notice', 'color', 'image_set'),
        }),
    )

    # set type="color" to the color field so the color picker is used
    def formfield_for_dbfield(self, db_field, request, **kwargs):
        if db_field.name == 'color':
            kwargs['widget'] = forms.TextInput(attrs={'type': 'color'})
        return super().formfield_for_dbfield(db_field, request, **kwargs)

    def info_text(self, obj):
        link = reverse('jigsaw_puzzle_detail', args=[obj.id])
        return mark_safe(f"<a href='{link}'>{link}</a><br/>Use this link only if there is no page in the CMS with a plugin for this puzzle.")

    info_text.short_description = "Direct link to puzzle"
