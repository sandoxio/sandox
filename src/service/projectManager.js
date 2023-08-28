import ObjectLive from "object-live";
import busEvent from "./busEvent.js";

import createProject from "../components/modal/project/createProject/createProject.js";
import createFile from "../components/modal/project/createFile/createFile.js";
import createDirectory from "../components/modal/project/createDirectory/createDirectory.js";
import Prompt from "../components/ui/prompt/prompt.js";

import PathNavigator from "../utils/PathNavigator.js";


window.ideLog = (type, text) => {
	busEvent.fire('actions.log.add', {text: text, type: type, date: new Date()});
}

class Project {
	#buildFrame;

	constructor(projData) {
		this.model = new ObjectLive({
			isChanged: false,
			struct: projData					// {tree: [], settings: {}}
		});

		this.libRefresh('@polkadot/api', 'polkadot_api.js').then(()=>{});
		this.libRefresh('@polkadot/util-crypto', 'polkadot_util-crypto.js').then(()=>{});

		this.model.addEventListener('change', /^struct.*/, (cfg) => {
			//console.log('struct changed:', cfg);
			this.localSave();
		});
	}

	localSave() {
		localStorage.setItem('currentProject', JSON.stringify(this.model.data.struct));
	}

	#fileContentGet(filePath) {
		return filePath.split('/').reduce((node, childName) => {
			return node.childNodes.find(item => item.title === childName);
		}, projectManager.project.model.data.struct.tree[0]).value;
	}

	#libContentGet(libName) {
		return this.model.data.struct.tree[1].childNodes.find(lib => lib.title === libName).value;
	}

	build() {
		//open console
		busEvent.fire("actions.panel.open", "console");

		const indexFile = this.model.data.struct.tree[0].childNodes.find(fileNode => fileNode.title === 'app.js');
		//console.log('indexFile:', indexFile);
		if (indexFile) {
			const moduleFileByUrl = {};	// {url: filePath, "blob:http://gitmodules.local/a89230eb-1d98-4dff-8128-25ef15b7228d": "test.js"}
			const moduleUrlByFile = {};	// {filePath: url, "test.js": "blob:http://gitmodules.local/a89230eb-1d98-4dff-8128-25ef15b7228d"}

			if (this.#buildFrame) {
				document.body.removeChild(this.#buildFrame);
			}
			this.#buildFrame = document.createElement("IFRAME");
			this.#buildFrame.src = "about:blank";
			this.#buildFrame.style.visibility = "hidden";
			document.body.appendChild(this.#buildFrame);

			const scriptAdd = (scp, moduleUrl) => {
				let mod = document.createElement('script');
				if (moduleUrl) {
					mod.type = "module";
					mod.src = moduleUrl;
				} else {
					mod.textContent = scp;
				}
				this.#buildFrame.contentWindow.document.body.appendChild(mod);
			};

			const dependencies = [];

			const moduleInit = (srcFilePath) => {
				dependencies.push(srcFilePath);

				let srcPathAddr = new PathNavigator(srcFilePath);
				let srcContent;
				if (this.model.data.struct.tree[1].childNodes.find(lib => lib.title === srcFilePath)) {
					srcContent = this.#libContentGet(srcFilePath);
				} else {
					try {
						srcContent = this.#fileContentGet(srcFilePath);
					} catch (e) {}
				}
				if (!srcContent) {
					return null;
				}

				/*
					TODO: ignore imports in single comments '//',	reg = /(?<!^[\p{Zs}\t]*\/\/.*)/g
				*/
				srcContent = srcContent.replace(/(?<!\/\*(?:(?!\*\/)[\s\S\r])*?)(import.*? from[\s\t+])(['"])(.*?)\2;/igm, (_, what, quote, relativeModulePath) => {
					if (this.model.data.struct.tree[1].childNodes.find(lib => lib.title === relativeModulePath)) {		// if lib exist
						//console.log('%cfind import:', 'background:green;', relativeModulePath, moduleUrlByFile);
						if (moduleUrlByFile[relativeModulePath]) {						//if already imported early
							return `${what} "${moduleUrlByFile[relativeModulePath]}";`;
						} else {
							const replacedUrl = moduleInit(relativeModulePath);
							return replacedUrl!==null ? `${what} "${replacedUrl}";` : `${what} "${relativeModulePath}";`;		// code of imports
						}
					} else {
						const moduleFilePath = srcPathAddr.navigate(relativeModulePath);
						const replacedUrl = moduleInit(moduleFilePath);
						//console.log('%c moduleFilePath:', 'background:magenta; color:white;', moduleFilePath);
						return replacedUrl !==null ? `${what} "${replacedUrl}";` : `${what} "${relativeModulePath}";`;
					}
				});
				return depAdd(srcFilePath, srcContent);						// module blob url
			}

			const depAdd = (moduleFilePath, srcContent) => {
				const blob = new Blob([srcContent], {type: 'application/javascript'});
				const moduleUrl = URL.createObjectURL(blob);
				moduleFileByUrl[moduleUrl] = moduleFilePath
				moduleUrlByFile[moduleFilePath] = moduleUrl;
				return moduleUrl;
			}

			scriptAdd(`top.ideLog('action', 'Launched "app.js"');`);
			moduleInit('app.js');
			scriptAdd(`
				let moduleFileByUrl = ${JSON.stringify(moduleFileByUrl)};
				const errs = {};
				const pathsFix = (text) => {
					return text.replace(/(blob:https?:\\/\\/[^/]+\\/[a-z0-9\\-]{36})/gm, (_, url) => {
						return moduleFileByUrl[url];
					});
				};

				window.addEventListener("error", (event) => {
					const text = pathsFix(event.error.stack);
					if (!errs[text]) {
						errs[text] = 1;
						top.ideLog('error', text);
					}
					event.preventDefault();
				});
				window.addEventListener("unhandledrejection", function (e) {
					top.ideLog('error', pathsFix(e.reason.stack));
					event.preventDefault();
				});

				console.log = function() {
					top.ideLog('text', Array.from(arguments).join(' '));
				};
				console.warn = function() {
					top.ideLog('warn', Array.from(arguments).join(' '));
				};
			`);

			dependencies.reverse().forEach(moduleFilePath => {
				scriptAdd(null, moduleUrlByFile[moduleFilePath]);
			});
		} else {
			busEvent.fire('actions.log.add', {text: 'Index file "app.js" is missing', type: 'error', date: new Date()});
		}
	}

	#getNodeByPath(path) {

	}

	libAdd(title, name) {
		if (!this.model.data.struct.tree[1].childNodes.find(lib => lib.title === title)) {
			return new Promise(resolve => {
				this.libLoad(name).then(content => {
					this.model.data.struct.tree[1].childNodes.push({
						ico: 'file_js',
						title: title,
						value: content,
						color: '#fff',
						isDirectory: false,
						isVisible: true,
						readonly: true
					});
					resolve();
				});
			});
		} else {
			return new Promise(resolve => {				//return "dummy promise" if lib already loading
				resolve();
			})
		}
	}

	libRefresh(title, name) {
		let libObj = this.model.data.struct.tree[1].childNodes.find(lib => lib.title === title);
		if (!libObj) {
			return this.libAdd(title,name);
		} else {
			return new Promise(resolve => {
				this.libLoad(name).then(content => {
					libObj.value = content;
					resolve();
				});
			});
		}
	}

	libLoad(name) {
		return new Promise(resolve => {
			const req = new XMLHttpRequest();
			req.onload = e => {
				resolve(e.target.response);
			};
			req.open("GET", "./libs/" + name);
			req.send();
		});
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
		},
		{
			ico: 'project',
			title: 'External libraries',
			color: '#fff',
			isDirectory: true,
			isVisible: true,
			isExpanded: true,
			childNodes: []
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
			busEvent.fire('actions.log.add', 'The project was opened');
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
					//Add libs
					this.project.libAdd('@polkadot/api', 'polkadot_api.js').then(() => {});
					this.project.libAdd('@polkadot/util-crypto', 'polkadot_util-crypto.js').then(() => {});

					busEvent.fire('events.project.change', this.project);
					busEvent.fire('actions.log.add', 'New project has been created');
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
