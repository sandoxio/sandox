import css from "./draggable.css";

css.install();

import {} from "./mouse.js";
import {
	cumulativeHeight,
	cumulativeWidth,
	isIntersecting,
	animateProperty,
	insertAfter
} from "../../../utils/htmlElement.js";

let Draggable = (() => {
	let containersByGroup = {};

	return class extends HTMLElement {
		orientation;
		name;
		group;											//pointer to containersByGroup[this.name]
		#groupName;

		constructor(cfg) {
			super();
			if (cfg) {
				this.orientation = cfg.orientation;		//horizontal, verticalLeft, verticalRight
				this.setAttribute('orientation', cfg.orientation);
				this.#groupName = cfg.group;
				this.setAttribute('group', cfg.group);
				this.name = cfg.name;
				this.setAttribute('name', cfg.name);
			}
		}

		connectedCallback() {
			this.orientation = this.getAttribute('orientation');		//horizontal, verticalLeft, verticalRight
			if (!this.#groupName) {
				this.#groupName = this.getAttribute('group');
			}
			this.name = this.getAttribute('name');
			if (!containersByGroup[this.#groupName]) {
				this.group = containersByGroup[this.#groupName] = [];
			} else {
				this.group = containersByGroup[this.#groupName];
			}
			this.group.push(this);
		}
	};
})();

customElements.define('x-draggable', Draggable);


class DraggableItem extends HTMLElement {
	#drag;
	#$container;

	constructor() {
		super();
		this.#drag = {
			$el: null,
			enabled: false,
			collapsed: false,
			originSize: null,					//total size: margin + border + padding + width
			originMarginLeft: null,				//marginLeft
			originMarginTop: null,				//marginTop
			offsetX: null,						//top left (X,Y) of dragged element
			offsetY: null,						//
			orientation: null					//orientation of element
		};

		this.addEventListener('mousedragstart', () => {
			let viewport = this.getBoundingClientRect();
			this.#drag.offsetX = viewport.left;
			this.#drag.offsetY = viewport.top;
		}, true);

		this.addEventListener('mousedrag', (e) => {
			if (!this.#drag.enabled && (Math.abs(e.detail.offsetX) > 5 || Math.abs(e.detail.offsetY) > 5)) {
				this.#drag.enabled = true;
				this.#drag.orientation = this.#$container.orientation;
				this.#drag.$el = document.createElement('div');
				this.#drag.$el.appendChild(this.childNodes[0].cloneNode(true));
				this.#drag.$el.style.left = (this.#drag.offsetX + e.detail.offsetX) + 'px';
				this.#drag.$el.style.top = (this.#drag.offsetY + e.detail.offsetY) + 'px';
				this.#drag.$el.classList.add('x-draggable-phantom');
				this.#drag.$el.classList.add('x-draggable-phantom-' + this.#drag.orientation);
				document.body.appendChild(this.#drag.$el);

				if (this.#drag.orientation === 'horizontal') {			//horizontal
					this.#drag.sizeProperty = 'width';
					this.#drag.originSize = cumulativeWidth(this);
				} else {												//vertical
					this.#drag.sizeProperty = 'height';
					this.#drag.originSize = cumulativeHeight(this);
				}
				let cs = window.getComputedStyle(this, null);
				this.#drag.originMarginLeft = Number.parseInt(cs.marginLeft);
				this.#drag.originMarginTop = Number.parseInt(cs.marginTop);
				this.#drag.$spacer = this.#spacerCreate(this.#drag.sizeProperty, this.#drag.originSize);
				this.parentNode.insertBefore(this.#drag.$spacer, this);
				this.parentNode.removeChild(this);
				this.dispatchEvent(
					new CustomEvent('dragstart', {})
				);
			}

			if (this.#drag.enabled) {
				let pos = {
					left: (this.#drag.offsetX + e.detail.offsetX),
					top: (this.#drag.offsetY + e.detail.offsetY)
				};
				this.#drag.$el.style.left = pos.left + 'px';
				this.#drag.$el.style.top = pos.top + 'px';

				let $newContainer = null;
				this.#$container.group.forEach($container => {
					if (isIntersecting(this.#drag.$el, $container)) {
						$newContainer = $container;
						return false;
					}
				});

				if ($newContainer) {
					//console.log('$newContainer:', $newContainer);
					if (!$newContainer.childNodes.length) {
						let $spacer = this.#spacerCreate('width', this.#drag.originSize);
						$newContainer.appendChild($spacer);
					} else {																						//$newContainer.orientation === 'verticalLeft' or 'verticalRight'
						let baseOrientation = $newContainer.orientation === 'horizontal' ? 'h' : 'v';
						let propsCfg = {
							h: {
								pos: 'left',
								axis: 'x',
								size: 'width',
								clientSize: 'clientWidth',
								cumulativeSize: cumulativeWidth
							},
							v: {
								pos: 'top',
								axis: 'y',
								size: 'height',
								clientSize: 'clientHeight',
								cumulativeSize: cumulativeHeight
							}
						}[baseOrientation];
						let middlePoint = pos[propsCfg.pos] + this.#drag.$el[propsCfg.clientSize] / 2;
						$newContainer.childNodes.forEach(($node) => {
							if ($node.tagName === 'X-DRAGGABLE-ITEM' && $node !== this) {
								let nodeViewPort = $node.getBoundingClientRect();
								let nodeSize = propsCfg.cumulativeSize($node);
								if (middlePoint >= nodeViewPort[propsCfg.axis] && middlePoint <= nodeViewPort[propsCfg.axis] + nodeSize) {
									if (middlePoint < nodeViewPort[propsCfg.axis] + nodeSize / 2) {
										let $prev = $node.previousSibling;
										if (!$prev || ($prev && $prev.tagName === 'X-DRAGGABLE-ITEM')) {
											let $spacer = this.#spacerCreate(propsCfg.size, 0);
											$node.parentNode.insertBefore($spacer, $node);
											animateProperty($spacer, $spacer.property, this.#drag.originSize);
										}
									} else {
										let $next = $node.nextSibling;
										if (!$next || ($next && $next.tagName === 'X-DRAGGABLE-ITEM')) {
											let $spacer = this.#spacerCreate(propsCfg.size, 0);
											insertAfter($node.parentNode, $spacer, $node);
											animateProperty($spacer, $spacer.property, this.#drag.originSize);
										}
									}
									return false;
								} else if ($node === $newContainer.lastChild && pos[propsCfg.pos] > nodeViewPort[propsCfg.axis] + nodeSize) {
									let $spacer = this.#spacerCreate(propsCfg.size, this.#drag.originSize);
									$newContainer.appendChild($spacer);
								}
							}
						});
					}
				} else if (this.#drag.$spacer) {
					this.#spacerRemove();
				}
			}
		}, true);

		this.addEventListener('mousedragstop', () => {
			if (this.#drag.enabled) {
				this.#drag.enabled = false;
				if (!this.#drag.$spacer) {
					this.#drag.$spacer = this.#spacerCreate();
					this.#$container.appendChild(this.#drag.$spacer);
				}

				let $newContainer = this.#drag.$spacer.parentNode;

				let spacerViewPort = this.#drag.$spacer.getBoundingClientRect();
				animateProperty(this.#drag.$el, 'left', spacerViewPort.x + this.#drag.originMarginLeft);
				animateProperty(this.#drag.$el, 'top', spacerViewPort.y + this.#drag.originMarginTop, ($el) => {
					$newContainer.insertBefore(this, this.#drag.$spacer);
					$el.parentNode.removeChild($el);
					$newContainer.removeChild(this.#drag.$spacer);
				});

				this.dispatchEvent(
					new CustomEvent('dragstop',
						{
							detail: {
								$oldContainer: this.#$container,
								$newContainer: $newContainer
							}
						}
					)
				);
			}
		}, true);
	}

	connectedCallback() {
		this.#$container = this.parentNode;
	}

	#spacerCreate(property, value) {
		this.#spacerRemove();
		let $spacer = this.#drag.$spacer = document.createElement('div');
		$spacer.className = 'x-draggable-spacer';
		if (property) {
			$spacer.property = property;
			$spacer.style[property] = value + 'px';
		}
		return $spacer;
	}

	#spacerRemove() {
		if (this.#drag.$spacer) {
			let $spacer = this.#drag.$spacer;
			this.#drag.$spacer = null;
			animateProperty($spacer, $spacer.property, 0, ($spacer) => {
				$spacer.parentNode.removeChild($spacer);
			});
		}
	}
}

customElements.define('x-draggable-item', DraggableItem);

export {Draggable, DraggableItem};
