import ObjectLive from "object-live";
import {getPropertyByPath, setPropertyByPath} from "objectutils-propertybypath";

import {forEachRecursive} from "../utils/object.js";

const settings = new (class {
	#$editors = {};
	#settingsEditor = {};			// {path: HTMLElementConstructor}
	settingsTree = [];
	model;

	constructor() {
		console.warn('===Settings:', this);
		const localSettingsRaw = localStorage.getItem('settings');
		const settingsData = localSettingsRaw ? JSON.parse(localSettingsRaw) : {};
		this.model = new ObjectLive(settingsData);
		this.model.addEventListener('change', /.*/, _ => {
			console.warn('settings changed', _.path, this.model);
			localStorage.setItem('settings', JSON.stringify(this.model.data));
		});
	}

	editorGet(path) {
		/*
		let $editor = this.#$editors[path];
		if (!$editor) {
			$editor = this.#$editors[path] = new this.#settingsEditor[path]();
		}
		return $editor;
		*/
		console.log('editor get:', path);
		return new this.#settingsEditor[path]();
	}

	settingsByPathGet(path) {
		return path.split('.').reduce((acc, nodeName) => {
			let node = acc[nodeName];
			if (!node) {
				console.log('[sm] set path:', path, acc, nodeName);
				acc[nodeName] = {};
				node = acc[nodeName];
			}
			return node;
		}, this.model.data);
	}

	/**
	 * @param cfg				{Object}
	 * @param cfg.name			{String}
	 * @param cfg.path			{String}
	 * @param cfg.struct		{Object}
	 * @param cfg.isDirectory	{Boolean}
	 * @param cfg.$settings		{HTMLElement}
	 */
	define(cfg) {
		this.#settingsEditor[cfg.path] = cfg.$settings;

		//set settings tree
		cfg.path.split('.').reduce((acc, nodeName) => {
			let node = acc.find(item => item === nodeName);
			if (node) {
				return node.childNodes;
			} else {
				acc.push({
					title: cfg.name,
					value: cfg.path.replace(/\./g, '_'),
					color: '#fff',
					isDirectory: cfg.isDirectory,
					isVisible: true,
					isExpanded: false
				});
			}
		}, this.settingsTree);

		//upgrade default struct
		const rootModel = this.settingsByPathGet(cfg.path);
		forEachRecursive(cfg.struct, (value, path) => {
			path.split('.').reduce((acc, nodeName) => {
				let node = acc[nodeName];
				if (node === undefined) {
					node = acc[nodeName] = value;
				}
				return node;
			}, rootModel);
		});

		console.log('[Settings] define:', cfg);
		console.log(JSON.parse(localStorage.settings));
	}
})();

export default settings;