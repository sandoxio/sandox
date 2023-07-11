import ObjectLive from "object-live";
import busEvent from "./busEvent.js";

class Project {
	constructor(projData) {
		this.model = new ObjectLive({
			struct: projData
		});
	}

	build() {
		const code = this.model.data.struct.files['app.js'];
		new Function("__log, __error", `setTimeout(() => {const console={log: __log}; try {${code}} catch(e) {__error(e+"")}  }, 0);`)(
			(msg) => {
				busEvent.fire('logAdd', {text: msg, type: "text", date: new Date()});
			},
			(msg) => {
				busEvent.fire('logAdd', {text: msg, type: "error", date: new Date()});
			}
		);
		console.log('build', );
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


const newProjectStruct = {
	files: {
		'app.js': ''
	},
	filesCfg: {
	},
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
			this.project = new Project(projData);
			busEvent.fire('projectChange', this.project);
			busEvent.fire('logAdd', 'The project was opened');
			resolve(this.project);
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


export default projectManager;
