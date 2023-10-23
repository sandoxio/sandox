import css from "./appearance.css";
css.install();

import {Tpl_setting_appearance} from "./appearance.html";
import Command from "../../../service/command.js";
import settings from "../../../service/settings.js";

import darcula from "./themes/darcula/theme.js";
import light from "./themes/light/theme.js";
import settingsService from "../../../service/settings.js";

/** Settings */
const Appearance = class extends HTMLElement {
	#$content;

	constructor() {
		super();
		this.#$content = new Tpl_setting_appearance(settings.model.data.appearance);
		this.appendChild(this.#$content);

		//Run commands for changes
		const cmds = [
			['editor.setTheme', 'general.theme'],
			['editor.showGutter', 'uiOptions.showGutter'],
			['editor.showLineNumbers', 'uiOptions.showLineNumbers'],
			['editor.showIndent', 'uiOptions.showIndent'],
			['editor.showWhiteSpaces', 'uiOptions.showWhiteSpaces'],
			['editor.showStatusBar', 'uiOptions.showStatusBar'],
			['editor.showToolBar', 'toolWindows.showToolBar']
		];

		cmds.forEach(([commandName, settingsPath]) => {
			this.#$content.model.addEventListener('change', settingsPath, (cfg) => {
				Command.exec(commandName, cfg.newValue);
			});
		});
	}
}

customElements.define('x-ide-settings-appearance', Appearance);

settings.define({
	name: 'Appearance',
	path: 'appearance',
	struct: {
		general: {
			syncThemeWithOs: false,
			theme: 'darcula',
			fontSize: 14
		},
		uiOptions: {
			showGutter: true,
			showLineNumbers: true,
			showIndent: true,
			showWhiteSpaces: false,
			showStatusBar: true,
		},
		toolWindows: {
			showToolBar: true
		}
	},
	$settings: Appearance
});


/** Set current theme */
(() => {
	let currentThemeCss;
	new Command('editor.setTheme', themeName => {
		if (currentThemeCss) {
			currentThemeCss.remove();
		}
		currentThemeCss = {darcula, light}[themeName];
		currentThemeCss.install();
		settings.model.data.appearance.general.theme = themeName;
	});
	Command.exec('editor.setTheme', settings.model.data.appearance.general.theme);
})();

new Command('editor.fontSize', value => {
	settingsService.model.data.appearance.general.fontSize = value;
});

new Command('editor.showGutter', value => {
	if (value !== true && value !== false) {
		value = !settingsService.model.data.appearance.uiOptions.showGutter;			//invert value
	}
	settingsService.model.data.appearance.uiOptions.showGutter = value;
	return value;
});

new Command('editor.showLineNumbers', value => {
	if (value !== true && value !== false) {
		value = !settingsService.model.data.appearance.uiOptions.showLineNumbers;		//invert value
	}
	settingsService.model.data.appearance.uiOptions.showLineNumbers = value;
	return value;
});

new Command('editor.showIndent', value => {
	if (value !== true && value !== false) {
		value = !settingsService.model.data.appearance.uiOptions.showIndent;			//invert value
	}
	settingsService.model.data.appearance.uiOptions.showIndent = value;
	return value;
});

new Command('editor.showWhiteSpaces', value => {
	if (value !== true && value !== false) {
		value = !settingsService.model.data.appearance.uiOptions.showWhiteSpaces;		//invert value
	}
	settingsService.model.data.appearance.uiOptions.showWhiteSpaces = value;
	return value;
});

new Command('editor.showStatusBar', value => {
	if (value !== true && value !== false) {
		value = !settingsService.model.data.appearance.uiOptions.showStatusBar;			//invert value
	}
	settingsService.model.data.appearance.uiOptions.showStatusBar = value;
	return value;
});

new Command('editor.showToolBar', value => {
	if (value !== true && value !== false) {
		value = !settingsService.model.data.appearance.toolWindows.showToolBar;			//invert value
	}
	settingsService.model.data.appearance.toolWindows.showToolBar = value;
	return value;
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


