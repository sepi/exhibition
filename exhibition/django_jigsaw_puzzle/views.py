import json

import qrcode
import qrcode.image.svg
from constance import config
from django.contrib.auth.models import User
from django.http import JsonResponse
from django.shortcuts import get_object_or_404, render
from django.urls import reverse
from django.views.decorators.cache import never_cache
from django.views.decorators.csrf import csrf_exempt
from django.db.models import Sum, Count

from easy_thumbnails.files import get_thumbnailer

from filer.admin.clipboardadmin import ajax_upload
from filer.models.filemodels import File
from filer.models.thumbnailoptionmodels import ThumbnailOption

from .models import (GridDifficultyLevel, ImageSet, ImageSetImage,
                     JigsawPuzzle,
                     MemoryGame,
                     PaintGame,
                     QuizGame, QuizQuestion,
                     GameSession, GameSessionPartialResult)


@never_cache
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


@never_cache
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
        return render(request, 'django_jigsaw_puzzle/memory_game.html',
                      memory_game_context(game))


def _get_thumbnail(image, alias_name):
    tn_db = ThumbnailOption.objects.get(name=alias_name)
    tnl = get_thumbnailer(image)
    if tn_db:
        return tnl.get_thumbnail(tn_db.as_dict)
    elif alias_name in tnl:
        return tnl[alias_name]


@never_cache
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
        'allow_take_home': game.allow_take_home,
        'idle_first_seconds': game.idle_first_seconds,
        'idle_second_seconds': game.idle_second_seconds,
        'color_count_gray': game.color_count_gray,
        'color_count_skin': game.color_count_skin,
        'color_count_hue': game.color_count_hue,
        'color_count_brightness': game.color_count_brightness,
    }


@never_cache
def paint_game_detail(request, id):
    game = get_object_or_404(PaintGame, pk=id)
    if request.headers.get('Accept') == 'application/json':
        return JsonResponse({
            'id': game.id,
            'name': game.name,
        })
    else: # For browsers
        return render(request, 'django_jigsaw_puzzle/paint_game.html',
                      paint_game_context(game))


@never_cache
def quiz_game_list(request):
    if request.headers.get('Accept') == 'application/json':
        qgs = QuizGame.objects.all()
        return JsonResponse([{'name': qg.name,
                              'id': qg.id,
                              'url': reverse('quiz_game_detail', args=[qg.id])}
                             for qg in qgs], safe=False)
    else: # For browsers
        return render(request, 'django_jigsaw_puzzle/quiz_game.html',
                      {
                          'mode': 'QUIZ_GAME',
                          'index_url': '/games/quiz_game/',
                          'title': 'Quiz game',
                          'game_id': None
                      })


def quiz_game_context(game):
    return {
        'mode': 'QUIZ_GAME',
        'index_url': '/games/quiz_game/',
        'title': game.name,
        'game_id': game.id,
    }


@never_cache
def quiz_game_detail(request, id):
    game = get_object_or_404(QuizGame, pk=id)
    questions = list(QuizQuestion.objects.filter(game=game.id))

    if request.headers.get('Accept') == 'application/json':
        return JsonResponse({
            'id': game.id,
            'name': game.name,
            'questions': [{
                "id": q.id,
                "question": q.question,
                "answer_1": q.answer_1,
                "correct_1": q.correct_1,
                "answer_2": q.answer_2,
                "correct_2": q.correct_2,
                "answer_3": q.answer_3,
                "correct_3": q.correct_3,
                "answer_4": q.answer_4,
                "correct_4": q.correct_4,
            } for q in questions]
        })
    else: # For browsers
        return render(request, 'django_jigsaw_puzzle/quiz_game.html',
                      quiz_game_context(game))


@csrf_exempt
def game_session_start(request, game_id):
    '''Create a game session and return its id or return existing game session'''
    if request.method == 'POST':
        game_session_id = request.session.get('game_session_id')
        
        if game_session_id:
            game_session = get_object_or_404(GameSession, session_id=game_session_id)
        else:
            game_session = GameSession.objects.create(ongoing=True, game_id=game_id)
            request.session['game_session_id'] = str(game_session.session_id)
    
        return JsonResponse({
            'game_session_id': str(game_session.session_id)
        })
    

