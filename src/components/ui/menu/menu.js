/**
 * usage:
 * 		<x-menu value:="model.menuItems"></x-menu>
 */

import css from "./menu.css";
css.install();

import {isChildOf} from "../../../utils/htmlElement.js";

class Menu extends HTMLElement {
	#isExpanded = false;
	#nodes = [];
	#currentNodePath;

	constructor(model) {
		super();
		this.model = model;
	}

	connectedCallback() {
		document.addEventListener('click', (e) => {
			if (!isChildOf(e.target, this)) {
				this.close();
			}
		});
		//console.log('[menu]', this.model.data);
		this.#render(this.model.data['config'].value, this, '');		//TODO: fix value prop
	}

	#render(data, container, path) {
		//console.log('[menu] render data:', data, container, path);
		data.forEach((value) => {
			let nodeId = this.#nodes.length;
			let nodePath = (path !== '' ? path + '/' : '') + nodeId;
			let $item = document.createElement('x-menu-item');
			let $title = document.createElement('div');
			$title.innerText = value.title;
			$item.appendChild($title);
			let $submenu;
			if (value.childNodes && value.childNodes.length) {
				$title.addEventListener('mouseover', this.#onOver.bind(this, nodeId, nodePath));
				$submenu = document.createElement('submenu');
				$item.appendChild($submenu);
				$title.addEventListener('mousedown', this.#onSelect.bind(this, nodeId, nodePath));
			} else {
				$item.addEventListener('mousedown', this.#onAction.bind(this, nodeId));
			}

			this.#nodes.push({
				$item: $item,
				$submenu: $submenu,
				childNodes: value.childNodes,
				childrenIsRendered: false,
				action: value.action
			});
			container.appendChild($item);
		});
	}

	#onAction(nodeId, e) {
		e.preventDefault();
		e.stopImmediatePropagation();
		this.close();
		let node = this.#nodes[nodeId];
		if (node.action) {
			node.action();
		}
	}

	close() {
		this.#isExpanded = false;
		this.#stateUpdate(null, '');
	}

	#onSelect(nodeId, nodePath) {
		this.#isExpanded = !this.#isExpanded;
		this.#stateUpdate(nodeId, nodePath);
	}

	#onOver(nodeId, nodePath) {
		if (this.#isExpanded) {
			this.#stateUpdate(nodeId, nodePath);
		}
	}

	#stateUpdate(nodeId, nodePath) {
		if (this.#currentNodePath) {
			this.#currentNodePath.split('/').forEach((oldNodeId) => {
				if (!this.#isExpanded || nodePath.indexOf(oldNodeId) === -1) {
					this.#nodes[oldNodeId].$item.classList.remove('expanded');
				}
			});
		}

		this.#currentNodePath = nodePath;
		if (nodeId !== null) {
			let node = this.#nodes[nodeId];
			if (this.#isExpanded) {
				node.$item.classList.add('expanded');
				if (!node.childrenIsRendered && node.childNodes && node.childNodes.length) {
					node.childrenIsRendered = true;
					this.#render(node.childNodes, node.$submenu, nodePath);
				}
			}
		}
	}
}

customElements.define('x-menu', Menu);

export default Menu;
