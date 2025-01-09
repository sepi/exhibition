from django.db import models
from filer.fields.image import FilerImageField
from django.utils.translation import gettext_lazy as _
from cms.models import CMSPlugin

class DifficultyLevel(models.Model):
    name = models.CharField(max_length=128)
    
    rows = models.IntegerField()
    columns = models.IntegerField()

    def __str__(self):
        return f"{self.name} ({self.rows}x{self.columns})"


class ImageSetImage(models.Model):
    image_set = models.ForeignKey('ImageSet',
                                  on_delete=models.CASCADE)
    image = FilerImageField(on_delete=models.PROTECT)


class ImageSet(models.Model):
    name = models.CharField(max_length=512)

    def __str__(self):
        return self.name
    

class GridDifficultyLevel(models.Model):
    difficulty_level = models.ForeignKey(DifficultyLevel,
                                         on_delete=models.PROTECT)
    game = models.ForeignKey('Game',
                             on_delete=models.PROTECT)


class Game(models.Model):
    name = models.CharField(max_length=512)
    copyright_notice = models.CharField(max_length=2048)
    color = models.CharField(max_length=7, default="#fff")
    # grid_difficulty_level = models.ForeignKey(GridDifficultyLevel,
    #                                           on_delete=models.PROTECT,
    #                                           null=True)

    def __str__(self):
        return self.name


class ImageGame(Game):
    image_set = models.ForeignKey(ImageSet,
                                  on_delete=models.PROTECT)

    
class JigsawPuzzle(ImageGame):
    randomize_images = models.BooleanField(default=True)


class JigsawPuzzlePluginModel(CMSPlugin):
    game = models.ForeignKey(JigsawPuzzle,
                             on_delete=models.PROTECT)


class MemoryGame(ImageGame):
    pass


class MemoryGamePluginModel(CMSPlugin):
    game = models.ForeignKey(MemoryGame,
                             on_delete=models.PROTECT)