@csrf_exempt
def game_session_end(request):
    if request.method == 'POST':
        game_session_id = request.session.get('game_session_id')
    
        if game_session_id:
            game_session = get_object_or_404(GameSession, session_id=game_session_id)
            del request.session['game_session_id']
            game_session.ongoing = False
            game_session.save()
            return JsonResponse({'status': 'ended'})
    

def quiz_question_score(question, answer_choice):
    match answer_choice:
        case 1: return question.correct_1
        case 2: return question.correct_2
        case 3: return question.correct_3
        case 4: return question.correct_4

    
@csrf_exempt
def quiz_question_answer(request, question_id, answer_choice):
    if request.method == 'POST':
        game_session_id = request.session.get('game_session_id')
        
        if game_session_id:
            game_session = get_object_or_404(GameSession, session_id=game_session_id)
            question = get_object_or_404(QuizQuestion, pk=question_id)

            score = quiz_question_score(question, answer_choice)
            partial_result = GameSessionPartialResult.objects.create(game_session=game_session,
	                                                             question=question,
	                                                             result_number=score)
            partial_result.save()
            return JsonResponse({'result_number': score})
    

@csrf_exempt
def game_session_statistics(request, game_session_id):
    game_session = get_object_or_404(GameSession, session_id=game_session_id)

    # Score and count
    game = game_session.game # An instance of Game superclass, not QuizGame
    quiz_game = QuizGame.objects.get(pk=game.id)
    question_count = quiz_game.questions.count()
    agg = GameSessionPartialResult.objects \
                                  .filter(game_session_id=game_session_id) \
                                  .aggregate(answer_sum=Sum('result_number', default=0))
    question_correct = agg['answer_sum']
    score = question_correct / question_count

    # Histogram base query
    qs = GameSession.objects.annotate(
        answer_correct=Sum("partial_results__result_number"),
        answer_count=Count("partial_results"),
        score=Sum("partial_results__result_number") / Count("partial_results")
    )

    # Generate histogram
    bin_count = 7
    hist = []
    for i in range(0, bin_count):
        mn = i / bin_count
        mx = (i + 1) / bin_count
        result = {
            'from': mn,
            'to': mx,
            'count': qs.filter(score__gt=mn, score__lte=mx).count()
        }
        hist.append(result)

    return JsonResponse({
        'question_count': question_count,
        'question_correct': question_correct,
        'score': score,
        'histogram': hist,
        'game_session_id': game_session_id
    })


# FIXME: Would be nice to use CSRF. The clients sends it but it will be out of date at some point, or not?
@csrf_exempt
def image_upload(request):
    folder_id = getattr(config, 'JIGSAW_PUZZLE_UPLOAD_DIRECTORY_ID', None)
    if folder_id == 0: # Constance can't have None as default
        folder_id = None

    # We fake the user who is uploading if none is present so we can
    # actually create files.
    if not request.user.is_staff:
        user_id = getattr(config, 'JIGSAW_PUZZLE_UPLOADER_USER_ID', None)
        request.user = User.objects.filter(id=user_id)[0] 


    # check if there is already a file with same name. If so, delete if first
    upload = list(request.FILES.values())[0]
    filename = upload.name
    maybe_file = File.objects.filter(folder__id=folder_id, original_filename=filename)
    if (len(maybe_file) != 0):
        for f in maybe_file:
            f.delete()

    res = ajax_upload(request, folder_id=folder_id)
    res_data = json.loads(res.content.decode("utf-8"))

    if 'error' in res_data:
        raise Exception("Can't upload. Make sure you have an uploading user in the system and constance JIGSAW_PUZZLE_UPLOADER_USER_ID set", res_data)

    # Add a QR-Code pointing to image (as svg) to response
    factory = qrcode.image.svg.SvgPathImage
    full_url = request.build_absolute_uri(res_data['original_image'])
    img = qrcode.make(full_url, image_factory=factory)
    res_data['qr_code_svg'] = img.to_string().decode()

    return JsonResponse(res_data)

