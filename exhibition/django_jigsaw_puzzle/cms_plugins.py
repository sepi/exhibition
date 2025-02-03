from django.urls import reverse
from django.utils.translation import gettext_lazy as _

from cms.plugin_base import CMSPluginBase
from cms.plugin_pool import plugin_pool
from cms.models.pluginmodel import CMSPlugin

from .models import JigsawPuzzle, JigsawPuzzlePluginModel, MemoryGame, MemoryGamePluginModel, PaintGamePluginModel, GridDifficultyLevel
from .views import jigsaw_puzzle_context, memory_game_context, paint_game_context


class GamePlugin(CMSPluginBase):
    render_template = 'django_jigsaw_puzzle/jigsaw_puzzle_plugin.html'
    cache = True
    allow_children = False
    require_parent = False
    parent_classes = []
    module = _('museo.pro/games')

    def render(self, context, instance, placeholder):
        # FIME: Why get super context?
        context = super().render(context, instance, placeholder)
        return self.get_context(instance.game)


@plugin_pool.register_plugin
class JigsawPuzzlePlugin(GamePlugin):
    model = JigsawPuzzlePluginModel
    name = _('Jigsaw Puzzle')

    def get_context(self, game):
        return jigsaw_puzzle_context(game)


@plugin_pool.register_plugin
class MemoryGamePlugin(GamePlugin):
    model = MemoryGamePluginModel
    name = _('Memory Game')

    def get_context(self, game):
        return memory_game_context(game)


@plugin_pool.register_plugin
class PaintGamePlugin(GamePlugin):
    model = PaintGamePluginModel
    name = _('Paint Game')

    def get_context(self, game):
        return paint_game_context(game)
    
