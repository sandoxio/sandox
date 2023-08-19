import css from "./contextMenu.css";

css.install();

import {isChildOf} from "../../../utils/htmlElement.js";

/**
 * @example
 * 		const data = [
 * 			{ico, title, action:Function, childNodes:[ ... ] }
 * 		];
 * 		const cfg = {
 * 			x: number,
 * 			y: number
 * 		}
 * 		new ContextMenu(data, cfg);
 */

class ContextMenu extends HTMLElement {
	#data;
	#cfg;
	#closeChecker;

	constructor(data, cfg) {
		super();

		this.#data = data;
		this.#cfg = cfg;
		this.#render(data, this);

		this.style.left = cfg.x + 'px';
		this.style.top = cfg.y + 'px';

		this.#closeChecker = (e) => {
			if (!isChildOf(e.target, this)) {
				this.close();
			}
		};

		setTimeout(() => {
			document.body.appendChild(this);
		}, 1);
	}


	connectedCallback() {
		document.addEventListener('click', this.#closeChecker, true);
		document.addEventListener('contextmenu', this.#closeChecker, true);
	}

	disconnectedCallback() {
		document.removeEventListener('click', this.#closeChecker, true);
		document.removeEventListener('contextmenu', this.#closeChecker, true);
	}

	close() {
		document.body.removeChild(this);
	}

	#render(data, $container, path) {
		//console.log('[menu] render data:', data, container, path);
		data.forEach((value) => {
			let $item = document.createElement('x-menu-item');
			let $title = document.createElement('div');
			$title.innerText = value.title;
			$item.appendChild($title);
			$item.addEventListener('click', () => {
				this.close();
				value.action();
			});
			$container.appendChild($item);
		});
	}
}

customElements.define('x-contextmenu', ContextMenu);

export default ContextMenu;