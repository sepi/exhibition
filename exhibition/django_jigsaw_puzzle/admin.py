from django.contrib import admin

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
    fields = ['name', 'image_set']
    
    inlines = [
        JigsawPuzzleDifficultyLevelInline
    ]
