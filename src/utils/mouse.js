const mouse = {};

const drag = {
	target: null,
	enabled: false,
	startX: null,
	startY: null,
	prevPageX: null,
	prevPageY: null
};

document.body.addEventListener('mousedown', e => {
	//dragstart event
	if (e.target) {
		drag.enabled = true;
		drag.target = e.target;
		drag.startX = e['pageX'];
		drag.startY = e['pageY'];
		drag.target.ondragstart = () => {
			return false;
		};
		/*drag.target.onselectstart = () => {
			return false;
		};*/
		drag.prevPageX = e['pageX'];
		drag.prevPageY = e['pageY'];
		drag.target.dispatchEvent(new CustomEvent('mousedragstart', {
			detail: {
				pageX: e['pageX'],
				pageY: e['pageY'],
				startX: e['layerX'],
				startY: e['layerY'],
				prevPageX: drag.prevPageX,
				prevPageY: drag.prevPageY,
			}
		}));
	}
});

window.addEventListener('mouseup', e => {
	if (drag.target) {
		drag.enabled = false;
		drag.target.dispatchEvent(new CustomEvent('mousedragstop', {
			detail: {
				pageX: e['pageX'],
				pageY: e['pageY'],
				offsetX: e['pageX'] - drag.startX,
				offsetY: e['pageY'] - drag.startY
			}
		}));
	}
});

document.body.addEventListener('mousemove', e => {
	mouse.pageX = e['pageX'];
	mouse.pageY = e['pageY'];
	if (drag.enabled) {
		drag.target.dispatchEvent(new CustomEvent('mousedrag', {
			detail: {
				d: e,
				pageX: e['pageX'],
				pageY: e['pageY'],
				offsetX: e['pageX'] - drag.startX,
				offsetY: e['pageY'] - drag.startY,
				stepOffsetX: e['pageX'] - drag.prevPageX,
				stepOffsetY: e['pageY'] - drag.prevPageY
			}
		}));
		drag.prevPageX = e['pageX'];
		drag.prevPageY = e['pageY'];
	}
});

export default mouse;

