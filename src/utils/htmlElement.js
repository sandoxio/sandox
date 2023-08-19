/**
 * @method		cumulativeHeight
 * @return		{Number}
 */
const cumulativeHeight = (elm) => {
	let cs = window.getComputedStyle(elm, null);
	//TODO: +border + padding!
	return elm.offsetHeight + parseInt(cs.getPropertyValue('margin-top')) + parseInt(cs.getPropertyValue('margin-bottom'));
};


/**
 * @method		cumulativeWidth
 * @return		{Number}
 */
const cumulativeWidth = (elm) => {
	let cs = window.getComputedStyle(elm, null);
	return parseInt(cs.marginLeft) +
		parseInt(cs.borderLeftWidth) +
		elm.offsetWidth +
		parseInt(cs.borderRightWidth) +
		parseInt(cs.marginRight);
};


/**
 * @method		cumulativeOffsetLeft
 * @return		{Number}
 */
const cumulativeOffsetLeft = (elm) => {
	let offset = elm['offsetLeft'];
	while (elm.offsetParent) {
		elm = elm.offsetParent;
		offset = offset + elm['offsetLeft'];
	}
	return offset;
};


/**
 * @method		cumulativeOffsetTop
 * @return		{Number}
 */
const cumulativeOffsetTop = (elm) => {
	let offset = elm['offsetTop'];
	while (elm.offsetParent) {
		elm = elm.offsetParent;
		offset = offset + elm['offsetTop'];
	}
	return offset;
};


/**
 * @name isCrossOver
 */
const isIntersecting = (el, area) => {
	let elViewPort = el.getBoundingClientRect();
	let areaViewPort = area.getBoundingClientRect();
	let r1 = {
		left: elViewPort.left,
		right: elViewPort.left + elViewPort.width,
		top: elViewPort.top,
		bottom: elViewPort.top + elViewPort.height
	};
	let r2 = {
		left: areaViewPort.left,
		right: areaViewPort.left + areaViewPort.width,
		top: areaViewPort.top,
		bottom: areaViewPort.top + areaViewPort.height
	};
	return !(r2.left > r1.right ||
		r2.right < r1.left ||
		r2.top > r1.bottom ||
		r2.bottom < r1.top);
};


const animate = function (node, className, callback) {
	node.classList.add(className);
	let animationEvent = () => {
		node.removeEventListener('animationend', animationEvent);
		node.classList.remove(className);
		if (callback) {
			callback();
		}
	};
	node.addEventListener('animationend', animationEvent);
};


const animateProperty = ($el, prop, endValue, callback) => {
	let elStyles = window.getComputedStyle($el, null);
	let startValue = Number.parseInt(elStyles[prop]);
	//console.log('[animate] node:', $el._.uid, prop, 'from:', startValue, 'to:', endValue);
	if (startValue === endValue) {
		if (callback) {
			callback($el);
		}
	} else {
		$el.style['transition'] = 'all 0.15s linear';
		$el.style[prop] = endValue + 'px';
		let onTransitionEnd;
		onTransitionEnd = (e) => {
			if (e.propertyName === prop) {
				$el.removeEventListener('transitionend', onTransitionEnd);
				$el.style['transition'] = '';
				if (callback) {
					callback($el);
				}
			}
		};
		$el.addEventListener('transitionend', onTransitionEnd, true);
	}
};


/**
 * @method		insertAfter
 * @description Inserts the specified node after a reference element as a child of the current node.
 * @returns
 */
const insertAfter = (parent, newElement, referenceElement) => {
	let nextNode = referenceElement.nextSibling;
	if (nextNode) {
		parent.insertBefore(newElement, nextNode);
	} else {
		parent.appendChild(newElement);
	}
};


const childNodesRemove = function (parent) {
	let children = parent.childNodes;
	while (children.length) {
		if (children[0] && children[0].parentNode) {
			children[0].parentNode.removeChild(children[0]);
		} else {
			break;
		}
	}
};


/**
 * @name isChildOf
 * @description if node is child of rootNode
 * @params checkedNode	{Node}
 * @params rootNode		{Node}
 * @return 				{Boolean}
 */
const isChildOf = (p, rootNode) => {
	let b = document.body;
	while (p && p !== rootNode && p !== b) {
		p = p.parentNode;
	}
	return (p && p !== b);
};

export {cumulativeHeight, cumulativeWidth, cumulativeOffsetLeft, cumulativeOffsetTop, isIntersecting, animate, animateProperty, insertAfter, childNodesRemove, isChildOf};

