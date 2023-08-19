import css from "./dropdown.css";
css.install();

import {Tpl_dropdown} from "./dropdown.html";
import {childNodesRemove, isChildOf} from "../../../utils/htmlElement.js";

/**
 * @example	usage:
 * 		1)	<x-dropdown value:="m.value" items:="m.items"></x-dropdown>
 * 		2)
 * 			<x-dropdown value:="m.value">
 * 				<item value='1'>Item1</item>
 * 				<item value='2'>Item2</item>
 * 			</x-dropdown>
 */

class Dropdown extends HTMLElement {
	model;
	#isDisabled = false;
	#isExpanded = false;
	#items;					//[{title: string, value: any}]
	#indexedItems;			//{value: {title, value}}}
	#$wrapper;
	#$listContainer;
	#$list;
	#$selectedName;

	constructor(model) {
		super();
		this.model = model;
		console.log('[dd] model:', model);

		this.#$wrapper = new Tpl_dropdown(model, this);

		this.#$listContainer = this.#$wrapper.querySelector('div[name="listContainer"]');
		this.#$list = this.#$listContainer.querySelector('div[name="list"]');

		this.#$selectedName = this.#$wrapper.querySelector('div[name="selectedName"]');

		this.height = this.getAttribute('height');
		this.#$list.style.height = this.height + 'px';

		this.model.addEventListener('change', 'value', cfg => {
			this.#setValue(cfg.newValue);
		});

		document.addEventListener('mousedown', (e) => {
			if (!isChildOf(e.target, this)) {
				this.#close();
			}
		});
	}


	connectedCallback() {
		if (this.model.data['items']) {
			this.#items = this.model.data['items'];
		} else if (this.childNodes.length) {
			this.#items = Array.from(this.querySelectorAll('item')).map($item => {
				let title = $item.innerText;
				let value = $item.getAttribute('value');
				return {title: title, value: value};
			});
			childNodesRemove(this);
		}
		this.appendChild(this.#$wrapper);

		if (this.#items) {
			this.init(this.#items);
		}
	}

	disconnectedCallback() {
		//TODO: remove mousedownEvent
	}

	/**
	 * @param items		// [{title: string, value: any}]	||	['title1', 'title2', ...]
	 */
	init(items) {
		if (typeof items[0] === 'string') {								//Если передан массив строк, то преобразуем его к формату [{title, value}]
			items = items.map((value, num) => {
				return {title: value, value: num};
			});
		}
		//console.log('[DD] init data:', data);

		this.#indexedItems = {};
		items.forEach(item => {
			this.#indexedItems[item.value] = item;
		});
		console.log('items:', items);

		/*
		let title;
		if (this.#selectedValue) {
			let value = this.#indexedItems[this.#selectedValue];
			if (value) {
				title = value.title;
			}
		}
		if (title === undefined) {								//Если выбранного значения нет, либо его удалили
			if (this.#items && this.#items[0]) {				//Если вообще есть значения - берем первое
				this.#selectedValue = this.#items[0].value;
				title = this.#items[0].title;
			} else {											//Иначе сбрасываем выбранное
				this.#selectedValue = undefined;
				title = '';
			}
		}
		*/
		console.log('[dropdown] model:', this.#$wrapper.model);
		this.#render();

		this.#setValue(this.model.data['value']);		//render selected first item
	}

	/*
	//TODO get from model attributes
	get disabled() {
		return this.#isDisabled;
	}

	set disabled(value) {
		if (value && !this.#isDisabled) {
			this.setAttribute('disabled', 'disabled');
		} else if (!value && this.#isDisabled) {
			this.removeAttribute('disabled');
		}
		this.#isDisabled = value;
	}*/


	/**
	 * @description Open/close
	 * @param state
	 */
	stateChange(state) {
		if (this.#isDisabled) {
			return;
		}
		if (state === undefined) {
			this.#isExpanded = !this.#isExpanded;
		} else {
			this.#isExpanded = state;
		}

		let viewport = this.getBoundingClientRect();
		let height = this.#$selectedName.offsetHeight;
		if ((viewport.y + height / 2) > document.body.clientHeight / 2) {	//suggest находится в нижней части экрана - раскрываем его вверх
			this.#$listContainer.style.top = 'unset';
			this.#$listContainer.style.bottom = (height + 1) + 'px';
		} else {														//suggest в верхней части экрана
			this.#$listContainer.style.top = (height + 1) + 'px';
			this.#$listContainer.style.bottom = 'unset';
		}

		this.#$listContainer.className = this.#isExpanded ? 'expanded' : '';
		this.#$selectedName.className = this.#isExpanded ? 'expanded' : '';
	}


	#render() {
		childNodesRemove(this.#$list);
		console.log('this.#items:', this.#items);
		this.#items.forEach((item) => {
			let $item;
			if (item['splitter']) {
				$item = document.createElement('splitter');
			} else {
				$item = document.createElement('item');
				$item.innerText = item.title;
				$item.addEventListener('click', () => {
					this.stateChange(false);
					this.#setValue(item.value);
				});
			}
			this.#$list.appendChild($item);
		});
	}


	/**
	 * @param value
	 */
	#setValue(value) {
		if (typeof value === 'number' || typeof value === 'string') {
			let item = this.#indexedItems[value];
			if (item) {
				this.model.data['selectedName'] = item.title;
			} else {
				//console.warn("[DD] Can't set not existed value:', value, this.#indexedItems, 'Set first value");
				value = this.#items[0].value;
				this.model.data['selectedName'] = this.#items[0].title;
			}
			//console.log('[setValue]', value, this.model.data['value']);
			if (this.model.data['value'] !== value) {
				this.model.data['value'] = value;
			}
		}
	}


	#close() {
		this.stateChange(false);
	}
}

customElements.define('x-dropdown', Dropdown);
