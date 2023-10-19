import {childNodesRemove} from "../../../utils/htmlElement.js";

import css from "./tree.css";

css.install();
import {Tpl_tree_item} from "./tree.html";

/**
 *
 * @class {Tree}
 * @param cfg		{Object}
 * @param cfg.value	{Object}	//  [{ico, title, value, color, isVisible: boolean, isExpanded:boolean, childNodes: [...] }]
 *
 * @example:
 * 		<x-tree value:="m.tree" selected:="m.selected"></x-tree>
 */


const Tree = class Tree extends HTMLElement {
	#cfg;								// {onDoubleClick, onContextMenu}
	#cache;
	#itemsByPath;
	#selectedNode;
	#isChildrenRendered;				// {path: bool}

	constructor(model) {
		super();
		this.model = model;
		this.#itemsByPath = {};
		this.#cache = {};
		this.#cfg = {};

		//console.log('[tree] model:', model);
		this.model.addEventListener('change', /^value\.(.*)/, cfg => {
			//console.log('[tree] model changed:', cfg);
			this.#selectedNode = undefined;
			this.#isChildrenRendered = {};
			this.#renderList('', this, this.model.data.value, 1);
		});

		this.model.addEventListener('change', /^selected$/, cfg => {
			//console.log('[tree] selected changed:', cfg);
			//console.log('[tree] this.#itemsByPath', this.#itemsByPath);
			if (this.#selectedNode) {
				this.#selectedNode.classList.remove('selected');
			}
			if (cfg.newValue) {
				this.#selectedNode = this.#itemsByPath[cfg.newValue].querySelector('[name=item]');
				this.#selectedNode.classList.add('selected');
			}
		});

		this.#isChildrenRendered = {};
		this.reflow();
	}

	configure(cfg) {
		this.#cfg = cfg;
	}

	reflow() {
		this.#selectedNode = undefined;
		this.model.data.selected = undefined;
		this.#renderList('', this, this.model.data.value, 1);
	}

	#renderList(parentPath, $container, data, level) {
		childNodesRemove($container);
		this.#isChildrenRendered[parentPath] = true;

		Array.from(data).sort((a, b) => a.title > b.title ? 1 : -1).forEach(item => {
			const itemPath = parentPath ? `${parentPath}/${item.value ? item.value : item.title}` : (item.value ? item.value : item.title);
			let $childrenContainer, $itemContainer;

			const logic = {
				roll: () => {
					if (item.childNodes.length) {
						$item.model.data.isExpanded = !$item.model.data.isExpanded;
						$childrenContainer.style.display = $item.model.data.isExpanded ? 'block' : 'none';
						if (!this.#isChildrenRendered[itemPath]) {
							this.#renderList(itemPath, $childrenContainer, item.childNodes, level + 1);
						}
					}
				},
				select: () => {
					this.model.data.selected = itemPath;
				},
				onContextMenu: () => {
					logic.select();
					if (item.onContextMenu) {
						item.onContextMenu(itemPath);
					} else if (this.#cfg.onContextMenu) {
						this.#cfg.onContextMenu(itemPath);
					}
				},
				onDoubleClick: () => {
					if (item.isDirectory && item.childNodes.length) {
						logic.roll();
					} else if (this.#cfg.onDoubleClick) {
						this.#cfg.onDoubleClick(itemPath);
					}
				}
			};
			const $item = this.#itemsByPath[itemPath] = new Tpl_tree_item(item, logic);
			$childrenContainer = $item.querySelector('[name=children]');
			$itemContainer = $item.querySelector('[name=item]');
			$itemContainer.style['padding-left'] = level * 10 + "px";
			if (item.hint) {
				if (typeof item.hint === 'function') {
					let $hint = item.hint();
					if ($hint) {
						$hint.classList.add('hint');
						$itemContainer.appendChild($hint);
					}
				}
			}

			if (item.isDirectory) {
				const fullPath = parentPath ? `${parentPath}/${item.value ? item.value : item.title}` : (item.value ? item.value : item.title);
				const modelPath = 'value' + fullPath.split('/').reduce((cfg, name) => {
					const nodeId = cfg.children.findIndex(child => child[child.value ? 'value' : 'title'] === name);
					cfg.nodeNames.push(nodeId);
					return {
						nodeNames: cfg.nodeNames,
						children: cfg.children[nodeId].childNodes
					}
				}, {children: this.model.data.value, nodeNames: []})
					.nodeNames
					.map(item => '.' + item)
					.join('.childNodes') + ".isExpanded";
				$item.model.bridgeChanges('isExpanded', this.model, modelPath);
			}

			$container.appendChild($item);
			if (item.isExpanded && item.childNodes.length) {
				this.#renderList(itemPath, $childrenContainer, item.childNodes, level + 1);
			}
		});
	}
}

customElements.define('x-tree', Tree);

export default Tree;