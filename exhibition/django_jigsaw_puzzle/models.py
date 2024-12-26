from django.db import models
from filer.fields.image import FilerImageField
from django.utils.translation import gettext_lazy as _


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


class JigsawPuzzleDifficultyLevel(models.Model):
    difficulty_level = models.ForeignKey(DifficultyLevel,
                                         on_delete=models.PROTECT)
    jigsaw_puzzle = models.ForeignKey('JigsawPuzzle',
                                      on_delete=models.PROTECT)


class JigsawPuzzle(models.Model):
    name = models.CharField(max_length=512)

    jigsaw_puzzle_difficulty_level = models.ForeignKey(JigsawPuzzleDifficultyLevel,
                                                       on_delete=models.PROTECT,
                                                       null=True)
    image_set = models.ForeignKey(ImageSet,
                                  on_delete=models.PROTECT)

    def __str__(self):
        return self.name
