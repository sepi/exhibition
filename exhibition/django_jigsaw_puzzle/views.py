from django.shortcuts import render
from django.http import JsonResponse, Http404
from django.shortcuts import render, get_object_or_404
from django.urls import reverse
from django.views.generic.base import TemplateView
from django.views.decorators.cache import never_cache

from filer.models.thumbnailoptionmodels import ThumbnailOption
from easy_thumbnails.files import get_thumbnailer


from .models import ImageSet, ImageSetImage, JigsawPuzzle, MemoryGame, GridDifficultyLevel


def jigsaw_puzzle_list(request):
    jps = JigsawPuzzle.objects.all()
    return JsonResponse([{'name': jp.name,
                          'id': jp.id,
                          'url': reverse('jigsaw_puzzle_detail', args=[jp.id])} 
                         for jp in jps], safe=False)


def jigsaw_puzzle_context(game):
    return {
        'game_url': reverse('jigsaw_puzzle_detail', args=[game.id]),
        'title': game.name,
        'logo_url': "/media/filer_public/85/1e/851e2b33-e94b-44d1-b353-141f23e3c0d4/lcm.svg",
        'randomize_images': game.randomize_images,
        'idle_first_seconds': 300,
        'idle_second_seconds': 330,
        'copyright_notice': game.copyright_notice,
        'navbar_color': game.color,
        'mode': 'JIGSAW_PUZZLE',
    }


def jigsaw_puzzle_detail(request, id):
    game = get_object_or_404(JigsawPuzzle, pk=id)
    gdl = GridDifficultyLevel.objects.filter(game=game)
    if request.headers.get('Accept') == 'application/json':
        return JsonResponse({
            'id': game.id,
            'name': game.name,
            'image_set_url': reverse('image_set_detail', args=[game.image_set.id]),
            'difficulty_levels': [{'name': do.difficulty_level.name,
                                   'rows': do.difficulty_level.rows,
                                   'columns': do.difficulty_level.columns} for do in gdl]
        })
    else: # For browsers
        return render(request, 'django_jigsaw_puzzle/jigsaw_puzzle.html',
                      jigsaw_puzzle_context(game))


def memory_game_context(game):
    return {
        'game_url': reverse('memory_game_detail', args=[game.id]),
        'title': game.name,
        'logo_url': "/media/filer_public/85/1e/851e2b33-e94b-44d1-b353-141f23e3c0d4/lcm.svg",
        'card_hidden_image_url': game.card_hidden_image.url if game.card_hidden_image else '',
        'card_back_image_url': game.card_back_image.url if game.card_back_image else '',
        'card_aspect_ratio': game.card_aspect_ratio,
        'card_front_background_color': game.card_front_background_color,
        'card_width': game.card_width,
        'copyright_notice': game.copyright_notice,
        'navbar_color': game.color,
        'mode': 'MEMORY_GAME',
    }


@never_cache
def memory_game_detail(request, id):
    game = get_object_or_404(MemoryGame, pk=id)
    gdl = GridDifficultyLevel.objects.filter(game=game)
    if request.headers.get('Accept') == 'application/json':
        return JsonResponse({
            'id': game.id,
            'name': game.name,
            'image_set_url': reverse('image_set_detail', args=[game.image_set.id]),
            'difficulty_levels': [{'name': do.difficulty_level.name,
                                   'rows': do.difficulty_level.rows,
                                   'columns': do.difficulty_level.columns} for do in gdl]
        })
    else: # For browsers
        return render(request, 'django_jigsaw_puzzle/jigsaw_puzzle.html',
                      memory_game_context(game))


def _get_thumbnail(image, alias_name):
    tn_db = ThumbnailOption.objects.get(name=alias_name)
    tnl = get_thumbnailer(image)
    if tn_db:
        return tnl.get_thumbnail(tn_db.as_dict)
    elif alias_name in tnl:
        return tnl[alias_name]


def image_set_detail(request, id):
    thumbnail_alias_str = request.GET.get('thumbnail_alias')
    if thumbnail_alias_str:
        thumbnail_alias = thumbnail_alias_str.split(',')
    else:
        thumbnail_alias = []

    imset = get_object_or_404(ImageSet, pk=id)
    images = ImageSetImage.objects.filter(image_set=imset)
    resp_json = {}
    for i in images:
        resp_json[i.id] = {'original': i.image.url}

        for ta in thumbnail_alias:
            tn = _get_thumbnail(i.image, ta)
            resp_json[i.id][ta] = tn.url

    return JsonResponse(resp_json)

def paint_game_context(game):
    return {
        'mode': 'PAINT_GAME',
    }
