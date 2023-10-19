import css from "./keymap.css";
css.install();

import {Tpl_setting_keymap} from "./keymap.html";
import settingsService from "../../../service/settings.js";
import Command from "../../../service/command.js";
import ContextMenu from "../../ui/contextMenu/contextMenu.js";
import mouse from "../../../utils/mouse.js";
import addKeymap from "../../modal/settings/addKeymap/addKeymap.js";

let keysByCommand = {};
let commandByKeys = {};
let $keymapTree;

const keymap = new (class {
	#status = true;

	constructor() {
		document.body.addEventListener('keydown', e => {
			let keyHash = this.#keyHash({code: e.code, ctrl: e.ctrlKey, alt: e.altKey, shift: e.shiftKey});
			if (e.ctrlKey || e.code.match(/^F\d+$/) || e.code === 'Tab') {
				if (['INPUT', 'TEXTAREA'].indexOf(e.target.tagName) === -1 || e.target.className.indexOf('ace_text') !==-1) {
					//console.log('preventDefault');
					e.preventDefault();
				}
			}

			if (!this.#status) {
				return;
			}

			const cmd = commandByKeys[keyHash];
			if (cmd) {
				Command.exec(cmd);
			}
			return false;
		}, true);

		if (settingsService.model.data['keymap'] && settingsService.model.data['keymap']['mapping']) {
			commandByKeys = settingsService.model.data['keymap']['mapping'];
			Object.entries(commandByKeys).forEach(([keyHash, command]) => {
				if (keysByCommand[command]) {
					keysByCommand[command].push(keyHash);
				} else {
					keysByCommand[command] = [keyHash];
				}
			});

		} else {	//add default hotkeys
			console.log('[Keymap] Add default hotkeys');
			settingsService.model.data['keymap'] = {mapping: {}};
			this.add('ctrl+KeyZ', "editor.undo");
			this.add('ctrl+shift+KeyZ', "editor.redo");
			this.add('ctrl+KeyF', "editor.find");
			this.add('ctrl+KeyR', "editor.replace");
			this.add('ctrl+KeyD', "editor.copylinesdown");
			this.add('shift+Delete', "editor.removeline");
			this.add('shift+alt+ArrowDown', "editor.movelinesdown");
			this.add('shift+alt+ArrowUp', "editor.movelinesup");
			this.add('ArrowLeft', "editor.gotoleft");
			this.add('ArrowRight', "editor.gotoright");
			this.add('ArrowUp', "editor.golineup");
			this.add('ArrowDown', "editor.golinedown");
			this.add('PageUp', "editor.gotopageup");
			this.add('PageDown', "editor.gotopagedown");
			this.add('Home', "editor.gotostart");
			this.add('End', "editor.gotoend");
			this.add('Tab', "editor.indent");
			this.add('shift+Tab', "editor.outdent");
			this.add('Delete', "editor.del");
			this.add('Backspace', "editor.backspace");
			this.add('ctrl+ArrowLeft', "editor.gotowordleft");
			this.add('ctrl+ArrowRight', "editor.gotowordright");
			this.add('ctrl+shift+ArrowLeft', "editor.selectwordleft");
			this.add('ctrl+shift+ArrowRight', "editor.selectwordright");

			this.add('ctrl+KeyA', "editor.selectall");
			this.add('ctrl+KeyC', "editor.copy");
			this.add('ctrl+KeyX', "editor.cut");
			this.add('ctrl+KeyV', "editor.paste");
			this.add('shift+ArrowLeft', "editor.selectleft");
			this.add('shift+ArrowRight', "editor.selectright");
			this.add('shift+ArrowUp', "editor.selectup");
			this.add('shift+ArrowDown', "editor.selectdown");
		}
	}

	enable() {
		this.#status = true;
	}

	disable() {
		this.#status = false;
	}

	#keyHash(keys) {
		return (Array.isArray(keys) ? keys : [keys]).map(value => {
				return typeof value === 'string' ? `${value}` : `${value.ctrl ? 'ctrl+':''}${value.shift ? 'shift+':''}${value.alt ? 'alt+':''}${value.code}`;
			})
			.sort()
			.join("|");
	}

	add(keys, commandName) {
		const keyHash = this.#keyHash(keys);
		commandByKeys[keyHash] = commandName;
		if (keysByCommand[commandName]) {
			keysByCommand[commandName].push(keyHash);
		} else {
			keysByCommand[commandName] = [keyHash];
		}
		settingsService.model.data['keymap']['mapping'][keyHash] = commandName;
		if ($keymapTree) {
			$keymapTree.reflow();
		}
	}

	remove(keyHash, commandName) {
		delete commandByKeys[keyHash];
		let index = keysByCommand[commandName].indexOf(keyHash);
		if (index !== -1) {
			keysByCommand[commandName].splice(index, 1);
		}
		settingsService.model.data['keymap']['mapping'] = commandByKeys;
		//console.log('settingsService.model.data:', settingsService.model.data['keymap']['mapping']);

		if ($keymapTree) {
			$keymapTree.reflow();
		}
	}
})();



