from django.urls import path

from .views import (image_set_detail, image_upload,
                    jigsaw_puzzle_list, jigsaw_puzzle_detail,
                    memory_game_detail,
                    paint_game_detail,
                    quiz_game_list, quiz_game_detail,
                    game_session_start, game_session_end, game_session_statistics,
                    quiz_question_answer)

urlpatterns = [
    # path("", JigsawPuzzleView.as_view()),
    path("jigsaw_puzzle/", jigsaw_puzzle_list, name='jigsaw_puzzle_list'),
    path("jigsaw_puzzle/<int:id>/", jigsaw_puzzle_detail, name='jigsaw_puzzle_detail'),

    path("memory_game/<int:id>/", memory_game_detail, name='memory_game_detail'),

    path("paint_game/<int:id>/", paint_game_detail, name='paint_game_detail'),

    path("quiz_game/", quiz_game_list, name='quiz_game_list'),
    path("quiz_game/<int:id>/", quiz_game_detail, name='quiz_game_detail'),
    path("quiz_question/<int:question_id>/answer/<int:answer_choice>/", quiz_question_answer, name='quiz_question_answer'),

    # URLs supporting image based games
    path("image_set/<int:id>/", image_set_detail, name='image_set_detail'),
    path("image_upload", image_upload, name='image_upload'),

    path("session/start/<int:game_id>/", game_session_start, name='game_session_start'),
    path("session/end/", game_session_end, name='game_session_end'),
    path("session/<str:game_session_id>/statistics/", game_session_statistics, name='game_session_statistics'),
]
