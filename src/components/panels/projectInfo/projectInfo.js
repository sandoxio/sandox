import {childNodesRemove} from "../../../utils/htmlElement.js";

import {Tpl_projectInfo, Tpl_projectInfo_item, Tpl_noProject} from "./projectInfo.html";
import css from "./projectInfo.css";
import projectManager from "../../../service/projectManager.js";
import busEvent from "../../../service/busEvent.js";

css.install();

import IdeTabContentCode from "../../tabContents/code/code.js";

class IdePanelProjectInfo extends HTMLElement {
	constructor() {
		super();

		this.init();
		busEvent.on('projectChange', () => {
			this.init();
		});
	}

	init() {
		childNodesRemove(this);
		if (projectManager.project) {
			console.log('[ProjectInfo] init project:', projectManager.project);
			let $wrapper = new Tpl_projectInfo({}, {
				build: () => {
					projectManager.project.build();
				}
			});
			this.appendChild($wrapper);
			const $projectInfo = $wrapper.querySelector('div[name="projectInfo"]');


			this.$tree = new Tpl_projectInfo_item({name: 'project'});
			$projectInfo.appendChild(this.$tree);
			this.$container = $projectInfo.querySelector('ul[name="tree"]');

			this.projectTree = [];
			Object.entries(projectManager.project.model.data.struct.files).forEach(([fileName, code]) => {
				let fileNameCl = fileName.replace('\\.', '.');
				this.projectTree.push({
					name: fileNameCl,
					icon: 'file_code',
					open: {component: IdeTabContentCode, params: [fileName, code]}
				});
			});
			this.listRender(this.$container, this.projectTree);
		} else {
			let $noProject = new Tpl_noProject({}, {
				open() {
					projectManager.open();
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

	/**
	 * @description render item of list of files
	 * @param $rootNode
	 * @param list
	 */
	listRender($rootNode, list) {
		list.forEach(itemCfg => {
			//console.log('item:', itemCfg);
			let $item = document.createElement('li');

			let $icon = document.createElement('i');
			$icon.className = 'ico white ' + itemCfg.icon;

			let $name = document.createElement('span');
			$name.innerHTML = itemCfg.name;

			$item.appendChild($icon);
			$item.appendChild($name);

			$rootNode.appendChild($item);

			if (itemCfg.childNodes && itemCfg.childNodes.length > 0) {
				let $container = document.createElement('ul');
				$item.appendChild($container);
				this.listRender($container, itemCfg.childNodes);
			} else {
				$item.addEventListener('dblclick', () => {
					//open file
					busEvent.fire('fileOpen', itemCfg.name);

					//this.$ide.tabOpen(itemCfg.name, itemCfg.open.component, itemCfg.open.params);
				});
			}
		});
	}
}

customElements.define('x-ide-panel-projectinfo', IdePanelProjectInfo);

export default IdePanelProjectInfo;