/**
 * @description Settings for keymap
 */
let keymapTree = [];
let editorCommands = [
	{
		title: "UI options",
		childNodes: [
			["Show gutter", "editor.showGutter"],
			["Show line numbers", "editor.showLineNumbers"],
			["Show tree indent guides", "editor.showIndent"],
			["Show status bar", "editor.showStatusBar"]
		]
	},
	{
		title: "Editor actions",
		childNodes: [
			["Undo", "editor.undo"],
			["Redo", "editor.redo"],
			["Find", "editor.find"],
			["Replace", "editor.replace"],
			["Copy lines down", "editor.copylinesdown"],
			["Remove line", "editor.removeline"],
			["Move lines down", "editor.movelinesdown"],
			["Move lines up", "editor.movelinesup"],
			["Go to left", "editor.gotoleft"],
			["Go to right", "editor.gotoright"],
			["Go line up", "editor.golineup"],
			["Go line down", "editor.golinedown"],
			["Go to page up", "editor.gotopageup"],
			["Go to page down", "editor.gotopagedown"],
			["Go to start", "editor.gotostart"],
			["Go to end", "editor.gotoend"]
		]
	}
];

const addBranch = (parent, nodeCfg) => {
	if (Array.isArray(nodeCfg)) {
		const [title, commandName] = nodeCfg;
		parent.push({
			title: title,
			value: commandName,
			hint: () => {
				const keysHash = keysByCommand[commandName];
				if (keysHash && keysHash.length) {
					const $tagsContainer = document.createElement("div");
					keysHash.forEach(keyHash => {
						let $tag = document.createElement("span");
						$tag.innerHTML = keyHash.replace('Key', '').replace(/\+/g, ' + ');
						$tagsContainer.appendChild($tag);
					});
					return $tagsContainer;
				}
			},
			onContextMenu: (path) => {
				const command = path.match(/(^|\/)([^\/]+)$/)[2];
				const menu = [
					{
						title: 'Add keyboard shortcut',
						action: () => {
							addKeymap({
								title: title,
								onCreate: (key) => {
									console.log('new key:', key);
									keymap.add(key, commandName);
								}
							}, keymap);
						}
					}
				];
				const keys = keysByCommand[command];
				if (keys && keys.length) {								//context menu for folders
					if (path.indexOf('/') !== -1) {
						keys.forEach(key => {
							menu.push({
								title: 'Remove ' + key.replace('Key', ''),
								action: () => {
									keymap.remove(key, commandName);
								}
							});
						});
					}
				}
				new ContextMenu(menu, {
					x: mouse.pageX,
					y: mouse.pageY
				});
			}
		});

	} else {
		const branch = {
			title: nodeCfg.title,
			isDirectory: true,
			isExpanded: true,
			childNodes: []
		};
		parent.push(branch);

		nodeCfg.childNodes.forEach(childCfg => {
			addBranch(branch.childNodes, childCfg);
		});
	}
};

editorCommands.forEach(nodeCfg => {
	addBranch(keymapTree, nodeCfg)
});


const KeymapSettings = class extends HTMLElement {
	#$content;

	constructor() {
		super();
		this.#$content = new Tpl_setting_keymap({
			keymapTree: keymapTree
		});
		$keymapTree = this.#$content.querySelector("x-tree");
		this.appendChild(this.#$content);
	}
}

customElements.define('x-ide-settings-keymap', KeymapSettings);

settingsService.define({
	name: 'Keymap',
	path: 'keymap',
	struct: {},
	$settings: KeymapSettings
});


export default keymap;