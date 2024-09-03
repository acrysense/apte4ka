/**
 * Карта объектов аптек
 */
(function(w){
	var PMap = function(center){
		this.src = 'https://api-maps.yandex.ru/2.1/?apikey=486f8251-8bb4-4304-b28e-7c99d1b5322c&lang=ru_RU'
		this.center = center;

		this.main = document.querySelector('.brand');
		this.mapContainer = this.main.querySelector('#brand-map');
		this.icons = ['adel', 'dleki'];
		this.iconImageSize = [30,30];
		this.iconImageOffset = [-15,-30];
		this.objects = places;
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
				self.mapObject = new maps.Map('brand-map', {
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
				iconImageHref: '../../local/templates/apte4ka/img/sprite.svg#icon-' + icon,
				iconImageSize: this.iconImageSize,
				iconImageOffset: this.iconImageOffset
			});
		})
	}

	function isMobileDevice() {
		return (typeof window.orientation !== "undefined") || (navigator.userAgent.indexOf('IEMobile') !== -1);
	}

	p.customBalloon = function () {

		this.customBalloonContentLayout = ymaps.templateLayoutFactory.createClass(
            `<div class="c-map-balloon">
                <div class="c-map-balloon__top">
                    <svg class="c-map-balloon__icon">
                        <use xlink:href="../../local/templates/apte4ka/img/sprite.svg#icon-{{ properties.name }}"></use>
                    </svg>
                    <div class="c-map-balloon__group">
                        <h4 class="c-map-balloon__title">{{ properties.hintContent }}</h4>
                    </div>
					<button class="c-map-balloon__close">
						<svg>
							<use xlink:href="../../local/templates/apte4ka/img/sprite.svg#icon-close"></use>
						</svg>
					</button>
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
			balloonAutoPan: isMobileDevice() ? false : true,
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

	p.mapUpdate = function (obj) {
		if(!this.mapContainer.classList.contains('loaded')) return;
		this.objectManager.removeAll();
		this.updateObjectManager(obj)
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

		this.mapContainer.addEventListener('click', function (event) {
			if (event.target.classList.contains('c-map-balloon__close') || event.target.closest('.c-map-balloon__close')) {
				event.preventDefault()

				self.mapObject.balloon.close()
			}
		})
	}

	w.PMap = PMap;
})(window);