host='webbeast'
instance_name=museo.pro
app_name=exhibition
ifeq ($(CLOBBER_SETTINGS), 1)
	settings_mv_params=
else
	settings_mv_params=-n
endif

.ONESHELL:

.PHONY: all
all: 
	make build
	make install

.PHONY: build
build :
	. venv/bin/activate
#	cd $(app_name) && ./manage.py compilescss ; cd -
	cd $(app_name) && ./manage.py collectstatic --no-input ; cd - # --ignore=*.scss
	python3 -m build

.PHONY: install
install :
	scp nginx.conf $(app_name)*.service $(app_name)*.timer $(host):/tmp
# Per application
	ssh $(host) " \
sudo mkdir -p /usr/local/share/django/$(app_name) ;\
sudo mv $(settings_mv_params) /tmp/$(app_name)*.service /tmp/$(app_name)*.timer /etc/systemd/system/ ;\
"
# Per site
	ssh $(host) ' \
sudo mkdir -p /usr/local/etc/django/$(instance_name) ;\
sudo mkdir -p /var/local/django/$(instance_name)/db ;\
sudo mkdir -p /var/local/django/$(instance_name)/media ;\
sudo mv $(settings_mv_params) /tmp/nginx.conf /etc/nginx/sites-available/$(instance_name) ;\
sudo systemctl daemon-reload ; \
sudo systemctl enable $(app_name)@$(instance_name).service ; \
sudo systemctl start $(app_name)@$(instance_name).service  ; \
sudo systemctl enable $(app_name)-mail@$(instance_name).service ;\
sudo systemctl start $(app_name)-mail@$(instance_name).timer ;\
sudo ln -s /etc/nginx/sites-{available,enabled}/$(instance_name) || true ;\
cd /usr/local/share/django/$(app_name) && sudo python3 -m venv venv'


.PHONY: update
update :
	scp $$(ls -tp dist/*.whl | grep -v /$$ | head -n1) $(host):/tmp/
	ssh $(host) 'sudo /usr/local/bin/django-install $$(ls -tp /tmp/*.whl | grep -v /$$ | head -n1) /usr/local/share/django/$(app_name)/ $(app_name) $(instance_name)'
