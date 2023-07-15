import ObjectLive from "object-live";
import busEvent from "./busEvent.js";

let originConsole = window.console.log;
const eval2 = eval;

class Project {
	constructor(projData) {
		this.model = new ObjectLive({
			struct: projData
		});
		this.localSave();

		this.model.addEventListener('change', /^struct.*/, () => {
			this.localSave();
		});
	}

	localSave() {
		localStorage.setItem('currentProject', JSON.stringify(this.model.data.struct));
	}

	build() {
		//open console
		busEvent.fire("panelOpen", "console");

		const code = this.model.data.struct.files['app.js'];
		window.console.log = (msg) => {busEvent.fire('logAdd', {text: msg, type: 'text', date: new Date()});};
		eval2( code );
		window.console.log = originConsole;

		console.log('build');
	}

	fileAdd() {

	}

	fileRemove() {

	}

	compile() {

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
	files: {
		'app.js': ''
	},
	filesCfg: {},
	settings: {}
}

const projectManager = new (class ProjectManager {
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
			busEvent.fire('projectChange', this.project);
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
			this.project = new Project(newProjectStruct);			//TODO: recursive clone struct
			busEvent.fire('projectChange', this.project);
			busEvent.fire('logAdd', 'New project has been created');
			resolve(this.project);
		});
	}
})();

busEvent.on("projectCreate", () => {
	busEvent.fire("panelOpen", "projectInfo");
	projectManager.create();
});

const currentProjectCfg = localStorage.getItem('currentProject');
if (currentProjectCfg) {
	projectManager.project = new Project(JSON.parse(currentProjectCfg));
	setTimeout(() => {		//TODO: replace by global onReady event
		busEvent.fire('panelOpen', 'projectInfo');
	}, 100);
}

export default projectManager;
