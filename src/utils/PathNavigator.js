const PathNavigator = class {
	#rootPath;
	constructor(rootPath) {
		this.#rootPath = rootPath;
	}

	navigate(relativePath) {
		return (new URL(relativePath, "http://x/" + this.#rootPath).href).replace(/^http:\/\/x\//, '');
	}
}

export default PathNavigator;