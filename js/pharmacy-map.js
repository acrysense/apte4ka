/**
 * Карта объектов аптек
 */
(function(w){
	var PMap = function(center){
		this.src = 'https://api-maps.yandex.ru/2.1/?apikey=486f8251-8bb4-4304-b28e-7c99d1b5322c&lang=ru_RU'
		this.center = center;

		this.main = document.getElementById('pharmacy-list');
		this.trigger = document.querySelectorAll('.pharmacy-list-trigger')
		this.editAddress = document.querySelectorAll('.pharmacy-list-edit-address')
		this.mapContainer = this.main.querySelector('#pharmacy-map');
		this.filterPharmacy = this.main.querySelectorAll('[data-pharmacy], .pharmacy-list-sort__select--brand select');
		this.filterStock = this.main.querySelectorAll('[data-stock], .pharmacy-list-sort__select--stock select');
		this.filterArea = this.main.querySelectorAll('[data-area], .pharmacy-list-sort__select--area select');
		this.showMap = this.main.querySelector('.pharmacy-list__switch');
		this.search = this.main.querySelector('.pharmacy-list-filter__input');
		this.list = this.main.querySelector('.pharmacy-list__wrapper');
		this.clear = this.main.querySelector('.pharmacy-list__close');
		this.icons = ['adel', 'dleki'];
		this.iconImageSize = [30,30];
		this.iconImageOffset = [-15,-30];
		this.objects = places;
		this.filterPharmacyData = '';
		this.filterStockData = '';
		this.filterAreaData = '';
		this.newObjects = {};
		this.map = {};
		this.mapObject = {};

		this.listFilter(this.objects);
		this.addListeners();

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

	p.listHtml = function (item) {
		const icon = item.type
		const {...i} = item.properties

		this.works = [];
		for (const item of i.workTime) {
			this.works.push(`<li class="c-schedule__item"><span class="c-schedule__elem">${item}</span></li>`);
		}
		
		var items_count_str = '';
		for (var key in item.products) {
			items_count_str += key + ':' + item.products[key]+';';
		}

		this.tooltip = '';
		if (i.tooltipText) {
			this.tooltip = 
			`<div class="c-sm-info">
				<button class="c-sm-info__trigger">
					<svg class="c-sm-info__trigger-icon">
						<use xlink:href="../../local/templates/apte4ka/img/sprite.svg#icon-info-circle"></use>
					</svg>
				</button>
				<div class="c-sm-info__dropdown c-sm-info__dropdown--lg">
					<h4 class="c-sm-info__title c-sm-info__title--${i.stockColor}">${i.tooltipStatus}</h4>
					<p class="c-sm-info__text">${i.tooltipText}</p>
				</div>
			</div>`
		}

		if ($('.pharmacy-list').hasClass('custom_address')) {
			// console.log('custom')

			var current_product = document.querySelector('.pharmacy-list').dataset.addressFor
			var missing_items = i.missing;

			if (jQuery.inArray(String(current_product), missing_items) == -1) {
				this.itemHtml = `<div class="pharmacy-list-card pharmacy-list__item pharmacy-item">
					<div class="pharmacy-list-card__block">
						<span class="pharmacy-list-card__name pharmacy-name">
							<svg>
								<use xlink:href="../../local/templates/apte4ka/img/sprite.svg#icon-${icon}"></use>
							</svg>
							<span>${i.hintContent}</span>
						</span>
						<span class="pharmacy-list-card__help pharmacy-address">${i.location}</span>
						<a href="#" class="pharmacy-list-card__link pharmacy-list-card__link--mobile">Телефоны и график работы</a>
					</div>
					<div class="pharmacy-list-card__block">
						<div class="pharmacy-list-card__inner">
							<div class="pharmacy-list-card__schedule c-schedule">
								<span class="c-schedule__trigger">
									<span>${i.workTime[0]}</span>
									<span class="c-schedule__trigger-icon">
										<svg>
											<use xlink:href="../../local/templates/apte4ka/img/sprite.svg#icon-caret-sm"></use>
										</svg>
									</span>
								</span>
								<div class="c-schedule__dropdown">
									<ul class="c-schedule__list">
										${this.works.join('')}
									</ul>
								</div>
							</div>
							<a href="tel:${i.phones[0]}" class="pharmacy-list-card__phone">${i.phones[0]}</a>
						</div>
					</div>
					<div class="pharmacy-list-card__block">
						<div class="pharmacy-list-card__inner">
							<div class="pharmacy-list-card__group availability">
								<span class="pharmacy-list-card__status pharmacy-list-card__status--green">
									<span>В наличии</span>
								</span>
							</div>
							<a href="#" class="pharmacy-list-card__btn btn btn--light" data-stock="${i.delivery_date}" data-ost="${items_count_str}" data-missing="${i.missing}" data-ext-id=${i.ext} data-bitrix-id=${i.bitrix}>Выбрать</a>
						</div>
					</div>
				</div>`;
			} else {
				this.itemHtml = `<div class="pharmacy-list-card pharmacy-list__item pharmacy-item">
					<div class="pharmacy-list-card__block">
						<span class="pharmacy-list-card__name pharmacy-name">
							<svg>
								<use xlink:href="../../local/templates/apte4ka/img/sprite.svg#icon-${icon}"></use>
							</svg>
							<span>${i.hintContent}</span>
						</span>
						<span class="pharmacy-list-card__help pharmacy-address">${i.location}</span>
						<a href="#" class="pharmacy-list-card__link pharmacy-list-card__link--mobile">Телефоны и график работы</a>
					</div>
					<div class="pharmacy-list-card__block">
						<div class="pharmacy-list-card__inner">
							<div class="pharmacy-list-card__schedule c-schedule">
								<span class="c-schedule__trigger">
									<span>${i.workTime[0]}</span>
									<span class="c-schedule__trigger-icon">
										<svg>
											<use xlink:href="../../local/templates/apte4ka/img/sprite.svg#icon-caret-sm"></use>
										</svg>
									</span>
								</span>
								<div class="c-schedule__dropdown">
									<ul class="c-schedule__list">
										${this.works.join('')}
									</ul>
								</div>
							</div>
							<a href="tel:${i.phones[0]}" class="pharmacy-list-card__phone">${i.phones[0]}</a>
						</div>
					</div>
					<div class="pharmacy-list-card__block">
						<div class="pharmacy-list-card__inner">
							<div class="pharmacy-list-card__group availability">
								<span class="pharmacy-list-card__status pharmacy-list-card__status--red">
									<span>Нет в наличии</span>
								</span>
							</div>
							<a href="#" class="pharmacy-list-card__btn btn btn--light" data-stock="${i.delivery_date}" data-ost="${items_count_str}" data-missing="${i.missing}" data-ext-id=${i.ext} data-bitrix-id=${i.bitrix} disabled>Выбрать</a>
						</div>
					</div>
				</div>`;
			}
			// if (!(i.stockColor == 'yellow')) {
			// 	this.itemHtml = `<div class="pharmacy-list-card pharmacy-list__item">
			// 		<div class="pharmacy-list-card__block">
			// 			<span class="pharmacy-list-card__name">
			// 				<svg>
			// 					<use xlink:href="../../local/templates/apte4ka/img/sprite.svg#icon-${icon}"></use>
			// 				</svg>
			// 				<span>${i.hintContent}</span>
			// 			</span>
			// 			<span class="pharmacy-list-card__help">${i.location}</span>
			// 			<a href="#" class="pharmacy-list-card__link pharmacy-list-card__link--mobile">Телефоны и график работы</a>
			// 		</div>
			// 		<div class="pharmacy-list-card__block">
			// 			<div class="pharmacy-list-card__inner">
			// 				<div class="pharmacy-list-card__schedule c-schedule">
			// 					<span class="c-schedule__trigger">
			// 						<span>${i.workTime[0]}</span>
			// 						<span class="c-schedule__trigger-icon">
			// 							<svg>
			// 								<use xlink:href="../../local/templates/apte4ka/img/sprite.svg#icon-caret-sm"></use>
			// 							</svg>
			// 						</span>
			// 					</span>
			// 					<div class="c-schedule__dropdown">
			// 						<ul class="c-schedule__list">
			// 							${this.works.join('')}
			// 						</ul>
			// 					</div>
			// 				</div>
			// 				<a href="tel:${i.phones[0]}" class="pharmacy-list-card__phone">${i.phones[0]}</a>
			// 			</div>
			// 		</div>
			// 		<div class="pharmacy-list-card__block">
			// 			<div class="pharmacy-list-card__inner">
			// 				<div class="pharmacy-list-card__group availability">
			// 					<span class="pharmacy-list-card__status pharmacy-list-card__status--${i.stockColor}">
			// 						<span>${i.stockText}</span>
			// 						${this.tooltip}
			// 					</span>
			// 				</div>
			// 				<a href="#" class="pharmacy-list-card__btn btn btn--light" data-ost="${items_count_str}" data-missing="${i.missing}" data-ext-id=${i.ext} data-bitrix-id=${i.bitrix}>Выбрать</a>
			// 			</div>
			// 		</div>
			// 	</div>`;
			// } else {
			// 	this.itemHtml = ''
			// }
		} else {
			if (i.stockColor == 'red') {
				this.itemHtml = `<div class="pharmacy-list-card pharmacy-list__item pharmacy-item">
					<div class="pharmacy-list-card__block">
						<span class="pharmacy-list-card__name pharmacy-name">
							<svg>
								<use xlink:href="../../local/templates/apte4ka/img/sprite.svg#icon-${icon}"></use>
							</svg>
							<span>${i.hintContent}</span>
						</span>
						<span class="pharmacy-list-card__help pharmacy-address">${i.location}</span>
						<a href="#" class="pharmacy-list-card__link pharmacy-list-card__link--mobile">Телефоны и график работы</a>
					</div>
					<div class="pharmacy-list-card__block">
						<div class="pharmacy-list-card__inner">
							<div class="pharmacy-list-card__schedule c-schedule">
								<span class="c-schedule__trigger">
									<span>${i.workTime[0]}</span>
									<span class="c-schedule__trigger-icon">
										<svg>
											<use xlink:href="../../local/templates/apte4ka/img/sprite.svg#icon-caret-sm"></use>
										</svg>
									</span>
								</span>
								<div class="c-schedule__dropdown">
									<ul class="c-schedule__list">
										${this.works.join('')}
									</ul>
								</div>
							</div>
							<a href="tel:${i.phones[0]}" class="pharmacy-list-card__phone">${i.phones[0]}</a>
						</div>
					</div>
					<div class="pharmacy-list-card__block">
						<div class="pharmacy-list-card__inner">
							<div class="pharmacy-list-card__group availability">
								<span class="pharmacy-list-card__status pharmacy-list-card__status--${i.stockColor}">
									<span>${i.stockText}</span>
									${this.tooltip}
								</span>
							</div>
							<a href="#" class="pharmacy-list-card__btn btn btn--light" data-stock="${i.delivery_date}" data-ost="${items_count_str}" data-missing="${i.missing}" data-ext-id=${i.ext} data-bitrix-id=${i.bitrix} disabled>Выбрать</a>
						</div>
					</div>
				</div>`;
			} else {
				this.itemHtml = `<div class="pharmacy-list-card pharmacy-list__item pharmacy-item">
					<div class="pharmacy-list-card__block">
						<span class="pharmacy-list-card__name pharmacy-name">
							<svg>
								<use xlink:href="../../local/templates/apte4ka/img/sprite.svg#icon-${icon}"></use>
							</svg>
							<span>${i.hintContent}</span>
						</span>
						<span class="pharmacy-list-card__help pharmacy-address">${i.location}</span>
						<a href="#" class="pharmacy-list-card__link pharmacy-list-card__link--mobile">Телефоны и график работы</a>
					</div>
					<div class="pharmacy-list-card__block">
						<div class="pharmacy-list-card__inner">
							<div class="pharmacy-list-card__schedule c-schedule">
								<span class="c-schedule__trigger">
									<span>${i.workTime[0]}</span>
									<span class="c-schedule__trigger-icon">
										<svg>
											<use xlink:href="../../local/templates/apte4ka/img/sprite.svg#icon-caret-sm"></use>
										</svg>
									</span>
								</span>
								<div class="c-schedule__dropdown">
									<ul class="c-schedule__list">
										${this.works.join('')}
									</ul>
								</div>
							</div>
							<a href="tel:${i.phones[0]}" class="pharmacy-list-card__phone">${i.phones[0]}</a>
						</div>
					</div>
					<div class="pharmacy-list-card__block">
						<div class="pharmacy-list-card__inner">
							<div class="pharmacy-list-card__group availability">
								<span class="pharmacy-list-card__status pharmacy-list-card__status--${i.stockColor}">
									<span>${i.stockText}</span>
									${this.tooltip}
								</span>
							</div>
							<a href="#" class="pharmacy-list-card__btn btn btn--light" data-stock="${i.delivery_date}" data-ost="${items_count_str}" data-missing="${i.missing}" data-ext-id=${i.ext} data-bitrix-id=${i.bitrix}>Выбрать</a>
						</div>
					</div>
				</div>`;
			}
		}
		
		return this.itemHtml;
	}

	p.listArr = function (arr) {
		var self = this;
		this.list.innerHTML = '';
		if (arr.length > 0) {
			arr.forEach(item => {
				this.list.innerHTML += self.listHtml(item);
			});

			const elements = document.querySelectorAll('.pharmacy-list__item');
			const sorted = [...elements].sort((a, b) => {
				const priceElA = a.querySelector('.pharmacy-list-card__status');
				const priceElB = b.querySelector('.pharmacy-list-card__status');
				function getPrice(el) {
					if (el.classList.contains('pharmacy-list-card__status--green')) {
						return Number(1000000)
					} else if (el.classList.contains('pharmacy-list-card__status--yellow')) {
						return Number(el.querySelector('span').innerHTML.split(' ')[2])
					} else if (el.classList.contains('pharmacy-list-card__status--red')) {
						return Number(0)
					}
				};
				return getPrice(priceElB) - getPrice(priceElA);
			});
			const resultEl = document.querySelector('.pharmacy-list__wrapper');
			resultEl.innerHTML = null;
			sorted.forEach(el => resultEl.appendChild(el));
		} else {
			this.list.innerHTML = '<div class="pharmacy-list__not-found">Нет аптек для вашего населенного пункта. Измените город пожалуйста.</div>';
		}
	}

	p.listFilter = function (array) {
		this.listArr(array.features)
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
            `<div class="c-map-balloon pharmacy-item">
                <div class="c-map-balloon__top">
                    <svg class="c-map-balloon__icon">
                        <use xlink:href="../../local/templates/apte4ka/img/sprite.svg#icon-{{ properties.icon }}"></use>
                    </svg>
                    <div class="c-map-balloon__group">
                        <h4 class="c-map-balloon__title pharmacy-name">{{ properties.hintContent }}</h4>
                        <span class="c-map-balloon__status c-map-balloon__status--{{ properties.stockColor }}">{{ properties.stockText }}</span>

						{% if properties.stockVal %}
							<div class="c-map-balloon__values">
								<span class="c-map-balloon__value">Аптека: {{ properties.onPharmacyValue }} шт</span>
							</div>
						{% endif %}
                    </div>
					<button class="c-map-balloon__close">
						<svg>
							<use xlink:href="../../local/templates/apte4ka/img/sprite.svg#icon-close"></use>
						</svg>
					</button>
                </div>
                <p class="c-map-balloon__description pharmacy-address">{{ properties.location }}</p>
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
				<a href="#" class="c-map-balloon__btn btn" data-ost="{{ properties.products }}" data-missing="{{ properties.missing }}" data-ext-id='{{ properties.ext }}' data-bitrix-id={{ properties.bitrix }} {% if properties.stockColor == 'red' %} disabled {% endif %}>ЗАБРАТЬ ЗДЕСЬ</a>
            </div>`, {
				onCloseClick: function (e) {
						e.preventDefault();

						this.events.fire('userclose');
				},
		}
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

	p.stockUpdate = function () {
		this.objects.features.forEach(item => {
			var items_count_str = '';
			for (var key in item.products) {
				items_count_str += key + ':' + item.products[key]+';';
			}
			item.properties.products = items_count_str
		})
	}

	p.updateObjectManager = function (obj) {
		this.objectManager.add(obj)
	}

	p.fetchObj = async function () {
		const response = await fetch(this.json)
		this.objects = await response.json()
		this.listFilter(this.objects)
	}

	p.filterBtnActive = function (el) {
		$(el).parent().addClass('is--active').siblings().removeClass('is--active')
	}

	p.mapUpdate = function (obj) {
		if(!this.mapContainer.classList.contains('loaded')) return;
		this.objectManager.removeAll();
		this.updateObjectManager(obj)
	}

	p.filterID = function (id) {
		this.newObjects.type = "FeatureCollection"
		this.newObjects.features = this.objects.features.filter(obj => {
			if (obj.products[id] >= 1) {
				obj.properties.stockColor = "green";
				obj.properties.stockText = `В наличии`;
				obj.properties.tooltipText = false;
				obj.properties.stockVal = Math.floor(obj.products[id]);
				//obj.properties.products = JSON.stringify(obj.products);
				return true
			}
			return false
		})

		// console.log(this.newObjects)

		// this.filterStock.forEach(item => {
		// 	if (item.dataset.stock !== 'in-stock') {
		// 		item.style.display = 'none';
		// 	} else {
		// 		item.classList.add('is-active')
		// 	}
		// })

		//document.querySelector('[data-stock="partial"]')
		// console.log(this.newObjects)
		// console.log(this.objects)

		this.listFilter(this.newObjects)
		this.mapUpdate(this.newObjects);
	}

	p.id = function (id) {
		this.filterID(id)
	}

	p.filter = function (){
		const filter = {
			type: this.filterPharmacyData,
			stock: this.filterStockData,
			area: this.filterAreaData
		}
		// console.log(filter)
		this.newObjects.type = "FeatureCollection"
		this.newObjects.features = this.objects.features.filter(obj => {
			if (filter.type && filter.stock && filter.area) {
				// all
				return obj.type === filter.type && obj.stock === filter.stock && obj.area === filter.area
			} else if (filter.type && !filter.stock && !filter.area) {
				// type
				return obj.type === filter.type
			} else if (filter.type && filter.stock && !filter.area) {
				// type && stock
				return obj.type === filter.type && obj.stock === filter.stock
			} else if (filter.type && !filter.stock && filter.area) {
				// type && area
				return obj.type === filter.type && obj.area === filter.area
			} else if (!filter.type && filter.stock && !filter.area) {
				// stock
				return obj.stock === filter.stock
			} else if (!filter.type && filter.stock && filter.area) {
				// stock && area
				return obj.stock === filter.stock && obj.area === filter.area
			} else if (!filter.type && !filter.stock && filter.area) {
				// area
				return obj.area === filter.area
			} else if (!filter.type && !filter.stock && !filter.area) {
				// nothing
				return true
			}
		});
		this.listFilter(this.newObjects)
		this.mapUpdate(this.newObjects);
	}

	p.filterSearch = function (value) {
		this.newObjects.type = "FeatureCollection"
		this.newObjects.features = this.objects.features.filter(obj => {
			const {hintContent, location} = obj.properties
			const num = hintContent.toLowerCase()
			const loc = location.toLowerCase()

			if (num.indexOf(value) >= 0 || loc.indexOf(value) >= 0) {
				return true
			}
			return false
		})
		this.listFilter(this.newObjects)
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
				if(!$(this).parent().hasClass('is--active')) {
					self.filterBtnActive(this)
					self.filterPharmacyData = this.dataset.pharmacy
				} else {
					$(this).parent().removeClass('is--active')
					self.filterPharmacyData = ''
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

		this.filterStock.forEach(item => {
			item.addEventListener('click', function () {
				if(!$(this).parent().hasClass('is--active')) {
					self.filterBtnActive(this)
					self.filterStockData = this.dataset.stock
				} else {
					$(this).parent().removeClass('is--active')
					self.filterStockData = ''
				}
				self.filter()
			})

			item.addEventListener('change', function () {
                self.filterStockData = item.value
				self.filter()
			})
		})

		this.filterArea.forEach(item => {
			item.addEventListener('click', function (event) {
				event.preventDefault()
				
				self.filterAreaData = this.dataset.area
				// if(!$(this).parent().hasClass('is--active')) {
					
				// 	// self.filterBtnActive(this)
				// 	self.filterAreaData = this.dataset.area
				// } else {
				// 	// $(this).parent().removeClass('is--active')
				// 	self.filterAreaData = ''
				// }
				self.filter()
			})

			item.addEventListener('change', function () {
                self.filterAreaData = item.value
				self.filter()
			})
		})

		// this.trigger.addEventListener('click', function(e) {
		// 	e.preventDefault();

		// 	console.log('main trigger')
		// })

		// this.editAddress.addEventListener('click', function(e) {
		// 	e.preventDefault();

		// 	console.log('edit address')
		// })

		this.showMap.addEventListener('click', function (e) {
			e.preventDefault();

            const input = $(this).children('.switch__input')

            if (input.is(':checked')) {
                input.prop('checked', false);

                document.querySelector('.pharmacy-list__holder--list').classList.add('is--active')
                document.querySelector('.pharmacy-list__holder--map').classList.remove('is--active')
            } else {
                input.prop('checked', true);

                document.querySelector('.pharmacy-list__holder--list').classList.remove('is--active')
                document.querySelector('.pharmacy-list__holder--map').classList.add('is--active')

				if (self.mapContainer.classList.contains('loaded')) return;

				self.addYamapsScript();
            }
		})

		this.search.addEventListener('input', function () {
			const value = $(this).val().toLowerCase();
			self.filterSearch(value)
		})

		this.clear.addEventListener('click', function () {
			setTimeout(() => {
				self.listFilter(self.objects)
				self.mapUpdate(self.objects)
				// document.querySelectorAll('.desktop__select')
				$('.pharmacy-list-sort__item').removeClass('is--active')
				// console.log('clear')
			}, 150)
		})

		this.mapContainer.addEventListener('click', function (event) {
			// console.log(event.target)
			if (event.target.classList.contains('c-map-balloon__close') || event.target.closest('.c-map-balloon__close')) {
				event.preventDefault()

				self.mapObject.balloon.close()
			}
		})
	}

	w.PMap = PMap;
})(window);