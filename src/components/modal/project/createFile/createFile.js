import css from "./createFile.css";
css.install();

import Window from "../../../ui/window/window.js";
import {Tpl_createFile} from "./createFile.html";

/**
 * @param cfg				{Object}
 * @param cfg.onCreate		{Function}
 * @param cfg.parentNode	{Object}
 */
const createFile = cfg => new (class {
	#$window;
	#$createFile;
	#cfg;

	constructor() {
		this.#cfg = cfg;
		this.#$createFile = new Tpl_createFile({name: ''}, this);
		this.#$window = new Window({
			title: 'New file',
			width: 340,
			height: 145,
			uiLock: true,
			$content: this.#$createFile
		});
		this.#$window.querySelector('input[name=name]').focus();
	};

	onKeyDown(e) {
		if (e.code === "Enter") {
			this.create();
		}
	}

	create() {
		if (this.#cfg.node.childNodes.find(item => item.title === this.#$createFile.model.data.name)) {
			alert('already exist');
			return;
		}
		this.#$window.close();
		this.#cfg.onCreate({
			name: this.#$createFile.model.data.name
		});
	}

	cancel() {
		this.#$window.close();
	}
})();


export default createFile;