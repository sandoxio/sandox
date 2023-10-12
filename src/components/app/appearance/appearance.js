import {Tpl_setting_appearance} from "./appearance.html";
import settings from "../../../service/settings.js";

import darkula from "./themes/darkula/theme.js";
import light from "./themes/light/theme.js";

/** Settings */
const Appearance = class extends HTMLElement {
	#$content;

	constructor() {
		super();
		this.#$content = new Tpl_setting_appearance(settings.model.data.appearance);
		this.appendChild(this.#$content);
		this.#$content.model.bridgeChanges('', settings.model, 'appearance');
	}
}

customElements.define('x-ide-settings-appearance', Appearance);

settings.define({
	name: 'Appearance',
	path: 'appearance',
	struct: {
		general: {
			syncThemeWithOs: false,
			theme: 'darkula'
		},
		uiOptions: {
			showIndent: true,
			showStatusBar: true,
		},
		toolWindows: {
			showToolBar: true
		}
	},
	$settings: Appearance
});


/** Set theme */
const themes = {darkula, light};
let currentTheme;
const setTheme = (themeName) => {
	console.warn('set theme:', themeName);
	currentTheme = themes[themeName];
	themes[themeName].install();
};

settings.model.addEventListener('change', 'appearance.general.theme', (cfg) => {
	currentTheme.remove();
	setTheme(cfg.newValue);
});

/*
if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
	// dark mode
} else {
	// light
}

window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
	const newColorScheme = e.matches ? "dark" : "light";
});
 */

setTheme(settings.model.data.appearance.general.theme);