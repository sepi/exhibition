from django.contrib import admin
from django import forms
from django.utils.html import mark_safe
from django.urls import reverse

from .models import ImageSet, ImageSetImage, DifficultyLevel, GridDifficultyLevel, JigsawPuzzle, MemoryGame, PaintGame


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


class GridDifficultyLevelInline(admin.TabularInline):
    model = GridDifficultyLevel
    extra = 0

class GameAdminMixin():
    def get_queryset(self, request):
        qs = super().get_queryset(request)
        self.request = request
        return qs
    
    readonly_fields = ('info_text',)
    
    inlines = [
        GridDifficultyLevelInline
    ]

    # set type="color" to the color field so the color picker is used
    def formfield_for_dbfield(self, db_field, request, **kwargs):
        if db_field.name.endswith('color'):
            kwargs['widget'] = forms.TextInput(attrs={'type': 'color'})
        return super().formfield_for_dbfield(db_field, request, **kwargs)

    def info_text(self, obj):
        if obj.id:
            link = self.get_game_link(obj)
            abs_link = self.request.build_absolute_uri(link)
            return mark_safe(f"<a href=\"{abs_link}\" target=\"_blank\">{abs_link}</a><br/>Use this link only if there is no page in the CMS with a plugin for this game.")
        else:
            return "No link available yet"

    info_text.short_description = "Direct link to game"

@admin.register(JigsawPuzzle)
class JigsawPuzzleAdmin(GameAdminMixin, admin.ModelAdmin):
    fieldsets = (
        (None, {
            'fields': ('info_text', 'name', 'copyright_notice', 'color',
                       'randomize_images', 'image_set'),
        }),
    )

    def get_game_link(self, obj):
        return reverse('jigsaw_puzzle_detail', args=[obj.id])


@admin.register(MemoryGame)
class MemoryGameAdmin(GameAdminMixin, admin.ModelAdmin):
    fieldsets = (
        (None, {
            'fields': ('info_text', 'name', 'copyright_notice',
                       'color', 'card_back_image', 'card_front_background_color',
                       'card_hidden_image', 'card_aspect_ratio', 'card_width',
                       'image_set'),
        }),
    )

    def get_game_link(self, obj):
        return reverse('memory_game_detail', args=[obj.id])


@admin.register(PaintGame)
class PaintGameAdmin(GameAdminMixin, admin.ModelAdmin):
    inlines = []

    fieldsets = (
        (None, {
            'fields': ('info_text', 'name', 'copyright_notice',
                       'color'),
        }),
    )

    def get_game_link(self, obj):
        return reverse('paint_game_detail', args=[obj.id])
