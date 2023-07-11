import css from "./panels.css";

css.install();

import Panel from "./panel/panel.js";


/**
 * 	<x-panels value:="m.config"></x-panels>
 *
 * 		config = [
 *			[
 *				{barTop: {height: "20px", repeat: 5}}
 *			],
 *			[
 *				{barLeft: {width: "20px"}},
 *				{barTopContent: {height: "50px", resizable: "bottom", repeat: 3}},
 *				{barRight: {width: "20px"}}
 *			],
 *			[
 *				{barLeft: {}},
 *				{barLeftContent: {width: "50px", resizable: "right"}},
 *				{tabsArea: {width: "auto", height: "auto"}},
 *				{barRightContent: {width: "50px", resizable: "left"}},
 *				{barRight: {}}
 *			],
 *			[
 *				{barBottomContent: {height: "50px", resizable: "top", repeat: 5}}
 *			],
 *			[
 *				{barBottom: {height: "20px", repeat: 5}}
 *			]
 *		]);
 *
 * Events:
 * 		$panel.resize				//
 * 		$panel.sizeChange			//
 * 		$panel.sizeRepartition		//
 */

class Panels extends HTMLElement {
	panels = {};
	#areaConfig = {
		areaTemplate: [],
		areaPanelRef: [],
		rows: [],
		columns: [],
		mainProps: {}					//property for show/hide enum(width,height)
	};

	constructor(model) {
		super();
		if (model) {
			this.init(model.data.value);
		}
	}

	configure(cfg) {
	}

	init(configRaw) {
		configRaw.forEach((items, rowNum) => {
			let row = [];
			let rowPanelsRef = [];
			let colNum = 0;
			items.forEach(item => {
				let name = Object.keys(item)[0];
				let itemCfg = item[name];
				itemCfg.name = name;
				itemCfg.rowNum = rowNum;
				itemCfg.colNum = colNum;
				let $panel = this.panels[name];
				if (!$panel) {
					$panel = this.panels[name] = this.#panelCreate(itemCfg);
				}
				let slug = $panel.slug;
				row[colNum] = slug;
				rowPanelsRef[colNum] = $panel;
				if (itemCfg.repeat) {
					itemCfg.repeat = +itemCfg.repeat;					//to Int
					for (let k = 1; k < itemCfg.repeat; k++) {
						row[colNum + k] = slug;
						rowPanelsRef[colNum + k] = $panel;
					}
					colNum += itemCfg.repeat - 1;
				}
				if (itemCfg.height) {
					this.#areaConfig.rows[rowNum] = itemCfg.height;
				}
				if (itemCfg.width) {
					this.#areaConfig.columns[colNum] = itemCfg.width;
				}
				colNum++;
			});
			this.#areaConfig.areaTemplate.push(row);
			this.#areaConfig.areaPanelRef.push(rowPanelsRef);
			rowNum++;
		});

		this.#reflow();
	}

	panelGet(panelId) {
		if (this.panels[panelId]) {
			return this.panels[panelId];
		} else {
			throw new Error('panel is not exist: ' + panelId);
		}
	}

	/**
	 * @description add panel
	 * @param cfg			{Object}
	 * @param cfg.name		{String}
	 * @param cfg.position	{String}
	 * @param cfg.size		{String}
	 * @param cfg.resizable	{Boolean}
	 */
	panelAdd(cfg) {
		let itemCfg = {};
		let newSizes = [];

		if (cfg.size === 'proportion') {
			this.#areaConfig.rows.forEach((value, num) => {
				value = Number.parseInt(value);
				newSizes[num] = value * (this.#areaConfig.rows.length) / (this.#areaConfig.rows.length + 1) + '%';		//free (1/this.#areaConfig.rows) of space
			});
			itemCfg.height = newSizes.reduce((a, b) => a - Number.parseFloat(b), 100) + '%';
		}

		if (cfg.position === 'bottom') {			//TODO: position: top, left, right
			itemCfg.rowNum = this.#areaConfig.rows.length;
			itemCfg.colNum = 0;
			if (cfg.resizable) {
				itemCfg.resizable = 'top';
			}
			this.#areaConfig.rows.push(0);
			newSizes.push(itemCfg.height);			//add size to new panel
		}
		itemCfg.name = cfg.name;
		let $panel = this.panels[cfg.name] = this.#panelCreate(itemCfg);

		if (cfg.position === 'bottom') {
			this.#areaConfig.areaTemplate.push([$panel.slug]);
			this.#areaConfig.areaPanelRef.push([$panel]);
			this.#areaResize('vertical', newSizes);
		}
		return $panel;
	}

	#panelCreate(itemCfg) {
		let $panel = new Panel(itemCfg);
		this.appendChild($panel);
		$panel.addEventListener('sizeChange', e => {
			itemCfg[e.detail['propName']] = e.detail.value;
			if (e.detail['propName'] === 'height') {
				this.#areaConfig.rows[itemCfg.rowNum] = e.detail.value;
			} else if (e.detail['propName'] === 'width') {
				this.#areaConfig.columns[itemCfg.colNum] = e.detail.value;
			}
			this.#reflow();
		});
		$panel.addEventListener('sizeRepartition', e => {
			//console.log('sizeRepartition', e.detail, 'itemCfg:', itemCfg);
			if (e.detail['propName'] === 'height') {
				let neighbour = e.detail.position === 'top' ? -1 : 1;
				this.#rowSizeChange(itemCfg.rowNum, 'height', e.detail.valueDelta, '%');
				this.#rowSizeChange(itemCfg.rowNum + neighbour, 'height', -e.detail.valueDelta, '%');
			} else if (e.detail['propName'] === 'width') {
				/*
				let neighbour = e.detail.position === 'left' ? -1 : 1;
				this.#areaConfig.columns[itemCfg.colNum] = +e.detail.valueDelta;
				this.#areaConfig.rows[itemCfg.rowNum + neighbour] -= e.detail.valueDelta;
				 */
			}
			this.#reflow();
		});
		return $panel;
	}

	#panelByRowGet(rowNum) {
		return this.#areaConfig.areaPanelRef[rowNum][0];
	}

	#rowSizeSet(rowNum, value) {
		this.#areaConfig.rows[rowNum] = value;	//Number.parseInt(e.detail.originValue) + e.detail.valueDelta + '%';
		let $panel = this.#panelByRowGet(rowNum);
		$panel.cfg.height = value;
	}

	#rowSizeChange(rowNum, property, delta, metric) {
		let $panel = this.#panelByRowGet(rowNum);
		let value = (Number.parseFloat($panel.cfg[property]) + delta) + metric;
		$panel.cfg.height = value;
		this.#areaConfig.rows[rowNum] = value;	//Number.parseInt(e.detail.originValue) + e.detail.valueDelta + '%';
	}

	#reflow() {
		//console.log('reflow:', this.#areaConfig);
		this.style['grid-template-rows'] = this.#areaConfig.rows.join(' ');
		this.style['grid-template-columns'] = this.#areaConfig.columns.join(' ');
		this.style['grid-template-areas'] = this.#areaConfig.areaTemplate.map(row => {
			return '"' + row.join(' ') + '"';
		}).join(' ');
	}


	#areaResize(orientation, newSizes) {
		//console.log('[Panels] areaResize, oldSizes:', JSON.stringify(this.#areaConfig.rows), 'newSizes:', JSON.stringify(newSizes));
		if (orientation === 'vertical') {
			this.#areaConfig.rows = newSizes;
			newSizes.forEach((size, rowNum) => {
				//TODO: dispatch resize if size changed
				this.#rowSizeSet(rowNum, size);
			});
			this.#reflow();
		}
	}

	/*panelsResizeSmooth(areas, callback) {
		let duration = 200;
		let firstStates = Array.from(this.panel.areas);
		let startTime = null;
		let step = (timestamp) => {
			if (!startTime) startTime = timestamp;
			let progress = timestamp - startTime;
			for (let i = 0; i < this.panel.areas.length; i++) {
				this.panel.areas[i] = firstStates[i] + (areas[i] - firstStates[i]) / duration * progress;
			}
			this.panelGridSet();

			if (progress < duration) {
				setTimeout(() => {
					step(+new Date());
				}, 5);
			} else {
				if (callback) {
					callback();
				}
			}
		};
		step(+new Date());
	}*/
}

customElements.define('x-panels', Panels);

export default Panels;
