from django.urls import reverse
from django.utils.translation import gettext_lazy as _

from cms.plugin_base import CMSPluginBase
from cms.plugin_pool import plugin_pool
from cms.models.pluginmodel import CMSPlugin

from .models import JigsawPuzzle, JigsawPuzzlePluginModel, MemoryGame, MemoryGamePluginModel, GridDifficultyLevel

@plugin_pool.register_plugin
class JigsawPuzzlePlugin(CMSPluginBase):
    model = JigsawPuzzlePluginModel
    name = _('Jigsaw Puzzle')
    render_template = 'django_jigsaw_puzzle/jigsaw_puzzle_plugin.html'
    cache = True
    allow_children = False
    require_parent = False
    parent_classes = []
    module = _('museo.pro/games')

    def render(self, context, instance, placeholder):
        context = super().render(context, instance, placeholder)

        jp = instance.jigsaw_puzzle
        dos = GridDifficultyLevel.objects.filter(game=jp)

        context = {
            'jigsaw_puzzle_url': reverse('jigsaw_puzzle_detail', args=[jp.id]),
            'title': jp.name,
            'logo_url': "/media/filer_public/85/1e/851e2b33-e94b-44d1-b353-141f23e3c0d4/lcm.svg",
            'randomize_images': jp.randomize_images,
            'idle_first_seconds': 300,
            'idle_second_seconds': 330,
            'copyright_notice': jp.copyright_notice,
            'navbar_color': jp.color,
            'mode': 'JIGSAW_PUZZLE',
        }

        return context


@plugin_pool.register_plugin
class MemoryGamePlugin(CMSPluginBase):
    model = MemoryGamePluginModel
    name = _('Memory Game')
    render_template = 'django_jigsaw_puzzle/jigsaw_puzzle_plugin.html'
    cache = True
    allow_children = False
    require_parent = False
    parent_classes = []
    module = _('museo.pro/games')

    def render(self, context, instance, placeholder):
        context = super().render(context, instance, placeholder)

        game = instance.memory_game
        dos = GridDifficultyLevel.objects.filter(game=game)

        context = {
            'jigsaw_puzzle_url': reverse('jigsaw_puzzle_detail', args=[game.id]),
            'title': game.name,
            'logo_url': "/media/filer_public/85/1e/851e2b33-e94b-44d1-b353-141f23e3c0d4/lcm.svg",
            # 'randomize_images': jp.randomize_images,
            # 'idle_first_seconds': 300,
            # 'idle_second_seconds': 330,
            'copyright_notice': game.copyright_notice,
            'navbar_color': game.color,
            'mode': 'MEMORY_GAME',
        }

        return context
