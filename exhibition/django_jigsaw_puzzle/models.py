import uuid

from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from filer.fields.image import FilerImageField
from django.utils.translation import gettext_lazy as _
from cms.models import CMSPlugin

class GameGroup(models.Model):
    """A way to put group several games into one group. Can be used to
    catergorize games for common display for example.

    """
    name = models.CharField(max_length=128)

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
    color = models.CharField(max_length=7,
                             default="#fff",
                             verbose_name=_("The color of the top navigation bar."))

    def __str__(self):
        return self.name


class ImageGame(Game):
    copyright_notice = models.CharField(max_length=2048)
    image_set = models.ForeignKey(ImageSet,
                                  on_delete=models.PROTECT)


class GameSessionManager(models.Manager):
    def top_n(self, game, n):
        return GameSession.objects.filter(game=game) \
                                  .annotate(score=models.Sum("partial_results__result_number")) \
                                  .order_by('-score')[:n]


class GameSession(models.Model):
    """A way to record data about a gaming session, eg. to calculate a high-score or similar.
    """
    session_id = models.UUIDField(primary_key=True,
                                  default=uuid.uuid4,
                                  editable=False)
    player_name = models.CharField(max_length=512)
    game = models.ForeignKey(Game, on_delete=models.CASCADE,
                             related_name='game_session')
    ongoing = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def score(self):
        game = self.game.quizgame

        # Score and count
        question_count = game.questions.count()
        max_score = question_count * game.points_per_question_max
        agg = GameSessionPartialResult.objects \
                                      .filter(game_session_id=self.session_id) \
                                      .aggregate(answer_sum=models.Sum('result_number', default=0))
        score = agg['answer_sum'] / max_score
        return score


    def histogram_bin(self, mn, mx, first):
        # Histogram base query
        qs = GameSession.objects.annotate(
            score=models.Sum("partial_results__result_number"),
            answer_count=models.Count("partial_results"),
        )

        if first:
            return qs.filter(score__gte=mn, score__lte=mx).count()
        else:
            return qs.filter(score__gt=mn, score__lte=mx).count()


    def histogram(self, max_score, bins):
        game = self.game.quizgame
        questions_count = game.questions.count()
        max_session_score = questions_count * max_score
        hist = []
        for i in range(0, bins):
            mn = i / bins
            mx = (i + 1) / bins
            result = {
                'from': mn,
                'to': mx,
                'count': self.histogram_bin(mn * max_session_score, mx * max_session_score, i == 0),
            }
            hist.append(result)
        return hist
        

    def __str__(self):
        return self.game.name


    objects = GameSessionManager()


class GameSessionPartialResult(models.Model):
    """A partial result that occurs during a game session. It has a
    boolean or number value to be summarized into a final score or
    rating. This shall be used to record any kind of total rating for
    a game session.
    """
    game_session = models.ForeignKey(GameSession, on_delete=models.CASCADE,
                                     related_name='partial_results')
    question = models.ForeignKey('QuizQuestion', on_delete=models.CASCADE,
                                 related_name='partial_results')
    result_boolean = models.BooleanField(null=True, blank=True)
    result_number = models.FloatField(null=True, blank=True)
    submitted_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"game_session= {self.game_session.session_id}, result_number={self.result_number}"


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
    allow_take_home = models.BooleanField(default=True,
                                          verbose_name=_("Allow the user to take home their painting by scanning a QR-Code. This also saves the painting in the CMS."))
    idle_first_seconds = models.IntegerField(default=300,
                                             verbose_name=_("The amount of seconds until an idle warning is shown. If the users ignores it, the game will eventually be reset."))
    idle_second_seconds = models.IntegerField(default=330,
                                              verbose_name=_("The amount of seconds until the idle warning disappears automatically and the game is reset."))
    color_count_gray = models.IntegerField(default=5,
                                           verbose_name=_("The amount of gray colors including black and white"))
    color_count_skin = models.IntegerField(default=5,
                                           verbose_name=_("The amount of skin colors."))
    color_count_hue = models.IntegerField(default=11,
                                          verbose_name=_("The amount of different colors like blue, green or yellow."))
    color_count_brightness = models.IntegerField(default=3,
                                                 verbose_name=_("The amount of different brightnesses for each color."))


class PaintGamePluginModel(CMSPlugin):
    game = models.ForeignKey(PaintGame,
                             on_delete=models.PROTECT)


class QuizGame(Game):
    allow_multiple_answers = models.BooleanField(default=False,
                                                 verbose_name=_("Allow player to select more than one answer per question."))
    points_correct = models.IntegerField(default=1,
                                         verbose_name=_("Amount of points the player gets for a correct answer."))
    points_incorrect = models.IntegerField(default=-1,
                                           verbose_name=_("Amount of points the player gets for an incorrect answer."),
                                           help_text=_("This value needs to be negative to remove points for bad answers."))
    points_minimum = models.IntegerField(default=0,
                                         verbose_name=_("Minimum amount of points per question."),
                                         help_text=_("Use to prevent negative points."))
    points_per_question_max = models.IntegerField(default=4,
                                                  verbose_name=_("The maximum amount the player can get per question."),
                                                  help_text=_("Used to calculate what is a perfect score of 100%. E.g. if you quiz has a maximum of 2 correct answers per question and you give 1 point per correct answer, set it to 2."))
    histogram_bin_count = models.PositiveIntegerField(default=7,
                                                      verbose_name=_("Result screen histogram bins count"),
                                                      help_text=_("Use a low nuber to show less detail in the result screen score distribution."))


class QuizGamePluginModel(CMSPlugin):
    game = models.ForeignKey(QuizGame,
                             on_delete=models.PROTECT)
    

class QuizQuestion(models.Model):
    game = models.ForeignKey(QuizGame, related_name='questions',
                             on_delete=models.PROTECT)
    
    question = models.CharField(max_length=2048)

    answer_1 = models.CharField(max_length=1024)
    correct_1 = models.BooleanField(default=False)
    
    answer_2 = models.CharField(max_length=1024)
    correct_2 = models.BooleanField(default=False)

    answer_3 = models.CharField(max_length=1024)
    correct_3 = models.BooleanField(default=False)

    answer_4 = models.CharField(max_length=1024)
    correct_4 = models.BooleanField(default=False)

    order = models.PositiveIntegerField(
        default=0,
        blank=False,
        null=False,
        db_index=True,
    )

    class Meta:
        ordering = ['order']

    def __str__(self):
        return f"Question {self.id}"
