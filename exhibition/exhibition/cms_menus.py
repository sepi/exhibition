from cms.toolbar_base import CMSToolbar
from cms.toolbar_pool import toolbar_pool

from cms.utils.urlutils import admin_reverse

from django.utils.translation import gettext_lazy as _

class ExhibitionToolbar(CMSToolbar):
    def populate(self):
        menu = self.toolbar.get_or_create_menu(
            key='exhibitioncms_objects',
            verbose_name=_('Exhibition')
        )

        menu.add_sideframe_item(
            name=_('Rooms/Pages'),
            url=admin_reverse('cms_page_changelist')
        )

        menu.add_sideframe_item(
            name=_('Objects'),
            url=admin_reverse('djangocms_exhibition_exhibitionobject_changelist')
        )

toolbar_pool.register(ExhibitionToolbar)
