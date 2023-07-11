import {Tpl_network} from "./network.html";
import css from "./network.css";
css.install();


class IdePanelNetwork extends HTMLElement {
	constructor() {
		super();
		let $wrapper = new Tpl_network();
		this.appendChild($wrapper);
	}

	connectedCallback() {}
}
customElements.define('x-ide-panel-network', IdePanelNetwork);

export default IdePanelNetwork;