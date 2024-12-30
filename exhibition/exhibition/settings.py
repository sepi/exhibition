import os 
from pathlib import Path

from django.utils.log import DEFAULT_LOGGING
from django.utils.translation import gettext_lazy as _

from configurations import Configuration, values

PROJECT_NAME = "exhibition"
BASE_DIR = Path(__file__).resolve().parent.parent.parent

class Common(Configuration):
    SITE_DIR = Path(BASE_DIR / PROJECT_NAME)
    VAR_DIR = Path(BASE_DIR)

    ALLOWED_HOSTS = []

    INSTALLED_APPS = [
        'constance',
        'djangocms_admin_style',
        'django.contrib.auth',
        'django.contrib.contenttypes',
        'django.contrib.sessions',
        'django.contrib.admin',
        'django.contrib.sites',
        'django.contrib.sitemaps',
        'django.contrib.staticfiles',
        'django.contrib.messages',
        'djangocms_picture',
        'djangocms_icon',
        'djangocms_text_ckeditor',
        'import_export',
        'cms',
        'menus',
        'sekizai',
        'treebeard',
        'easy_thumbnails',
        'filer',
        'exhibition',
        'djangocms_exhibition',
        'django_jigsaw_puzzle',
    ]

    MIDDLEWARE = [
        'django.middleware.cache.UpdateCacheMiddleware',
                    
        'cms.middleware.utils.ApphookReloadMiddleware',
        'django.contrib.sessions.middleware.SessionMiddleware',
        'django.middleware.csrf.CsrfViewMiddleware',
        'django.contrib.auth.middleware.AuthenticationMiddleware',
        'django.contrib.messages.middleware.MessageMiddleware',
        'django.middleware.locale.LocaleMiddleware',
        'django.middleware.common.CommonMiddleware',
        'django.middleware.clickjacking.XFrameOptionsMiddleware',
        'cms.middleware.user.CurrentUserMiddleware',
        'cms.middleware.page.CurrentPageMiddleware',
        'cms.middleware.toolbar.ToolbarMiddleware',
        'cms.middleware.language.LanguageCookieMiddleware',
        
        'django.middleware.cache.FetchFromCacheMiddleware',
    ]

    ROOT_URLCONF = 'exhibition.urls'

    @property
    def TEMPLATES(self):
        return [
            {
                'BACKEND': 'django.template.backends.django.DjangoTemplates',
                'DIRS': [self.SITE_DIR / 'exhibition' / 'templates'],
                'OPTIONS': {
                    'context_processors': [
                        'constance.context_processors.config',
                        'django.contrib.auth.context_processors.auth',
                        'django.contrib.messages.context_processors.messages',
                        'django.template.context_processors.i18n',
                        'django.template.context_processors.debug',
                        'django.template.context_processors.request',
                        'django.template.context_processors.media',
                        'django.template.context_processors.csrf',
                        'django.template.context_processors.tz',
                        'sekizai.context_processors.sekizai',
                        'django.template.context_processors.static',
                        'cms.context_processors.cms_settings'
                    ],
                    'loaders': [
                        'django.template.loaders.filesystem.Loader',
                        'django.template.loaders.app_directories.Loader'
                    ],
                },
            },
        ]

    WSGI_APPLICATION = 'exhibition.wsgi.application'

    @property
    def DATABASES(self):
        return  {
            'default': {
                'ENGINE': 'django.db.backends.sqlite3',
                'NAME': self.VAR_DIR / 'db' / 'db.sqlite3',
            }
        }
    
    AUTH_PASSWORD_VALIDATORS = [
        {
            'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
        },
        {
            'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
        },
        {
            'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
        },
        {
            'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
        },
    ]

    LOGOUT_REDIRECT_URL = '/'

    LANGUAGE_CODE = 'en'
    
    LANGUAGES = (
        ('en', _('en')),
    )

    ## ----------------- CMS ---------------
    CMS_LANGUAGES = {
        ## Customize this
        1: [
            {
                'code': 'en',
                'name': _('en'),
                'redirect_on_fallback': True,
                'public': True,
                'hide_untranslated': False,
            },
        ],
        'default': {
            'redirect_on_fallback': True,
            'public': True,
            'hide_untranslated': False,
        },
    }

    CMS_PLACEHOLDER_CONF = {}

    CMS_TEMPLATES = (
        ('fullwidth.html', 'Fullwidth'),
        ('empty.html', 'Empty (no navigation)'),
    )

    CMS_PERMISSION = False

    TEXT_INLINE_EDITIN = True

    ## --------------- end CMS ---------------

    # CMS Sidebar
    X_FRAME_OPTIONS = 'SAMEORIGIN'

    TIME_ZONE = 'UTC'    

    USE_I18N = True
    USE_L10N = True
    USE_TZ = True

    STATIC_URL = "/static/"

    SITE_ID = 1

    MEDIA_URL = "/media/"

    @property
    def MEDIA_ROOT(self):
        return str(self.VAR_DIR / "media")

    CONSTANCE_BACKEND='constance.backends.database.DatabaseBackend'

    CONSTANCE_ADDITIONAL_FIELDS = {
        'color_field': ['django.forms.fields.CharField', {
            'widget': 'django.forms.TextInput',
            'widget_kwargs': {'attrs': {'type': "color"}}
        }],
        'light_dark': ['django.forms.fields.ChoiceField', {
            'widget': 'django.forms.Select',
            'choices': (("light", "Light"), ("dark", "Dark"))
        }],
    }
    
    CONSTANCE_CONFIG={
        'CATALOG_SITE_NAME': ("catalog", _("The name used in urls behind the / in order to identify which catalog to show.")),
        'NAVBAR_BACKGROUND_COLOR': ("#ffffff", _("The color of the background of the top navigation bar as a string you can use in css, eg. '#000000' for black or 'red'."), 'color_field'),
        'NAVBAR_BACKGROUND_TYPE': ("light", _("Selects how the navigation button and link colors are set. If the background color is light, select light here, if it's dark, select dark."), 'light_dark')
    }

class Dev(Common):
    DEBUG = True    
    SECRET_KEY = "-ir%hxck9q_--em=$@@dpkfrv=9x*_ox#itig!7duq*!_5q=3a"

    STATIC_ROOT = BASE_DIR / "exhibition" / "static"

class Prod(Common):
    INSTANCE = os.environ.get('DJANGO_INSTANCE', 'default')
    DOTENV = Path(f'/usr/local/etc/django/{INSTANCE}/.env')

    ALLOWED_HOSTS = ['museo.pro', '.museo.pro']
    DEBUG = False
    SECRET_KEY = values.SecretValue()

    SITE_DIR = Path(f'/usr/local/share/django/{PROJECT_NAME}/venv/lib/python3.11/site-packages/')
    VAR_DIR = Path(f'/var/local/django/{INSTANCE}')

    STATIC_ROOT = SITE_DIR / f'{PROJECT_NAME}_static' / 'static'

    # Override these in .env-file
    EMAIL_HOST = values.Value('localhost')
    EMAIL_PORT = values.Value('25')
    EMAIL_HOST_USER = values.Value('')
    EMAIL_HOST_PASSWORD = values.Value('')
    EMAIL_USE_TLS= values.BooleanValue(True)

    # Remove the filter that disables console output on DEBUG=False
    @property
    def LOGGING(self):
        logging = DEFAULT_LOGGING
        logging['handlers']['console']['filters'] = []
        return logging
    
