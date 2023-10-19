let $currentEditor;

const editorService = new (class {
	editor;

	constructor() {
	}

	activeSet($editor) {
		this.editor = $editor.editor;
	}
})();

export default editorService;