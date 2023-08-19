import css from "./prompt.css";
css.install();

import Window from "../window/window.js";
import {Tpl_Prompt} from "./prompt.html";

/**
 * @param cfg			{Object}
 * @param cfg.title		{String}
 * @param cfg.prompt	{String}
 * @param cfg.yes		{Function}
 * @param cfg.no		{Function}
 */
const Prompt = class {
	#$window;
	#$content;
	#cfg;

	constructor(cfg) {
		this.#cfg = cfg;
		this.#$content = new Tpl_Prompt({prompt: cfg.prompt}, this);
		this.#$window = new Window({
			title: cfg.title,
			width: 340,
			height: 145,
			uiLock: true,
			$content: this.#$content
		});
		//this.#$window.querySelector('input[name=name]').focus();
	};

	yes() {
		this.#$window.close();
		this.#cfg.yes();
	}

	no() {
		this.#$window.close();
		if (this.#cfg.no) {
			this.#cfg.no();
		}
	}

	cancel() {
		this.#$window.close();
	}
};


export default Prompt;