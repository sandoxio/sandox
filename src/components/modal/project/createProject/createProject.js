import css from "./createProject.css";
css.install();

import {} from "../../../ui/dropdown/dropdown.js";
import Window from "../../../ui/window/window.js";
import {Tpl_createProject} from "./createProject.html";

/**
 * @param cfg			{Object}
 * @param cfg.onCreate	{Object}
 */
const createProject = cfg => new (class {
	#$window;
	#$createProject;
	#onCreate;

	constructor() {
		this.#onCreate = cfg.onCreate;
		this.#$createProject = new Tpl_createProject({name: '', language: 'js'}, this);
		this.#$window = new Window({
			title: 'New project',
			width: 340,
			height: 160,
			uiLock: true,
			$content: this.#$createProject
		});
		this.#$window.querySelector('input[name=name]').focus();
	};

	onKeyDown(e) {
		if (e.code === "Enter") {
			this.create();
		}
	}

	create() {
		this.#$window.close();
		this.#onCreate({
			name: this.#$createProject.model.data.name,
			language: this.#$createProject.model.data.language
		});
	}

	cancel() {
		this.#$window.close();
	}
})();


export default createProject;