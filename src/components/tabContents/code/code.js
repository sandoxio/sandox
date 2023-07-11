import AceEditor from "../../ui/aceEditor/aceEditor.js";
import projectManager from "../../../service/projectManager.js";

/**
 * @description Code editor
 * @param fileName	{String}
 */
class IdeTabContentCode extends HTMLElement {
	#value;
	#fileName;
	#fileCfg;
	#isChanged;
	#$editor;

	constructor(fileName) {
		super();
		console.log('[IdeCodeEditor] constructor, fileName:', fileName);

		this.#fileName = fileName;
		this.#value = projectManager.project.model.data.struct.files[this.#fileName];
		//this.lang = project.lang;
		this.#fileCfg = projectManager.project.model.data.struct.filesCfg[this.#fileName] || {};

		this.#$editor = new AceEditor(this.#value);
		this.appendChild(this.#$editor);

		//console.log('[IdeCodeEditor] this.#project.originalFiles:', this.#project.originalFiles, 'project:', project, 'this.#fileName:', this.#fileName);
		/*
		this.#project.struct.files._.eventAdd('change', this.#fileName, e => {
			if (e.newValue !== this.#value && this.#value !== e.newValue) {
				this.#value = e.newValue;
				//console.log('file changed', e.newValue);
				this.#onChange();
				this.#formReflow();
			}
		});
		*/
		//console.log('this.#project.originalFiles:', this.#project.originalFiles, this.#fileName);
		//console.log('[CodeEditor] files subscribed');

		console.log('this.#$editor:', this.#$editor);
		this.#$editor.addEventListener('change', (e) => {
			if (e.target === this.#$editor && this.#value !== e.detail.value) {
				this.#value = e.detail.value;
				projectManager.project.model.data.struct.files[this.#fileName] = this.#value;
				//console.log('this.#project.originalFiles:', this.#project.originalFiles, this.#fileName, 'newValue', e.detail.value);
				this.#onChange();
			}
		});

		if (this.#fileCfg.readOnly) {
			this.#$editor.readOnly = true;
		}

		this.#formReflow();
	}

	reflow() {
		this.#formReflow();
	}

	#onChange() {
		if (this.#fileCfg.readOnly) {
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