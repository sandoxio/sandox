import {Tpl_setting_keymap} from "./keymap.html";
import settings from "../../../service/settings.js";


const systemKeys = [{code: 'KeyF', ctrl: true}, {code: 'KeyR', ctrl: true}, 'F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'F8', 'F10', 'F11', 'F12'];
document.body.addEventListener('keydown', e => {
	if (systemKeys.find(key => {
		return key === e.code || (key.code === e.code && e.ctrlKey === key.ctrl)
	})) {
		e.preventDefault();
	}
}, true);


/**
 * @description Settings for keymap
 */

const Keymap = class extends HTMLElement {
	#$content;

	constructor() {
		super();
		this.#$content = new Tpl_setting_keymap(settings.model.data['keymap']);
		this.appendChild(this.#$content);
	}
}

customElements.define('x-ide-settings-keymap', Keymap);

settings.define({
	name: 'Keymap',
	path: 'keymap',
	struct: {},
	$settings: Keymap
});