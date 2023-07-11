import {Tpl_console} from "./console.html";
import css from "./console.css";

css.install();

import {childNodesRemove} from "../../../utils/htmlElement.js";

import busEvent from "../../../service/busEvent.js";
import ObjectLive from "object-live";

import {dateGet} from "../../../utils/date.js";

const logs = new ObjectLive({value: []});

class IdePanelConsole extends HTMLElement {
	constructor($panel) {
		super();

		this.$wrapper = new Tpl_console({}, {
			panelCollapse: () => {
				$panelSpace.panelCollapse();
			}
		});
		this.appendChild(this.$wrapper);
		this.$logContainer = this.querySelector('div[name="log"]');

		this.querySelector('item[name="clear"]').addEventListener('click', () => {
			childNodesRemove(this.$logContainer);
		});
		this.querySelector('item[name="panelCollapse"]').addEventListener('click', () => {
			$panel.panelCollapse('console');
		});

		//render old logs
		logs.data.value.forEach(logRow => {
			this.logRowRender(logRow);
		});

		//subscribe on new logs
		logs.addEventListener('set', /^value\.[^.]+$/, (cfg) => {
			if (cfg.path !== "value.length") {
				this.logRowRender(cfg.newValue);
			}
		});
	}


	/**
	 * @description render log row
	 * @param cfg
	 * @param cfg.date		{Date}		//Date
	 * @param cfg.type		{String}	//enum(success,error,text) type of message
	 * @param cfg.text		{String}	//text
	 */
	logRowRender(cfg) {
		console.log('console:', cfg);
		cfg.text += "";
		let color = {error: '#c1544e', success: '#21b20b', text: '#ffffff'}[cfg.type];
		let $msg = document.createElement('div');

		let $time = document.createElement('div');
		$time.innerHTML = dateGet(cfg.date, 'hh:mm:ss');
		$msg.appendChild($time);

		let $arrow = document.createElement('div');
		$arrow.innerHTML = '>';
		$arrow.className = 'arrow';
		$msg.appendChild($arrow);

		let $text = document.createElement('div');
		if (color) {
			$text.style.color = color;
		}
		$text.innerHTML = cfg.text.replace(/\n/g, '<br>');
		$msg.appendChild($text);
		this.$logContainer.appendChild($msg);
		this.$logContainer.scrollTo(0, this.scrollHeight);
	}

	static init() {
		busEvent.on('logAdd', e => {
			if (typeof e !== "object") {
				logs.data.value.push({text: e + "", date: new Date(), type: "text"});
			} else {
				logs.data.value.push(e);
			}
		});
	}
}

customElements.define('x-ide-panel-console', IdePanelConsole);

export default IdePanelConsole;
