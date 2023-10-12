import css from "./aceEditor.css";
css.install();

import settingsService from "../../../service/settings.js";

import ace from "./ace/ace.js";
import {} from "./ace/theme-chrome.js";
import {} from "./ace/theme-dracula.js";
import {} from "./ace/ext-searchbox.js";
import cssSearchbox from "./ace/ext-searchbox.css";
cssSearchbox.install();

class AceEditor extends HTMLElement {
	#editor;
	#$container;

	constructor(value) {
		super();
		this.#$container = document.createElement('div');
		this.#$container.style['flex'] = '1';
		this.appendChild(this.#$container);
		this.#editor = ace.edit(this.#$container);
		this.setMode('ace/mode/javascript');

		this.themeSet(settingsService.model.data.appearance.general.theme);
		settingsService.model.addEventListener('change', 'appearance.general.theme', cfg => {
			this.themeSet(cfg.newValue);
		});

		this.#editor.setOptions({
			enableBasicAutocompletion: true,
			enableLiveAutocompletion: true,
			displayIndentGuides: settingsService.model.data.appearance.uiOptions.showIndent
		});
		settingsService.model.addEventListener('change', 'appearance.uiOptions.showIndent', cfg => {
			console.log('uiOptions.showIndent:', cfg);
			this.#editor.setOptions({displayIndentGuides: cfg.newValue});
		});

		if (value) {
			this.#editor.setValue(value, -1);
		}

		this.#editor.on('change', (e) => {
			if (e.action === 'insert' || e.action === 'remove') {
				let newValue = this.#editor.getValue();
				//console.log('%c[Ace] change', 'background:red;', 'value:', this.#editor.getValue(), e);
				this.dispatchEvent(
					new CustomEvent('change',
						{
							detail: {
								value: newValue
							}
						}
					)
				);
			}
		});

		this.#editor.commands.addCommand({
			name: 'replace',
			bindKey: {win: 'Ctrl-R', mac: 'Command-Option-F'},
			exec: function(editor) {
				ace.require('ace/config').loadModule('ace/ext/searchbox', function(e) {
					e.Search(editor, true);
					// take care of keybinding inside searchbox
					// this is too hacky :(
					let kb = editor.searchBox.$searchBarKb;
					let command = kb.commandKeyBinding['ctrl-h'];
					if (command && command.bindKey.indexOf('Ctrl-R') === -1) {
						command.bindKey += '|Ctrl-R';
						kb.addCommand(command);
					}
				});
			}
		});
	}

	themeSet(themeName) {
		let aceThemeName = {'darkula': 'dracula', 'light': 'chrome'}[themeName];
		this.#editor.setTheme('ace/theme/' + aceThemeName);
	}

	connectedCallback() {
		let attrObserver = new ResizeObserver(() => {
			this.#editor.resize();
		});
		attrObserver.observe(this);

		if (this.hasAttribute('readonly')) {
			this.readOnly = true;
		}
	}

	/*
	get value() {
		return this.#editor.getValue();
	}

	set value(value) {
		//console.log('%c[Ace] set', 'background:red;', 'value:', value);
		this.#editor.setValue(value);
		this.#editor.clearSelection();
	}
	*/

	get readOnly() {
		return false;
	}

	set readOnly(value) {
		this.#editor.setReadOnly(value);
		if (value) {
			this.classList.add('readOnly');
		} else {
			this.classList.remove('readOnly');
		}
	}

	setMode(mode) {
		this.#editor.getSession().setMode(mode);
	}
}

customElements.define('x-aceeditor', AceEditor);

export default AceEditor;