import theme from "../../themes/darkula/theme.js";

theme.install();

import {Tpl_wrapper} from "./app.html";
import css from "./app.css";

css.install();

import {} from "../ui/panelspace/panelspace.js";

import IdePanelProjectInfo from "../panels/projectInfo/projectInfo.js";
import IdePanelNetwork from "../panels/network/network.js";
import IdePanelExamples from "../panels/examples/examples.js";
import IdePanelConsole from "../panels/console/console.js";
import IdePanelFind from "../panels/find/find.js";

import IdeTabContentCode from "../tabContents/code/code.js";
import IdeTabContentSettings from "../tabContents/settings/settings.js";

import {} from "../ui/menu/menu.js";
import Tab from "../ui/tab/tab.js";

import projectManager from "../../service/projectManager.js";
import busEvent from "../../service/busEvent.js";


const App = class {
	constructor() {
		const menuConfig = {
			value: [
				{
					title: 'File',
					childNodes: [
						{
							title: 'Create project',
							action: () => {
								busEvent.fire("projectCreate");
							}
						},
						{
							title: 'Open project',
							action: () => {
								alert("This functionality will be implemented in ms3");
							}
						},
						{
							title: 'Close project',
							action: () => {
								alert("This functionality will be implemented in ms3");
							}
						},
						{
							title: 'Export project',
							action: () => {
								alert("This functionality will be implemented in ms3");
							}
						},
						{
							title: 'Settings',
							action: () => {
								busEvent.fire("settingsOpen");
							}
						},
					]
				},
				/*				{
									title: 'Edit',
									childNodes: [
										{
											title: 'Cut',
											action: () => {}
										},
										{
											title: 'Copy',
											action: () => {}
										},
										{
											title: 'Paste',
											action: () => {}
										},
										{
											title: 'Delete',
											action: () => {}
										}
									]
								},*/
				{
					title: 'Build',
					childNodes: [
						{
							title: 'Build project',
							action: () => {
								if (projectManager.project) {
									projectManager.project.build();
								}
							}
						}
					]
				},
				{
					title: 'Help',
					childNodes: [
						{
							title: 'Getting Started',
							action: () => {
								alert("This functionality will be implemented in future");
							}
						},
						{
							title: 'Learn IDE Features',
							action: () => {
								alert("This functionality will be implemented in future");
							}
						},
					]
				}
			]
		};
		const $wrapper = new Tpl_wrapper({menu: menuConfig});
		this.$panelSpace = $wrapper.querySelector("x-panelspace");
		document.body.appendChild($wrapper);

		const config = {
			barSize: {
				top: 200,
				left: 200,
				right: 200,
				bottom: 200
			},
			panels: {
				projectInfo: {title: 'Project', bar: 'left', isOpen: false},
				network: {title: 'Network', bar: 'left', isOpen: false},
				examples: {title: 'Examples', bar: 'left'},
				console: {title: 'Console', bar: 'bottom'},
				find: {title: 'Find', bar: 'bottom'},
			}
		};

		this.$panelSpace.init({
			barSize: config.barSize,
			panels: config.panels,
			panelContentConstructors: {
				projectInfo: IdePanelProjectInfo,
				examples: IdePanelExamples,
				network: IdePanelNetwork,
				console: IdePanelConsole,
				find: IdePanelFind,
			}
		});

		this.$tabs = new Tab({closeButton: true, selectOnTabCreate: true});
		this.$panelSpace.$workspace.appendChild(this.$tabs);

		busEvent.on("fileOpen", (filename) => {
			console.log('open:', filename);
			this.fileOpen(filename);
		});

		busEvent.on("panelOpen", (panelName) => {
			this.$panelSpace.panelSelect(panelName);
		});

		busEvent.on("settingsOpen", () => {
			this.settingsOpen();
		});

		//console.log("this.$panelSpace:", this.$panelSpace);
	}

	fileOpen(filename) {
		let tabPid = ':' + filename;
		if (this.$tabs.isOpened(tabPid)) {
			console.log('open tab pid:', tabPid);
			this.$tabs.select(tabPid);
		} else {
			let $tabContent = new IdeTabContentCode(filename);
			this.$tabs.create(tabPid, filename, $tabContent);

			let colorize = (isChanged) => {
				this.$tabs.colorize(tabPid, isChanged ? 'var(--active-text-color)' : 'var(--text-color)');
			};
			$tabContent.addEventListener('change', (e) => {
				if (e.target === $tabContent) {
					colorize(e.detail.isChanged);
				}
			});
			//console.log('this.$tabs:', this, this.$tabs);
			colorize($tabContent.isChanged);
		}
	}

	settingsOpen() {
		let tabPid = ':settings';
		if (this.$tabs.isOpened(tabPid)) {
			this.$tabs.select(tabPid);
		} else {
			let $tabContent = new IdeTabContentSettings();
			this.$tabs.create(tabPid, 'IDE Settings', $tabContent);
		}
	}
};

new App();