import ObjectLive from "object-live";
import JSZip from "jszip";
import busEvent from "./busEvent.js";

import createProject from "../components/modal/project/createProject/createProject.js";
import createFile from "../components/modal/project/createFile/createFile.js";
import createDirectory from "../components/modal/project/createDirectory/createDirectory.js";
import Prompt from "../components/ui/prompt/prompt.js";

import PathNavigator from "../utils/PathNavigator.js";
import file from "../utils/file.js";
import {forEachRecursive} from "../utils/object";


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

		//this.libRefresh('@polkadot/api', 'polkadot_api.js').then(()=>{});
		//this.libRefresh('@polkadot/util-crypto', 'polkadot_util-crypto.js').then(()=>{});

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
		}, projectManager.project.model.data.struct.tree[0]).data;
	}

	#libContentGet(libName) {
		return this.model.data.struct.tree[1].childNodes.find(lib => lib.title === libName).data;
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

				window.addEventListener("error", (e) => {
					const text = pathsFix(e.message + '\\nat ' + e.filename + ':' + e.lineno + ':' + e.colno);
					if (!errs[text]) {
						errs[text] = 1;
						top.ideLog('error', text);
					}
					e.preventDefault();
				});
				window.addEventListener("unhandledrejection", function (e) {
					const text = e.reason.fileName ? ('ReferenceError: ' + e.reason.message + '\\nat ' + e.reason.fileName + ':' + e.reason.lineNumber + ':' + e.reason.columnNumber) : e.reason.stack;
					top.ideLog('error', pathsFix(text));
					e.preventDefault();
				});

				console.log = function() {
					top.ideLog('text', Array.from(arguments).join(' '));
				};
				console.warn = function() {
					top.ideLog('warn', Array.from(arguments).join(' '));
				};
			`);

			setTimeout(() => {
				dependencies.reverse().forEach(moduleFilePath => {
					scriptAdd(null, moduleUrlByFile[moduleFilePath]);
				});
			}, 0);
		} else {
			busEvent.fire('actions.log.add', {text: 'Index file "app.js" is missing', type: 'error', date: new Date()});
		}
	}


	libAdd(title, name) {
		if (!this.model.data.struct.tree[1].childNodes.find(lib => lib.title === title)) {
			return new Promise(resolve => {
				this.libLoad(name).then(content => {
					this.model.data.struct.tree[1].childNodes.push({
						ico: 'file_js',
						title: title,
						data: content,
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
					libObj.data = content;
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

	open() {

	}

	import() {


	}

	export() {
		console.log('[Project] export');
		const zip = new JSZip();

		const nodeAdd = (path, node) => {
			if (node.isDirectory) {
				zip.folder(path);
				node.childNodes.forEach(childNode => {
					nodeAdd( (path  ? path + '/': '') + childNode.title, childNode);
				});
			} else {
				zip.file(path, node.data);
			}
		}
		nodeAdd('', projectManager.project.model.data.struct.tree[0]);

		zip.generateAsync({type:"blob"}).then(function(content) {
			file.download(content, projectManager.project.model.data.struct.tree[0].title + '.zip');
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
					ico: /\.js$/.test(data.name) ? 'file_js' : 'file_code',
					title: data.name,
					data: "",
					color: '#fff',
					isDirectory: false,
					isVisible: true
				});
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
				});
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

	/**
	 *
	 * @param path
	 * @param cfg			{Object}
	 * @param cfg.content	{String}
	 */
	fileAdd(path, cfg) {
		const nodes = path.split('/');
		const fileName = nodes.pop();
		const dirPath = nodes.join('/');
		const dirNode = dirPath ? this.directoryAdd(dirPath).childNodes : projectManager.project.model.data.struct.tree[0].childNodes;
		let existedFile = dirNode.findIndex(item => item.title === fileName);
		if (existedFile !== -1) {
			dirNode.splice(existedFile, 1);
		}
		//console.log('add file:', dirPath, fileName);
		dirNode.push({
			ico: /\.js$/.test(fileName) ? 'file_js' : 'file_code',
			title: fileName,
			data: cfg.content,
			color: '#fff',
			isDirectory: false,
			isVisible: true
		});
	}

	directoryAdd(path) {
		return path.split('/').reduce((node, childName) => {
			let child = node.childNodes.find(item => item.title === childName);
			if (child) {
				return child;
			} else {
				child = {
					ico: 'folder',
					title: childName,
					color: '#fff',
					isDirectory: true,
					isVisible: true,
					isExpanded: true,
					childNodes: []
				};
				//console.log('create dir:', path, child, node);
				node.childNodes.push(child);
				return child;
			}
		}, projectManager.project.model.data.struct.tree[0]);
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
					data: "",
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
			if (this.project) {
				localStorage.setItem('currentProject', JSON.stringify(this.project.model.data.struct));
			} else {
				localStorage.removeItem('currentProject');
			}
		});

		busEvent.on("actions.project.import", () => {
			this.import();
		});

		busEvent.on("actions.project.export", () => {
			this.export();
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
					busEvent.fire('actions.file.closeAll');
					resolve(this.project);
				}
			});
		});
	}

	/**
	 * @description Close project
	 */
	close() {
		this.project = undefined;
		busEvent.fire('events.project.change', undefined);
		busEvent.fire('actions.file.closeAll');
	}

	export() {
		if (this.project) {
			this.project.export();
		}
	}

	import() {
		console.log('[Project] export');

		let input = document.createElement('input');
		input.type = 'file';
		input.click();
		input.onchange = e => {
			let file = e.target.files[0];
			if (file.type !== "application/x-zip-compressed") {
				alert('The project must be packaged in a zip archive');
			} else {
				const reader = new FileReader();
				reader.onload = () => {
					const defaultName = 'app';
					const projectStruct = Object.assign({}, newProjectStruct);
					projectStruct.tree[0].title = defaultName;
					Object.assign(projectStruct, {name: defaultName, language: 'js'});
					console.log('[PM] projectStruct:', projectStruct);
					this.project = new Project(projectStruct);
					//Add libs
					this.project.libAdd('@polkadot/api', 'polkadot_api.js').then(() => {});
					this.project.libAdd('@polkadot/util-crypto', 'polkadot_util-crypto.js').then(() => {});
					busEvent.fire('events.project.change', this.project);
					busEvent.fire('actions.log.add', 'New project has been opened');
					busEvent.fire('actions.file.closeAll');

					const zip = new JSZip();
					zip.loadAsync(reader.result)
						.then(zipContent => {
							Object.entries(zipContent.files).forEach(([path, value]) => {
								//console.log('file:', path, value);
								if (path[path.length-1] === '/') {	//isDirectory
									this.project.directoryAdd(path.slice(0, -1));
								} else {
									value.async("string").then(content => {
										this.project.fileAdd(path, {content: content});
									});
								}
							});
						});
				};
				reader.readAsArrayBuffer(file);
			}
			console.log('file:', file);
		}

	}
})();

export default projectManager;
