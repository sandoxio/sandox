import {Tpl_head, Tpl_head_removeButton} from "./tab.html";
import css from "./tab.css";

css.install();

/**
 * @example:
 * 		let cfg = {
 * 		 	closeButton:	boolean				//[:false]
 * 		 	selectOnTabCreate:	boolean			//[:false]
 * 		}
 * 		let $tab = new Tab(cfg);
 * 		$tab.create(String.uid, 'tabName', $content);
 */
class Tab extends HTMLElement {
	#cfg;
	#tabs = {};
	#selected;
	#$heads;
	#$content;

	constructor(cfg) {
		super();
		this.#cfg = cfg || {};

		if (this.getAttribute('closeButton')) {
			this.#cfg.closeButton = true;
		}
		if (this.getAttribute('selectOnTabCreate')) {
			this.#cfg.selectOnTabCreate = true;
		}

		this.#$heads = document.createElement('div');
		this.#$heads.className = 'tabs';
		this.#$content = document.createElement('div');
		this.#$content.className = 'content';

		this.appendChild(this.#$heads);
		this.appendChild(this.#$content);
	}

	create(pid, tabName, $tabContent) {
		console.log('tab create:', pid, tabName);
		let $head = new Tpl_head({name: tabName}, {
			select: (e) => {
				if (!e.target.classList.contains('remove')) {
					this.select(pid);
				}
			}
		});

		if (this.#cfg.closeButton) {
			$head.appendChild(new Tpl_head_removeButton({}, {
				remove: (e) => {
					if (e.altKey) {
						this.closeAll(pid);
					} else {
						this.close(pid);
					}
				}
			}));
		}
		$head.pid = pid;
		this.#$heads.appendChild($head);
		this.#tabs[pid] = {name: tabName, $head: $head, $content: $tabContent};
		if (this.#cfg.selectOnTabCreate || Object.keys(this.#tabs).length === 1) {
			this.select(pid);
		}
		return pid;
	}

	select(pid) {
		//console.log('[Tab] select:', pid, this.#$content);
		if (this.#selected) {
			let oldTab = this.#tabs[this.#selected];
			oldTab.$head.classList.remove('selected');
			//console.log('[Tab] remove content:', oldTab.$content, 'selected:', this.#selected);
			this.#$content.removeChild(oldTab.$content);
		}
		this.#selected = pid;
		let tab = this.#tabs[pid];
		tab.$head.classList.add('selected');
		this.#$content.appendChild(tab.$content);
		this.dispatchEvent(new CustomEvent('select', {
			detail: {
				pid: pid
			}
		}));
		if (tab.$content.reflow) {
			tab.$content.reflow();
		}
	}

	isOpened(pid) {
		return !!this.#tabs[pid];
	}

	colorize(pid, color) {
		let tab = this.#tabs[pid];
		tab.$head.style.color = color;
	}

	get(pid) {
		return this.#tabs[pid];
	};

	close(pid) {
		let tab = this.#tabs[pid];
		if (this.#selected === pid) {
			let $newTabHead = tab.$head.previousSibling;
			if (!$newTabHead) {
				$newTabHead = tab.$head.nextSibling;
			}
			if ($newTabHead) {
				this.select($newTabHead.pid);
			} else {
				this.#$content.removeChild(tab.$content);
				this.#selected = null;
			}
		}
		this.#$heads.removeChild(tab.$head);
		delete this.#tabs[pid];
	}

	closeAll(excludeId) {
		Object.keys(this.#tabs).forEach(tabId => {
			if (excludeId !== tabId) {
				this.close(tabId);
			}
		});
	}
}

customElements.define('x-tab', Tab);

export default Tab;