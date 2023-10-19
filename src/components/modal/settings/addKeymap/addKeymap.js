import css from "./addKeymap.css";
css.install();

import Window from "../../../ui/window/window.js";
import {Tpl_addKeymap} from "./addKeymap.html";


/**
 * @param cfg				{Object}
 * @param cfg.title			{String}
 * @param cfg.onCreate		{Function}
 * @param keymap			{Object}
 */
const addKeymap = (cfg, keymap) => new (class {
	#$window;
	#$keymap;
	#cfg;

	constructor() {
		keymap.disable();
		this.#cfg = cfg;
		this.#$keymap = new Tpl_addKeymap({title: cfg.title, key: '', keyHash: ''}, this);
		this.#$window = new Window({
			title: 'Keyboard Shortcut',
			width: 340,
			height: 150,
			uiLock: true,
			$content: this.#$keymap,
			onClose: () => {
				keymap.enable();
			}
		});

		document.addEventListener('keydown', (e) => {
			if (e.code.indexOf('Control')!==-1 || e.code.indexOf('Shift')!==-1 || e.code.indexOf('Alt')!==-1) {
				return;
			}
			const keyHash = `${e.ctrlKey ? 'ctrl+':''}${e.shiftKey ? 'shift+':''}${e.altKey ? 'alt+':''}${e.code}`;
			this.#$keymap.model.data.keyHash = keyHash;
			this.#$keymap.model.data.key = keyHash.replace('Key', '').replace(/\+/g, ' + ');
		}, true);
	};

	onKeyDown(e) {
		if (e.code === "Enter") {
			this.create();
		}
	}

	create() {
		keymap.enable();
		this.#$window.close();
		this.#cfg.onCreate(this.#$keymap.model.data.keyHash);
	}

	cancel() {
		this.#$window.close();
	}
})();


export default addKeymap;