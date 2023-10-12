import css from "./settings.css";
css.install();

import {childNodesRemove} from "../../../utils/htmlElement.js";
import Window from "../../ui/window/window.js";
import {Tpl_settings} from "./settings.html";

import settingsService from "../../../service/settings.js";

/*
const subSettings = {
	appearance: Tpl_settings_appearance,
	keymap: Tpl_settings_keymap,
	editor: Tpl_settings_editor,
	editor_colorScheme: Tpl_settings_editor_colorScheme,
	editor_codeStyle: Tpl_settings_editor_codeStyle,
	editor_codeStyle_javascript: Tpl_settings_editor_codeStyle_javascript,
	plugins: Tpl_settings_plugins,
	build: Tpl_settings_build,
	build_compiler: Tpl_settings_build_compiler,
	build_compiler_javascript: Tpl_settings_build_compiler_javascript
}

[
				{
					title: 'Appearance',
					value: 'appearance',
					color: '#fff',
					isDirectory: false,
					isVisible: true,
					isExpanded: false
				},
				{
					title: 'Keymap',
					value: 'keymap',
					color: '#fff',
					isDirectory: false,
					isVisible: true,
					isExpanded: false
				},
				{
					title: 'Editor',
					value: 'editor',
					color: '#fff',
					isDirectory: true,
					isVisible: true,
					isExpanded: false,
					childNodes: [
						{
							title: 'Color scheme',
							value: 'editor_colorScheme',
							color: '#fff',
							isDirectory: false,
							isVisible: true,
							isExpanded: false
						},
						{
							title: 'Code style',
							value: 'editor_codeStyle',
							color: '#fff',
							isDirectory: true,
							isVisible: true,
							isExpanded: false,
							childNodes: [
								{
									ico: 'file_js',
									title: 'Javascript',
									value: 'editor_codeStyle_javascript',
									color: '#fff',
									isDirectory: false,
									isVisible: true
								}
							]
						},
					]
				},

				{
					title: 'Plugins',
					value: 'plugins',
					color: '#fff',
					isDirectory: false,
					isVisible: true,
					isExpanded: false
				},
				{
					title: 'Build, Execution',
					value: 'build',
					color: '#fff',
					isDirectory: true,
					isVisible: true,
					isExpanded: false,
					childNodes: [
						{
							title: 'Compiler',
							value: 'build_compiler',
							color: '#fff',
							isDirectory: true,
							isVisible: true,
							childNodes: [
								{
									ico: 'file_js',
									title: 'Javascript',
									value: 'build_compiler_javascript',
									color: '#fff',
									isDirectory: false,
									isVisible: true
								}
							]
						}
					]
				}
			]

*/



const settings = () => new (class {
	#$window;
	#$settings;
	#$settingsContainer;

	constructor() {
		this.#$settings = new Tpl_settings({
			selectedCategory: null,
			settingsTree: settingsService.settingsTree
		}, this);

		this.#$settingsContainer = this.#$settings.querySelector('[name=content]');

		this.#$settings.model.addEventListener('change', 'selectedCategory', (e) => {
			childNodesRemove(this.#$settingsContainer);
			console.log('selectedCategory cahnge:', e);
			const $page = settingsService.editorGet(e.newValue);
			this.#$settingsContainer.appendChild($page);
		});

		this.#$settings.model.data.selectedCategory = 'appearance';		//set default category

		this.#$window = new Window({
			title: 'Settings',
			width: 800,
			height: 500,
			uiLock: true,
			$content: this.#$settings
		});
	};

	close() {
		this.#$window.close();
	}
})();

export default settings;