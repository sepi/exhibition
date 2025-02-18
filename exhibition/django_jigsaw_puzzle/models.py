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
    color = models.CharField(max_length=7,
                             default="#fff",
                             verbose_name=_("The color of the top navigation bar."))

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
    card_hidden_image = FilerImageField(on_delete=models.PROTECT,
                                        related_name='card_hidden_image',
                                        blank=True,
                                        null=True,
                                        verbose_name=_("The image to show while the cards are being flipped on first load"))
    card_back_image = FilerImageField(on_delete=models.PROTECT,
                                      related_name='card_back_image',
                                      blank=True,
                                      null=True,
                                      verbose_name=_("The image to show when the card is flipped"))
    card_aspect_ratio = models.CharField(max_length=64,
                                         default="1 / 1",
                                         verbose_name=_("Card aspect ratio. Put something that CSS aspect-ratio understands."))
    card_front_background_color = models.CharField(max_length=7,
                                                   default="#222",
                                                   verbose_name=_("The color of the front of the card that is not covered by the image."))
    card_width = models.CharField(max_length=64,
                                  default="160px",
                                  verbose_name=_("Card width in CSS units."))


class MemoryGamePluginModel(CMSPlugin):
    game = models.ForeignKey(MemoryGame,
                             on_delete=models.PROTECT)


class PaintGame(Game):
    pass


class PaintGamePluginModel(CMSPlugin):
    game = models.ForeignKey(PaintGame,
                             on_delete=models.PROTECT)
