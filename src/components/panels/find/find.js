import {Tpl_find} from "./find.html";
import css from "./find.css";
css.install();


class IdePanelFind extends HTMLElement {
	constructor() {
		super();
		let $wrapper = new Tpl_find();
		this.appendChild($wrapper);
	}

	connectedCallback() {}
}
customElements.define('x-ide-panel-find', IdePanelFind);

export default IdePanelFind;