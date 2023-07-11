/**
 * @singleton
 * @description bus
 * @example
 * 		busEvent.on(name, handler(data))
 * 		busEvent.fire(name, data)
 */

import Pool from "pool-handlers";


const busEvent = new (class {
	#handlers = {};

	on(name, handler) {
		if (!this.#handlers[name]) {
			this.#handlers[name] = new Pool();
		}
		this.#handlers[name].push(handler);
	}

	fire(name, data) {
		if (this.#handlers[name]) {
			this.#handlers[name].run(data);
		}
	}
})();

export default busEvent;