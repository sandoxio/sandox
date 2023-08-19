import ObjectLive from "object-live";
import busEvent from "./busEvent.js";

import createProject from "../components/modal/project/createProject/createProject.js";
import createFile from "../components/modal/project/createFile/createFile.js";
import createDirectory from "../components/modal/project/createDirectory/createDirectory.js";
import Prompt from "../components/ui/prompt/prompt.js";

let originConsole = window.console.log;
const eval2 = eval;

class Project {
	constructor(projData) {
		this.model = new ObjectLive({
			isChanged: false,
			struct: projData					// {tree: [], settings: {}}
		});

		this.model.addEventListener('change', /^struct.*/, (cfg) => {
			console.log('struct changed:', cfg);
			this.localSave();
		});
	}

	localSave() {
		localStorage.setItem('currentProject', JSON.stringify(this.model.data.struct));
	}

	build() {
		//open console
		busEvent.fire("actions.panel.open", "console");

		const indexFile = this.model.data.struct.tree[0].childNodes[0].filter(fileNode => fileNode.value === 'app.js')[0];
		if (indexFile) {
			window.console.log = (msg) => {
				busEvent.fire('logAdd', {text: msg, type: 'text', date: new Date()});
			};
			eval2(indexFile.data);	//eval code
			window.console.log = originConsole;

			console.log('build');
		} else {
			busEvent.fire('actions.log.add', {text: 'Index file is missing', type: 'error', date: new Date()});
		}
	}

	/**
	 * @description open file
	 * @param cfg
	 * @param cfg.path
	 * @param cfg.node
	 * @param cfg.parentNode
	 */
	fileOpen(cfg) {
		busEvent.fire('events.file.open', cfg);
	}

	/**
	 * @description create new file in directory
	 * @param cfg
	 * @param cfg.node
	 */
	fileCreate(cfg) {
		createFile({
			node: cfg.node,
			onCreate: (data) => {
				console.log('create in folder:', cfg, data);
				cfg.node.childNodes.push({
					ico: 'file_js',
					title: data.name,
					value: "",
					color: '#fff',
					isDirectory: false,
					isVisible: true
				})
			}
		});
	}

	/**
	 *
	 * @param cfg
	 * @param cfg.parentNode
	 * @param cfg.fileName
	 */
	fileDelete(cfg) {
		new Prompt({
			title: 'Delete',
			prompt: `Delete file ${cfg.fileName} ?`,
			yes: () => {
				const fileId = cfg.parentNode.childNodes.findIndex(item => item.title === cfg.fileName);
				cfg.parentNode.childNodes.splice(fileId, 1);
				busEvent.fire('events.file.delete', {fileName: cfg.fileName, path: cfg.path});
			}
		})
	}

	directoryCreate(cfg) {
		createDirectory({
			node: cfg.node,
			onCreate: (data) => {
				console.log('create in folder:', cfg, data);
				cfg.node.childNodes.push({
					ico: 'folder',
					title: data.name,
					color: '#fff',
					isDirectory: true,
					isVisible: true,
					isExpanded: true,
					childNodes: []
				})
			}
		});
	}

	directoryDelete(cfg) {
		new Prompt({
			title: 'Delete',
			prompt: `Delete directory ${cfg.fileName} with all files ?`,
			yes: () => {
				const fileId = cfg.parentNode.childNodes.findIndex(item => item.title === cfg.fileName);
				cfg.parentNode.childNodes.splice(fileId, 1);
				busEvent.fire('events.directory.delete', {fileName: cfg.fileName, path: cfg.path});
			}
		})
	}

	download() {

	}
}

window.onerror = (msg, url, line, col, error) => {
	window.console.log = originConsole;
	busEvent.fire('logAdd', {text: "`" + msg + "`" + "at line " + line, type: "error", date: new Date()});
	return false;
};


const newProjectStruct = {
	tree: [
		{
			ico: 'project',
			title: 'newProject',
			color: '#fff',
			isDirectory: true,
			isVisible: true,
			isExpanded: true,
			childNodes: [
				{
					ico: 'file_js',
					title: 'app.js',
					value: "console.log('hello world');",
					color: '#fff',
					isDirectory: false,
					isVisible: true
				}
			]
		}
	],
	settings: {}
}

const projectManager = new (class ProjectManager {
	project;					//currentProject

	constructor() {
		busEvent.on("actions.project.create", () => {
			busEvent.fire("actions.panel.open", "projectInfo");
			this.create();
		});

		busEvent.on("actions.project.close", () => {
			this.close();
		});

		busEvent.on("events.project.change", () => {
			localStorage.setItem('currentProject', JSON.stringify(this.project.model.data.struct));
		});


		const currentProjectCfg = localStorage.getItem('currentProject');
		if (currentProjectCfg) {
			this.project = new Project(JSON.parse(currentProjectCfg));
			setTimeout(() => {		//TODO: replace by global onReady event
				busEvent.fire('actions.panel.open', 'projectInfo');
			}, 100);
		}
	}

	/**
	 * @description Open project from projData
	 * @param projData
	 * @returns {Promise}
	 */
	open(projData) {
		//console.log('[IdeProject] opening:', projectId);
		return new Promise(resolve => {
			alert("This functionality will be implemented in ms3");
			/*
			this.project = new Project(projData);
			busEvent.fire('events.project.change', this.project);
			busEvent.fire('logAdd', 'The project was opened');
			resolve(this.project);
			 */
		});
	}

	/**
	 * @description Create new project
	 * @returns {Promise}
	 */
	create() {
		return new Promise(resolve => {
			createProject({
				/**
				 * @param data	{Object}
				 * @param data	{Object}
				 */
				onCreate: (data) => {
					const projectStruct = Object.assign({}, newProjectStruct);
					projectStruct.tree[0].title = data.name;
					Object.assign(projectStruct, data);
					console.log('[PM] projectStruct:', projectStruct);
					this.project = new Project(projectStruct);

					busEvent.fire('events.project.change', this.project);
					busEvent.fire('logAdd', 'New project has been created');
					resolve(this.project);
				}
			});
		});
	}

	/**
	 * @description Close project
	 */
	close() {
		busEvent.fire('events.project.change', undefined);
	}
})();

export default projectManager;
