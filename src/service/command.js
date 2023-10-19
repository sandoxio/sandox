/**
 * @singleton
 * @description command bus
 * @example
 * 		new Command('open', (fileName) => { ... });
 * 		Command.exec('open', "testfile");
 * 		Command.on('open', (fileName) => { ... });
 */

import Pool from "pool-handlers";

const commands = {};
const Command = class {
	mainHandler;
	eventHandlers;

	constructor(name, mainHandler) {
		this.mainHandler = mainHandler;
		commands[name] = this;
		this.eventHandlers = new Pool();
	}

	static on(name, handler) {
		const cmd = commands[name];
		if (cmd) {
			cmd.eventHandlers.push(handler);
		} else {
			throw new Error('Wrong command: '+ name);
		}
	}

	static exec(name, data) {
		const cmd = commands[name];
		if (cmd) {
			const res = cmd.mainHandler(data);
			if (res !== undefined) {
				cmd.eventHandlers.run(res);
			} else {
				cmd.eventHandlers.run(data);
			}
		}
	}
};

export default Command;