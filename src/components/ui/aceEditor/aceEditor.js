import css from "./aceEditor.css";
css.install();

import settingsService from "../../../service/settings.js";

import ace from "./ace/ace.js";
import {} from "./ace/mode-javascript.js";
import {} from "./ace/theme-light.js";
import {} from "./ace/theme-darcula.js";
import {} from "./ace/ext-searchbox.js";
import cssSearchbox from "./ace/ext-searchbox.css";
cssSearchbox.install();

import Command from "../../../service/command.js";
import editorService from "../../../service/editor.js";

class AceEditor extends HTMLElement {
	editor;
	#$container;

	constructor(value) {
		super();
		this.#$container = document.createElement('div');
		this.#$container.style['flex'] = '1';
		this.appendChild(this.#$container);
		this.editor = ace.edit(this.#$container);
		this.setMode('ace/mode/javascript');

		this.editor.setOptions({
			tabSize: 4,
			useSoftTabs: false,
			scrollPastEnd: 0.7,
			newLineMode: 'unix'
		});

		//set theme
		this.themeSet(settingsService.model.data.appearance.general.theme);
		Command.on('editor.setTheme', (value) => {
			this.themeSet(value);
		});

		//show Gutter
		this.editor.renderer.setShowGutter(settingsService.model.data.appearance.uiOptions.showGutter);
		Command.on('editor.showGutter', (value) => {
			this.editor.renderer.setShowGutter(value);
		});

		//show Line numbers
		this.editor.setOptions({showLineNumbers: settingsService.model.data.appearance.uiOptions.showLineNumbers});
		Command.on('editor.showLineNumbers', (value) => {
			this.editor.setOptions({showLineNumbers: value});
		});

		//show Indent
		this.editor.setOptions({displayIndentGuides: settingsService.model.data.appearance.uiOptions.showIndent});
		Command.on('editor.showIndent', (value) => {
			this.editor.setOptions({displayIndentGuides: value});
		});

		//show Indent
		this.editor.setOptions({showInvisibles: settingsService.model.data.appearance.uiOptions.showWhiteSpaces});
		Command.on('editor.showWhiteSpaces', (value) => {
			this.editor.setOptions({showInvisibles: value});
		});

		//set fontSize
		this.editor.setOptions({fontSize: settingsService.model.data.appearance.general.fontSize + "px"});
		this.addEventListener('wheel', (e) => {
			if (e.ctrlKey) {
				let fontSize = settingsService.model.data.appearance.general.fontSize + (e.deltaY > 0 ? -1: 1);
				if (fontSize < 10) {
					fontSize = 10;
				}
				if (fontSize > 30) {
					fontSize = 30;
				}
				Command.exec('editor.fontSize', fontSize);
				e.preventDefault();
				return false;
			}
		}, true);
		Command.on('editor.fontSize', value => {
			this.editor.setOptions({fontSize: value + "px"});
		});


		if (value) {
			this.editor.setValue(value, -1);
			this.editor.getSession().setUndoManager(new ace.UndoManager());
		}

		(() => {
			const onChange = (e) => {
				if (e.action === 'insert' || e.action === 'remove') {
					let newValue = this.editor.getValue();
					//console.log('%c[Ace] change', 'background:red;', 'value:', this.editor.getValue(), e);
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
			};

			let throttle;
			this.editor.on('change', (e) => {
				if (throttle) {
					clearTimeout(throttle);
					throttle = undefined;
				}
				throttle = setTimeout(() => {
					onChange(e);
				}, 20);
			});
		})();

		this.editor.selection.on('changeCursor', (e) => {
			const pos = this.editor.getCursorPosition();
			this.dispatchEvent(
				new CustomEvent('changeCursor',
					{
						detail: {
							line: pos.row + 1,
							col: pos.column
						}
					}
				)
			);
		});
	}

	themeSet(themeName) {
		console.log('editor set theme:', themeName);
		this.editor.setTheme('ace/theme/' + themeName);
	}

	connectedCallback() {
		let attrObserver = new ResizeObserver(() => {
			this.editor.resize();
		});
		attrObserver.observe(this);

		if (this.hasAttribute('readonly')) {
			this.readOnly = true;
		}
	}

	/*
	get value() {
		return this.editor.getValue();
	}

	set value(value) {
		//console.log('%c[Ace] set', 'background:red;', 'value:', value);
		this.editor.setValue(value);
		this.editor.clearSelection();
	}
	*/

	get readOnly() {
		return false;
	}

	set readOnly(value) {
		this.editor.setReadOnly(value);
		if (value) {
			this.classList.add('readOnly');
		} else {
			this.classList.remove('readOnly');
		}
	}

	setMode(mode) {
		this.editor.getSession().setMode(mode);
	}
}

customElements.define('x-aceeditor', AceEditor);



//Set commands for editor
const cmds = ["showSettingsMenu","goToNextError","goToPreviousError","centerselection","gotoline","fold","unfold","toggleFoldWidget","toggleParentFoldWidget","foldall","foldAllComments","foldOther","unfoldall","findnext","findprevious","selectOrFindNext","selectOrFindPrevious","find","overwrite","selecttostart","gotostart","selectup","golineup","selecttoend","gotoend","selectdown","golinedown","selectwordleft","gotowordleft","selecttolinestart","gotolinestart","selectleft","selectwordright","gotowordright","selecttolineend","gotolineend","selectright","selectpagedown","pagedown","gotopagedown","selectpageup","pageup","gotopageup","scrollup","scrolldown","selectlinestart","selectlineend","togglerecording","replaymacro","jumptomatching","selecttomatching","expandToMatching","passKeysToBrowser", "removeline","duplicateSelection","sortlines","togglecomment","toggleBlockComment","modifyNumberUp","modifyNumberDown","replace","undo","redo","copylinesup","movelinesup","copylinesdown","movelinesdown","cut_or_delete","removetolinestart","removetolineend","removetolinestarthard","removetolineendhard","removewordleft","removewordright","outdent","indent","blockoutdent","blockindent","insertstring","inserttext","splitline","transposeletters","touppercase","tolowercase","autoindent","expandtoline","openlink","joinlines","invertSelection","addLineAfter","addLineBefore","openCommandPallete","modeSelect","foldToLevel"];

cmds.forEach(commandName => {
	new Command('editor.' + commandName, () => {
		if (editorService.editor) {
			editorService.editor.commands.exec(commandName, editorService.editor);
		}
	});
});

const navigateCommands = {
	"gotoleft": "navigateLeft",
	"gotoright": "navigateRight"
};
Object.entries(navigateCommands).forEach(([editorCommand, navigateCommand]) => {
	new Command('editor.' + editorCommand, () => {
		if (editorService.editor) {
			setTimeout(() => {
				editorService.editor[navigateCommand]();
			}, 10);
		}
	});
});

export default AceEditor;