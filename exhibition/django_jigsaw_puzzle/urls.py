from django.urls import include, path

from .views import jigsaw_puzzle_list, jigsaw_puzzle_detail, memory_game_detail, image_set_detail

urlpatterns = [
    # path("", JigsawPuzzleView.as_view()),
    path("jigsaw_puzzle/", jigsaw_puzzle_list, name='jigsaw_puzzle_list'),
    path("jigsaw_puzzle/<int:id>/", jigsaw_puzzle_detail, name='jigsaw_puzzle_detail'),
    path("memory_game/<int:id>/", memory_game_detail, name='memory_game_detail'),
    path("image_set/<int:id>/", image_set_detail, name='image_set_detail'),
]
