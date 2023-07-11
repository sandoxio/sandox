import css from "./panelspace.css";

css.install();

import Panels from "../panels/panels.js";

import {Draggable, DraggableItem} from "../draggable/draggable.js";

class PanelSpace extends HTMLElement {
	$workspace;
	#config;
	#barContainers;
	#barContentContainers;
	#barStates;
	#panelContents;
	#panelItems;
	#$panels;

	constructor() {
		super();

		this.#barContainers = {};
		this.#barContentContainers = {};
		this.#barStates = {
			left: null,
			right: null,
			top: null,
			bottom: null
		};
		this.#panelContents = {};
		this.#panelItems = {};
	}

	/**
	 * @param config
	 * @param config.barSize					{Object}
	 * @param config.panels						{Object}
	 * @param config.panelContent				{Object}
	 */
	init(config) {
		this.#config = config;
		//console.log('this.#config.barSize.bottom:', this.#config.barSize.bottom);

		Object.entries(this.#config.panelContentConstructors).forEach(([name, panelConstructor]) => {
			if (panelConstructor.init) {
				panelConstructor.init();
			}
		});

		this.#$panels = new Panels();
		this.appendChild(this.#$panels);
		let areaCfg = [
			[
				{top: {height: '19px', repeat: 5}}
			],
			[
				{left: {width: '19px'}},
				{topContent: {height: this.#config.barSize.top + 'px', resizable: 'bottom', repeat: 3}},
				{right: {width: '19px'}}
			],
			[
				{left: {}},
				{leftContent: {width: this.#config.barSize.left + 'px', resizable: 'right'}},
				{workSpace: {width: 'auto', height: 'auto'}},
				{rightContent: {width: this.#config.barSize.right + 'px', resizable: 'left'}},
				{right: {}}
			],
			[
				{left: {}},
				{bottomContent: {height: this.#config.barSize.bottom + 'px', resizable: 'top', repeat: 3}},
				{right: {}}
			],
			[
				{bottom: {height: '19px', repeat: 5}}
			]
		];
		this.#$panels.init(areaCfg);
		this.$workspace = this.#$panels.panels.workSpace;

		Object.entries({
			horizontal: ['top', 'bottom'],
			verticalLeft: ['left'],
			verticalRight: ['right']
		}).forEach(([orientation, barNames]) => {
			barNames.forEach(barName => {
				let $container = new Draggable({group: 'ide', name: barName, orientation: orientation});
				this.#barContainers[barName] = $container;
				this.#barContentContainers[barName] = this.#$panels.panels[barName + 'Content'];
				this.#$panels.panels[barName].appendChild($container);
			});
		});

		Object.entries(this.#config.panels).forEach(([panelName, panelCfg]) => {
			let $panelItem = this.#panelItems[panelName] = new DraggableItem({name: panelName});
			let $panelTile = new PanelSpaceTile();
			$panelTile.configure(this, {
				title: panelCfg.title
			});
			$panelItem.appendChild($panelTile);
			this.#barContainers[panelCfg.bar].appendChild($panelItem);

			if (this.#barContainers[panelCfg.bar].childNodes.length === 0) {
				this.#barContainers[panelCfg.bar].style.display = 'block';
			}
			$panelItem.addEventListener('dragstart', () => {
				Object.values(this.#barContainers).forEach($container => {
					this.#$panels.panels[$container.name].show();
				});
			});
			$panelItem.addEventListener('dragstop', (e) => {
				if (e.detail.$oldContainer.name !== e.detail.$newContainer.name) {
					if (this.#barStates[e.detail.$oldContainer.name] === panelName) {
						this.#barStates[e.detail.$newContainer.name] = panelName;
						this.#barStates[e.detail.$oldContainer.name] = null;
					}
					panelCfg.bar = e.detail.$newContainer.name;
				}
				this.#panelContentsReflow();
			});
			$panelItem.addEventListener('click', () => {
				if (this.#barStates[panelCfg.bar] === panelName) {
					this.#barStates[panelCfg.bar] = null;
				} else {
					this.#barStates[panelCfg.bar] = panelName;
				}
				this.#panelContentsReflow();
			});

			if (panelCfg.isOpen) {
				this.#barStates[panelCfg.bar] = panelName;
			}
		});
		this.#panelContentsReflow();
	}

	panelSelect(panelName) {
		console.log('[panelspace] panelSelect:', panelName);
		this.#barStates[this.#config.panels[panelName].bar] = panelName;
		this.#panelContentsReflow();
	}

	panelCollapse(panelName) {
		if (this.#barStates[this.#config.panels[panelName].bar] === panelName) {
			this.#barStates[this.#config.panels[panelName].bar] = null;
		}
		this.#panelContentsReflow();
	}

	#panelContentsReflow() {
		//console.log('[panelspace] #panelContentsReflow');
		Object.values(this.#barContainers).forEach($container => {
			if (!$container.childNodes.length) {
				this.#barContainers[$container.name].parentNode.hide();								//Grid Panel
				this.#barContentContainers[$container.name].hide();
			}
		});

		Object.entries(this.#barStates).forEach(([barName, panelName]) => {
			let $contentContainer = this.#barContentContainers[barName];
			this.#barContainers[barName].childNodes.forEach($panelItem => {
				$panelItem.classList.remove('active');
			});
			if (!panelName) {
				if ($contentContainer.childNodes[1]) {
					$contentContainer.removeChild($contentContainer.childNodes[1]);
				}
				$contentContainer.hide();
			} else {
				this.#panelItems[panelName].classList.add('active');
				let $content = this.#panelContents[panelName];
				if (!$content) {
					//console.log('this.#config.panelContentConstructors:', this.#config.panelContentConstructors, panelName);
					$content = this.#panelContents[panelName] = new this.#config.panelContentConstructors[panelName]({
						panelCollapse: this.panelCollapse.bind(this, panelName)
					});
				} else if ($content.reflow) {
					$content.reflow();
				}
				let $oldContent = $contentContainer.childNodes[0];
				if ($oldContent && $oldContent !== $content) {
					$contentContainer.removeChild($oldContent);
				}
				this.#barContentContainers[barName].appendChild($content);
				$contentContainer.show();
			}
		});
	}
}

customElements.define('x-panelspace', PanelSpace);

class PanelSpaceTile extends HTMLElement {
	configure(ide, cfg) {
		this.innerHTML = cfg.title;
	}
}

customElements.define('x-panelspace-paneltile', PanelSpaceTile);
