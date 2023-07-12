import {Tpl_settings} from "./settings.html";
import css from "./settings.css";
css.install();

/**
 * @description IDE Settings
 */
class IdeTabContentSettings extends HTMLElement {
	constructor() {
		super();

		this.appendChild(new Tpl_settings());
	}
}

customElements.define('x-ide-settings', IdeTabContentSettings);

export default IdeTabContentSettings;