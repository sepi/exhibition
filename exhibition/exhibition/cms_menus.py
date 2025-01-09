from cms.toolbar_base import CMSToolbar
from cms.toolbar_pool import toolbar_pool

from cms.utils.urlutils import admin_reverse

from django.utils.translation import gettext_lazy as _

class ExhibitionCMSToolbar(CMSToolbar):
    def populate(self):
        menu = self.toolbar.get_or_create_menu(
            key='exhibitioncms_objects',
            verbose_name=_('museo.pro/cms')
        )

        menu.add_sideframe_item(
            name=_('Rooms/Pages'),
            url=admin_reverse('cms_page_changelist')
        )

        menu.add_sideframe_item(
            name=_('Exhibition Objects'),
            url=admin_reverse('djangocms_exhibition_exhibitionobject_changelist')
        )

        menu.add_sideframe_item(
            name=_('CMS Configuration'),
            url=admin_reverse('constance_config_changelist')
        )


class GamesToolbar(CMSToolbar):
    def populate(self):
        menu = self.toolbar.get_or_create_menu(
            key='django_jigsaw_puzzle',
            verbose_name=_('museo.pro/games')
        )

        menu.add_sideframe_item(
            name=_('Jigsaw puzzles'),
            url=admin_reverse('django_jigsaw_puzzle_jigsawpuzzle_changelist')
        )

        menu.add_sideframe_item(
            name=_('Memory games'),
            url=admin_reverse('django_jigsaw_puzzle_memorygame_changelist')
        )

        menu.add_sideframe_item(
            name=_('Difficulty levels'),
            url=admin_reverse('django_jigsaw_puzzle_difficultylevel_changelist')
        )

        menu.add_sideframe_item(
            name=_('Image sets'),
            url=admin_reverse('django_jigsaw_puzzle_imageset_changelist')
        )


toolbar_pool.register(ExhibitionCMSToolbar)
toolbar_pool.register(GamesToolbar)
