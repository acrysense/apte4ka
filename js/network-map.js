/**
 * Карта объектов аптек
 */
(function(w){
	var PMap = function(center){
		this.src = 'https://api-maps.yandex.ru/2.1/?apikey=486f8251-8bb4-4304-b28e-7c99d1b5322c&lang=ru_RU'
		this.center = center;

		this.main = document.querySelector('.pharmacy-list-frame');
		this.mapContainer = this.main.querySelector('#pharmacy-map');
		this.filterPharmacy = this.main.querySelectorAll('[data-pharmacy], .pharmacy-list-sort__select--brand select');
		this.icons = ['adel', 'dleki'];
		this.iconImageSize = [30,30];
		this.iconImageOffset = [-15,-30];
		this.objects = places;
		this.filterPharmacyData = '';
		this.newObjects = {};
		this.map = {};
		this.mapObject = {};

		this.addListeners();
        this.addYamapsScript();

	};

	var p = PMap.prototype;

	p.each = function(items, callback){
		[].forEach.call(items, callback);
	}

	p.initMap = function(){
		var self = this;
		this.map = new ymaps
			.load()
			.then(maps => {
				self.mapObject = new maps.Map('pharmacy-map', {
					center: self.center,
					zoom: 11,
					controls: []
				})

				var zoomControl = new maps.control.ZoomControl({options: { position: { right: 15, top: 15 }}}); 

				self.mapObject.controls.add(zoomControl);

				self.mapObject.behaviors.disable('scrollZoom')

				if (window.innerWidth <= 1023) {
					self.mapObject.behaviors.disable('drag')
				}

				var ctrlKey = false;

				// Обрабатываем нажатие на Ctrl
				$(document).keydown(function(e) {
					if (e.which === 17 && !ctrlKey) { // Ctrl нажат: включаем масштабирование мышью
						ctrlKey = true;
						self.mapObject.behaviors.enable('scrollZoom');
					}
				});
				$(document).keyup(function(e) { // Ctrl не нажат: выключаем масштабирование мышью
					if (e.which === 17) {
						ctrlKey = false;
						self.mapObject.behaviors.disable('scrollZoom');
					}
				});

				self.mapContainer.classList.add('loaded')

				self.addIcon();
				self.initObjectsManager();
				self.customBalloon();

				if($.isEmptyObject(self.newObjects)) {
					self.updateObjectManager(self.objects);
					return;
				}

				self.updateObjectManager(self.newObjects);

			}).catch(error => console.log(error));
	}

	p.addIcon = function () {
		this.icons.forEach(icon => {
			ymaps.option.presetStorage.add(`icon#${icon}`, {
				iconLayout: 'default#image',
				iconImageHref: 'img/sprite.svg#icon-' + icon,
				iconImageSize: this.iconImageSize,
				iconImageOffset: this.iconImageOffset
			});
		})
	}

	p.customBalloon = function () {

		this.customBalloonContentLayout = ymaps.templateLayoutFactory.createClass(
            `<div class="c-map-balloon">
                <div class="c-map-balloon__top">
                    <svg class="c-map-balloon__icon">
                        <use xlink:href="img/sprite.svg#icon-{{ properties.name }}"></use>
                    </svg>
                    <div class="c-map-balloon__group">
                        <h4 class="c-map-balloon__title">{{ properties.hintContent }}</h4>
                    </div>
                </div>
                <p class="c-map-balloon__description">{{ properties.location }}</p>
                <div class="c-map-balloon__columns">
                    <div class="c-map-balloon__column">
                        <h4 class="c-map-balloon__subtitle">График работы</h4>
                        <ul class="c-map-balloon__list">
                            {% for time in properties.workTime %}
                                <li class="c-map-balloon__list-item">{{ time }}</li>
                            {% endfor %}
                        </ul>
                    </div>
                    <div class="c-map-balloon__column">
                        <h4 class="c-map-balloon__subtitle">Телефоны</h4>
                        <ul class="c-map-balloon__list">
                            {% for phone in properties.phones %}
                                <li class="c-map-balloon__list-item">{{ phone }}</li>
                            {% endfor %}
                        </ul>
                    </div>
                </div>
            </div>`
		);

		this.objectManager.objects.options.set({
			balloonContentLayout: this.customBalloonContentLayout,
            balloonMaxWidth: 360,
			balloonMinWidth: 360,
		});
	}

	p.initObjectsManager = function(){
		this.objectManager = new ymaps.ObjectManager({
			clusterize: true,
			geoObjectOpenBalloonOnClick: true,
			clusterOpenBalloonOnClick: false
		});
		this.mapObject.geoObjects.add(this.objectManager);
	}

	p.updateObjectManager = function (obj) {
		this.objectManager.add(obj)
	}

	p.fetchObj = async function () {
		const response = await fetch(this.json)
		this.objects = await response.json()
	}

	p.filterBtnActive = function (el) {
		$(el).parent().addClass('is--active').siblings().removeClass('is--active')
	}

	p.mapUpdate = function (obj) {
		if(!this.mapContainer.classList.contains('loaded')) return;
		this.objectManager.removeAll();
		this.updateObjectManager(obj)
	}

	p.filter = function (){
		const filter = {
			type: this.filterPharmacyData,
		}
		this.newObjects.type = "FeatureCollection"
		this.newObjects.features = this.objects.features.filter(obj => {
			if (filter.type) {
				return obj.type === filter.type
			} else if (!filter.type) {
				return true
			}
		});
		this.mapUpdate(this.newObjects);
	}

	p.addYamapsScript = function () {
		const self = this;
		this.init = false

		if (!self.mapContainer.classList.contains('js--loaded')) {
			self.mapContainer.classList.add('js--loaded');
		}

		if (!this.init) {
			if (typeof ymaps === "undefined") {
				let js = document.createElement('script');
				js.src = self.src;
				document.getElementsByTagName('head')[0].appendChild(js);
				js.onload = function() {
					self.initMap()
				};
			}
			this.init = true
		}
	}

	p.addListeners = function (){
		var self = this;

		this.filterPharmacy.forEach(item => {
			item.addEventListener('click', function () {
                self.filterBtnActive(this)
                if (this.dataset.pharmacy === 'all') {
                    self.filterPharmacyData = ''
                } else {
                    self.filterPharmacyData = this.dataset.pharmacy
                }
				self.filter()
			})

			item.addEventListener('change', function () {
                if (item.value === 'all') {
                    self.filterPharmacyData = ''
                } else {
                    self.filterPharmacyData = item.value
                }
				self.filter()
			})
		})
	}

	w.PMap = PMap;
})(window);