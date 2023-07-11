import inum from "inum";

import css from "./panel.css";
css.install();


class Panel extends HTMLElement {
	slug;
	cfg;
	panelId;
	#visibility;
	#$splitter;

	/**
	 * @param cfg			{Object}
	 * @param cfg.name		{String}
	 * @param cfg.resizable	{String}
	 * @param cfg.height	{String}
	 * @param cfg.width		{String}
	 */
	constructor(cfg) {
		super();
		this.cfg = cfg;
		let id = inum();
		this.panelId = cfg.name;
		this.slug = 'panel' + id + '_' + cfg.name;
		this.style['grid-area'] = this.slug;
		this.setAttribute('name', cfg.name);

		this.#visibility = {
			enabled: true,
			property: cfg.height ? 'height' : 'width',									//animate property for show/hide
			defaultValue: cfg.height ? cfg.height : cfg.width							//
		};
	}

	connectedCallback() {
		if (this.cfg.resizable && this.previousSibling) {								//
			this.#splitterCreate();
		}
	}

	#splitterCreate() {
		this.#$splitter = document.createElement('x-panels-panelsplitter');
		this.#$splitter.className = this.cfg.resizable;
		this.appendChild(this.#$splitter);
		let direction;
		let metric = (this.cfg.height && this.cfg.height.indexOf('%') !== -1) ? '%' : 'px';
		if (this.cfg.resizable === 'top' || this.cfg.resizable === 'bottom') {
			this.#$splitter.addEventListener('mousedragstart', e => {
				document.body.classList.add('cursorResizeRow');
			});
			direction = this.cfg.resizable === 'top' ? 1 : -1;
			this.#$splitter.addEventListener('mousedrag', e => {
				if (metric === '%') {
					this.dispatchEvent(new CustomEvent('sizeRepartition', {
						detail: {
							propName: 'height',
							position: this.cfg.resizable,
							valueDelta: -(100 / this.parentNode['clientHeight'] * e.detail.stepOffsetY * direction)
						}
					}));
				} else {
					this.dispatchEvent(new CustomEvent('sizeChange', {
						detail: {
							propName: 'height',
							value: (Number.parseFloat(this.cfg.height) - e.detail.stepOffsetY * direction) + metric
						}
					}));
				}
			});
		} else if (this.cfg.resizable === 'left' || this.cfg.resizable === 'right') {
			this.#$splitter.addEventListener('mousedragstart', e => {
				document.body.classList.add('cursorResizeCol');
			});
			direction = this.cfg.resizable === 'left' ? 1 : -1;
			this.#$splitter.addEventListener('mousedrag', e => {
				this.dispatchEvent(new CustomEvent('sizeChange', {
					detail: {
						propName: 'width',
						value: (Number.parseFloat(this.cfg.width) - e.detail.stepOffsetX * direction) + metric
					}
				}));
			});
		}
		this.#$splitter.addEventListener('mousedragstop', e => {
			document.body.classList.remove('cursorResizeRow');
			document.body.classList.remove('cursorResizeCol');
		});
	}

	appendChild(newChild) {
		super.appendChild(newChild);
		if (newChild !== this.#$splitter && this.#$splitter) {
			super.appendChild(this.#$splitter);
		}
	}

	show() {
		if (!this.#visibility.enabled) {
			this.#visibility.enabled = true;
			//console.log('show:', this, this.#visibility.property, 'value:', this.#visibility.defaultValue);
			this.dispatchEvent(new CustomEvent('sizeChange', {
				detail: {
					propName: this.#visibility.property,
					value: this.#visibility.defaultValue
				}
			}));
			this.style.display = 'grid';
		}
	}

	hide() {
		if (this.#visibility.enabled) {
			this.#visibility.enabled = false;
			this.#visibility.defaultValue = this.cfg[this.#visibility.property];
			//console.log('hide:', this, this.#visibility.property);
			this.dispatchEvent(new CustomEvent('sizeChange', {
				detail: {
					propName: this.#visibility.property,
					value: 0
				}
			}));
			this.style.display = 'none';
		}
	}
}

customElements.define('x-panels-panel', Panel);

export default Panel;
