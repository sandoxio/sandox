import {Tpl_examples} from "./examples.html";
import css from "./examples.css";
css.install();


class IdePanelExamples extends HTMLElement {
	constructor() {
		super();
		let $wrapper = new Tpl_examples();
		this.appendChild($wrapper);
	}

	connectedCallback() {}
}
customElements.define('x-ide-panel-examples', IdePanelExamples);

export default IdePanelExamples;