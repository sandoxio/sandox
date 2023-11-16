import {childNodesRemove} from "../../../utils/htmlElement.js";

import {Tpl_projectInfo, Tpl_noProject} from "./projectInfo.html";
import css from "./projectInfo.css";

import mouse from "../../../utils/mouse.js";
import {} from "../../ui/tree/tree.js";
import ContextMenu from "../../ui/contextMenu/contextMenu.js";

import projectManager from "../../../service/projectManager.js";
import busEvent from "../../../service/busEvent.js";

css.install();


class IdePanelProjectInfo extends HTMLElement {
	tree;

	constructor() {
		super();

		this.init();
		busEvent.on('events.project.change', () => {
			this.init();
		});
	}

	init() {
		childNodesRemove(this);
		if (projectManager.project) {
			let $wrapper = new Tpl_projectInfo(
				{
					tree: projectManager.project.model.data.struct.tree
				}, {
					build: () => {
						projectManager.project.build();
					}
				}
			);
			$wrapper.model.bridgeChanges('tree', projectManager.project.model, 'struct.tree');
			this.appendChild($wrapper);

			$wrapper.querySelector('x-tree').configure({
				onDoubleClick: (path) => {
					if (path.match(/^External libraries\//)) {
						//console.log('open library:', path);
						return;
					}
					const nodeCfg = this.#getNodeByPath(path);
					projectManager.project.fileOpen(nodeCfg);
				},
				onContextMenu: (path) => {
					if (path.match(/^External libraries/)) {
						return;
					}
					const nodeCfg = this.#getNodeByPath(path);					// {node, parentNode, path}
					if (nodeCfg.node.isDirectory) {								//context menu for folders
						const menu = [
							{
								title: 'New file', action: ()=> {
									projectManager.project.fileCreate(nodeCfg);
								}
							},
							{
								title: 'New directory', action: () => {
									projectManager.project.directoryCreate(nodeCfg);
								}
							},
						];
						if (path.indexOf('/') !== -1) {
							menu.push({
								title: 'Delete', action: () => {
									projectManager.project.directoryDelete({parentNode: nodeCfg.parent, fileName: nodeCfg.node.title, path: path});
								}
							});
						}
						new ContextMenu(menu, {
							x: mouse.pageX,
							y: mouse.pageY
						});
					} else {													//context menu for files
						new ContextMenu([
							/*
							{
								title: 'Cut', action: ()=> {
									console.log('cut file, path:', path);
								}
							},
							 */
							{
								title: 'Delete', action: () => {
									projectManager.project.fileDelete({parentNode: nodeCfg.parent, fileName: nodeCfg.node.title, path: path});
								}
							}
						], {
							x: mouse.pageX,
							y: mouse.pageY
						});
					}
				}
			});
		} else {
			let $noProject = new Tpl_noProject({}, {
				open() {
					projectManager.import();
				},
				create() {
					//popup create
					projectManager.create().then(() => {

					});
				}
			});
			this.appendChild($noProject);
		}
	}

	#getNodeByPath(path) {
		const nodeNames = path.split('/');
		nodeNames.shift();													//remove project name from path
		return nodeNames.reduce((cfg, childName) => {
			return {
				parent: cfg.node,
				node: cfg.node.childNodes.find(item => item.title === childName),
				path: path
			};
		}, {node: projectManager.project.model.data.struct.tree[0]});
	}
}

customElements.define('x-ide-panel-projectinfo', IdePanelProjectInfo);

export default IdePanelProjectInfo;