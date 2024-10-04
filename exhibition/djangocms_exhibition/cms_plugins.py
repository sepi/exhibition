from cms.plugin_base import CMSPluginBase
from cms.plugin_pool import plugin_pool
from cms.models.pluginmodel import CMSPlugin
from cms.models import Page

from django.utils.translation import gettext_lazy as _
from .models import ExhibitionObject

import qrcode
import qrcode.image.svg

@plugin_pool.register_plugin
class ExhibitionObjectPlugin(CMSPluginBase):
    model = ExhibitionObject
    name = _('Exhibition Object')
    render_template = 'djangocms_exhibition/exhibition_object_plugin.html'
    cache = True
    allow_children = True
    require_parent = False
    parent_classes = []
    child_classes = ['PicturePlugin']
    module = _('Exhibition')

    def render(self, context, instance, placeholder):
        context = super().render(context, instance, placeholder)
        return context

@plugin_pool.register_plugin
class PageQRCodePlugin(CMSPluginBase):
    model = CMSPlugin
    name = _('Page QRCode')
    render_template = 'djangocms_exhibition/page_qrcode_plugin.html'
    cache = True
    module = _('Exhibition')

    def render(self, context, instance, placeholder):
        context = super().render(context, instance, placeholder)

        request = context['request']
        page_url = request.current_page.get_absolute_url()
        full_url = request.build_absolute_uri(page_url)
        img = qrcode.make(full_url,
                          image_factory=qrcode.image.svg.SvgImage,
                          error_correction=qrcode.ERROR_CORRECT_H,
                          box_size=20)
        context['page_url'] = full_url
        context['qrcode_svg'] = img.to_string().decode('UTF-8')

        return context

@plugin_pool.register_plugin
class AllPageQRCodePlugin(CMSPluginBase):
    model = CMSPlugin
    name = _('All Page QRCode')
    render_template = 'djangocms_exhibition/all_page_qrcode_plugin.html'
    module = _('Exhibition')

    def render(self, context, instance, placeholder):
        context = super().render(context, instance, placeholder)

        qrcode_objs = []
        for page in Page.objects.public():
            page_url = page.get_absolute_url()
            request = context['request']
            full_url = request.build_absolute_uri(page_url)
            img = qrcode.make(full_url,
                              image_factory=qrcode.image.svg.SvgPathImage,
                              error_correction=qrcode.ERROR_CORRECT_H,
                              box_size=20)
            obj = {
                'url': full_url,
                'title': page.get_title(),
                'svg': img.to_string().decode('UTF-8')
            }
            qrcode_objs.append(obj)

        context['qrcode_objs'] = qrcode_objs

        return context
