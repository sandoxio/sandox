import AceEditor from "../../ui/aceEditor/aceEditor.js";
import projectManager from "../../../service/projectManager.js";

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
		this.#value = this.#fileNode.value;
		//this.lang = project.lang;

		this.#$editor = new AceEditor(this.#value);
		this.appendChild(this.#$editor);

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
				this.#fileNode.value = this.#value;
				//console.log('this.#project.originalFiles:', this.#project.originalFiles, this.#filePath, 'newValue', e.detail.value);
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