import AceEditor from "../../ui/aceEditor/aceEditor.js";
import projectManager from "../../../service/projectManager.js";

import css from "./code.css";
css.install();

import settingsService from "../../../service/settings.js";
import editorService from "../../../service/editor.js";

import {Tpl_tabContents_code_statusBar} from "./code.html";
import Command from "../../../service/command.js";

/**
 * @description Code editor
 * @param filePath	{String}
 */
class IdeTabContentCode extends HTMLElement {
	#value;
	#filePath;
	#fileNode;
	#isChanged;
	#$editor;

	constructor(filePath) {
		super();
		//console.log('[IdeCodeEditor] constructor, filePath:', filePath);

		const nodeNames = filePath.split('/');
		nodeNames.shift();
		this.#fileNode = nodeNames.reduce((node, name) => {
			return node.childNodes.find(item => item.title === name);
		}, projectManager.project.model.data.struct.tree[0]);
		//console.log('fileNode:', this.#fileNode);


		this.#filePath = filePath;
		this.#value = this.#fileNode.data;
		//this.lang = project.lang;

		this.#$editor = new AceEditor(this.#value);
		this.appendChild(this.#$editor);

		this.$statusBar = new Tpl_tabContents_code_statusBar({
			filePath: filePath,
			line: 0,
			col: 0,
			lineBreak: 'CR',
			indent: 'Tab',
			size: ''
		});
		this.#fileSizeUpdate();
		this.appendChild(this.$statusBar);
		this.#$editor.addEventListener('changeCursor', e => {
			this.$statusBar.model.data.line = e.detail.line;
			this.$statusBar.model.data.col = e.detail.col;
		});

		//show statusbar
		this.#sideBarUpdate(settingsService.model.data.appearance.uiOptions.showStatusBar);
		Command.on('editor.showStatusBar', (value) => {
			this.#sideBarUpdate(value);
		});


		//console.log('[IdeCodeEditor] this.#project.originalFiles:', this.#project.originalFiles, 'project:', project, 'this.#filePath:', this.#filePath);
		/*
		this.#project.struct.files._.eventAdd('change', this.#filePath, e => {
			if (e.newValue !== this.#value && this.#value !== e.newValue) {
				this.#value = e.newValue;
				//console.log('file changed', e.newValue);
				this.#onChange();
				this.#formReflow();
			}
		});
		*/
		//console.log('this.#project.originalFiles:', this.#project.originalFiles, this.#filePath);
		//console.log('[CodeEditor] files subscribed');

		//console.log('this.#$editor:', this.#$editor);
		this.#$editor.addEventListener('change', (e) => {
			if (e.target === this.#$editor && this.#value !== e.detail.value) {
				this.#value = e.detail.value;
				this.#fileNode.data = this.#value;
				//console.log('this.#project.originalFiles:', this.#project.originalFiles, this.#filePath, 'newValue', e.detail.value);
				this.#fileSizeUpdate();
				this.#onChange();
			}
		});


		if (this.#fileNode.readOnly) {
			this.#$editor.readOnly = true;
		}

		this.#formReflow();
	}

	reflow() {
		this.#formReflow();
		editorService.activeSet(this.#$editor);
	}

	#sideBarUpdate(value) {
		if (value) {
			this.#$editor.classList.add('withStatusBar');
			this.$statusBar.classList.add('enabled');
		} else {
			this.#$editor.classList.remove('withStatusBar');
			this.$statusBar.classList.remove('enabled');
		}
	}

	#fileSizeUpdate() {
		const size = this.#value.length;
		this.$statusBar.model.data.size = size > 1000 ? (size/1000).toFixed(1) + ' kB' : size + ' B';
	}

	#onChange() {
		if (this.#fileNode.readOnly) {
			return;
		}
		this.dispatchEvent(
			new CustomEvent('change', {
				detail: {
					isChanged: this.#isChanged
				}
			})
		);
	}

	#formReflow() {
		this.#$editor.value = this.#value;
	}

}

customElements.define('x-ide-code', IdeTabContentCode);

export default IdeTabContentCode;