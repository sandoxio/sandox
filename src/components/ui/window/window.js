import css from "./window.css";
css.install();

import UiLock from "../uiLock/uiLock.js";
import {} from "../../../utils/mouse.js";
import {animate} from "../../../utils/htmlElement.js";
import {Tpl_window} from "./window.html";


let Window = (() => {
	let winZindex = 100;

	return class extends HTMLElement {
		#cfg;
		#state;
		#drag;
		#$window;
		#$windowWrapper;
		#$titleBar;
		#$uiLock;
		#$borderWrapper;

		/**
		 * @param cfg			{Object}
		 * @param cfg.title		{String}
		 * @param cfg.width		{Number}
		 * @param cfg.height	{Number}
		 * @param cfg.uiLock	{Boolean=}
		 * @param cfg.$content	{Boolean=}
		 */
		constructor(cfg) {
			super();
			console.log('[window] cfg:', cfg);
			this.#cfg = cfg;
			this.#cfg.height += 20;	//TODO: сейчас шапка включается в высоту, поэтому увеличиваем. Нужно сделать по нормальному

			/*
			app.addEventListener('app-close', () => {
				this.close();
			}, true);

			app.addEventListener('app-focus', () => {
				this.#up();
			}, true);

			app.addEventListener('app-background', (e) => {
				this.#background(app.$task.getBoundingClientRect());
			}, true);

			app.addEventListener('app-foreground', (e) => {
				this.#foreground(app.$task.getBoundingClientRect());
			}, true);
			*/

			let ww = document.body.clientWidth;
			let wh = document.body.clientHeight;

			this.#state = {
				x: ww > this.#cfg.width ? (document.body.clientWidth - this.#cfg.width) / 2 : 0,
				y: wh > this.#cfg.height ? (wh - this.#cfg.height) / 3 : 0,
				width: this.#cfg.width,
				height: this.#cfg.height,
				isMax: false,
				stashed: {}
			};
			this.#drag = {
				enabled: false,
				direction: null,
				x: null,
				y: null,
				width: this.#cfg.width,
				height: this.#cfg.height
			};
			this.style.left = this.#state.x + 'px';
			this.style.top = this.#state.y + 'px';
			winZindex++;
			if (this.#cfg.uiLock) {
				this.#$uiLock = new UiLock(winZindex);
				winZindex++;
			}
			this.style.zIndex = winZindex.toString();

			this.#$window = new Tpl_window(this.#cfg, this);
			this.appendChild(this.#$window);

			this.#$windowWrapper = this.#$window.querySelector('div[name="wrapper"]');
			this.#$windowWrapper.addEventListener('mousedown', () => {
				this.#up();
			});
			this.#$windowWrapper.style.width = this.#state.width + 'px';
			this.#$windowWrapper.style.height = this.#state.height + 'px';

			this.#$titleBar = this.#$window.querySelector('div[name="titlebar"]');
			this.#$titleBar.addEventListener('mousedragstart', (e) => {
				if (!e.target.hasAttribute('action')) {
					this.#drag.enabled = true;
					let viewport = this.getBoundingClientRect();
					this.#drag.x = viewport.left;
					this.#drag.y = viewport.top;
				}
			}, true);
			this.#$titleBar.addEventListener('mousedrag', (e) => {
				if (this.#drag.enabled) {
					let left = this.#drag.x + e.detail.offsetX;
					let top = this.#drag.y + e.detail.offsetY;
					this.style.left = left + 'px';
					this.style.top = top + 'px';
					this.#state.x = left;
					this.#state.y = top;
				}
			}, true);
			this.#$titleBar.addEventListener('mousedragstop', () => {
				this.#drag.enabled = false;
			}, true);

			this.#$borderWrapper = this.#$window.querySelector('div[name="borders"]');
			this.#$borderWrapper.childNodes.forEach((node) => {
				node.addEventListener('mousedragstart', e => {
					this.#drag.direction = e.target.getAttribute('direction');
					let viewport = this.getBoundingClientRect();
					this.#drag.width = viewport.width;
					this.#drag.height = viewport.height;
					this.#state.x = viewport.left;
					this.#state.y = viewport.top;
				});
				node.addEventListener('mousedrag', (e) => {
					this.#resize(e.detail);
				});
			});

			/*
			let $minButton = this.#$window.querySelector('span[action="min"]');
			if (this.#cfg.canMin === false) {
				$minButton._.hide();
			}

			let $maxButton = this.#$window.querySelector('span[action="max"]');
			if (this.#cfg.canMax === false) {
				$maxButton._.hide();
			}*/

			this.$windowContent = this.#$window.querySelector('div[name="content"]');
			//console.log('this.$windowContent:', this.$windowContent);
			console.log('content:', this.#cfg.$content, typeof this.#cfg.$content);
			this.$windowContent.appendChild(this.#cfg.$content);
			animate(this, 'opening');

			document.body.appendChild(this);
		}

		max() {
			console.log('max');
			if (this.#state.isMax) {
				this.#state.isMax = false;
				this.style.setProperty('--window-minify-to-x', this.#state.stashed.x + 'px');
				this.style.setProperty('--window-minify-to-y', this.#state.stashed.y + 'px');
				this.style.setProperty('--window-minify-from-w', this.#state.width + 'px');
				this.style.setProperty('--window-minify-from-h', this.#state.height + 'px');
				this.style.setProperty('--window-minify-to-w', this.#state.stashed.width + 'px');
				this.style.setProperty('--window-minify-to-h', this.#state.stashed.height + 'px');
				animate(this, 'max', () => {
					this.#state.width = this.#state.stashed.width;
					this.#state.height = this.#state.stashed.height;
					this.style.left = this.#state.stashed.x + 'px';
					this.style.top = this.#state.stashed.y + 'px';
					this.#$windowWrapper.style.width = this.#state.width + 'px';
					this.#$windowWrapper.style.height = this.#state.height + 'px';
				});
			} else {
				this.#state.isMax = true;
				let toX = 0;
				let toY = 0;
				let toW = document.body.clientWidth - toX;
				let toH = document.body.clientHeight - toY;
				this.#state.stashed.x = this.#state.x;
				this.#state.stashed.y = this.#state.y;
				this.#state.stashed.width = this.#state.width;
				this.#state.stashed.height = this.#state.height;
				this.style.setProperty('--window-minify-to-x', toX + 'px');
				this.style.setProperty('--window-minify-to-y', toY + 'px');
				this.style.setProperty('--window-minify-from-w', this.#state.width + 'px');
				this.style.setProperty('--window-minify-from-h', this.#state.height + 'px');
				this.style.setProperty('--window-minify-to-w', toW + 'px');
				this.style.setProperty('--window-minify-to-h', toH + 'px');
				animate(this, 'max', () => {
					this.#state.width = toW;
					this.#state.height = toH;
					this.style.left = toX + 'px';
					this.style.top = toY + 'px';
					this.#$windowWrapper.style.width = toW + 'px';
					this.#$windowWrapper.style.height = toH + 'px';
				});
			}
		}

		actionClose() {
			this.close();
		}

		#up() {
			winZindex++;
			this.style.zIndex = winZindex.toString();
		}

		/*
		#background(taskPosition) {
			let toX = taskPosition.x - (this.clientWidth - taskPosition.width) / 2;
			let toY = taskPosition.y - (this.clientHeight - taskPosition.height) / 2;
			let scaleW = taskPosition.width / this.clientWidth;
			let scaleH = taskPosition.height / this.clientHeight;
			this.style.setProperty('--window-minify-to-x', toX + 'px');
			this.style.setProperty('--window-minify-to-y', toY + 'px');
			this.style.setProperty('--window-minify-scale-w', '' + scaleW);
			this.style.setProperty('--window-minify-scale-h', '' + scaleH);
			this._.animate('minify', () => {
				this.style.display = 'none';
			});
		}

		#foreground(taskPosition) {
			this.#up();
			this.style.display = 'block';
			let toX = taskPosition.x - (this.clientWidth - taskPosition.width) / 2;
			let toY = taskPosition.y - (this.clientHeight - taskPosition.height) / 2;
			let scaleW = taskPosition.width / this.clientWidth;
			let scaleH = taskPosition.height / this.clientHeight;
			this.style.setProperty('--window-minify-to-x', toX + 'px');
			this.style.setProperty('--window-minify-to-y', toY + 'px');
			this.style.setProperty('--window-minify-scale-w', '' + scaleW);
			this.style.setProperty('--window-minify-scale-h', '' + scaleH);
			this._.animate('restore');
		}
		*/

		/*
		titleSet(title) {
			this.#$windowCaption.innerHTML = title;
		}
		 */

		#resize(detail) {
			if (this.#drag.direction.indexOf('Right') !== -1) {
				this.#state.width = (this.#drag.width + detail.offsetX);
				this.#$windowWrapper.style.width = this.#state.width + 'px';
			} else if (this.#drag.direction.indexOf('Left') !== -1) {
				this.style.left = (this.#state.x + detail.offsetX) + 'px';
				this.#state.width = (this.#drag.width - detail.offsetX);
				this.#$windowWrapper.style.width = this.#state.width + 'px';
			}
			if (this.#drag.direction.indexOf('Bottom') !== -1) {
				this.#state.height = (this.#drag.height + detail.offsetY);
				this.#$windowWrapper.style.height = this.#state.height + 'px';
			} else if (this.#drag.direction.indexOf('Top') !== -1) {
				this.style.top = (this.#state.y + detail.offsetY) + 'px';
				this.#state.height = (this.#drag.height - detail.offsetY);
				this.#$windowWrapper.style.height = this.#state.height + 'px';
			}
			this.dispatchEvent(new Event('resize'));
		}

		close() {
			if (this.#cfg.uiLock) {
				this.#$uiLock.unlock();
			}
			animate(this, 'closing', () => {
				this.parentNode.removeChild(this);
			});
		}
	};

})();

customElements.define('x-window', Window);

export default Window;