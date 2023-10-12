const isObject = function (value) {
	return value instanceof Object;
};

const isHash = function (value) {
	return value instanceof Object && value.constructor === Object && '' + value !== '[object Arguments]';
};


/** @method forEachRecursive
 *	@description	Recursively iterates through all the keys of an object, calling a function with parameters (value, key, num). Can traverse hash keys, Node.childNodes, Node.attributes, DocumentFragment
 *	@param iterator				{Function}	Iterator function(value, path, {object, propertyPath})
 *	@param cfg					{Object}
 *	@param cfg.objectCallback	{Object=}	[:true] If set, call a callback for all nodes (if false, then only for leaves)
 *	@param cfg.ignoreNonHash	{boolean=}	[:true] If set to false, then it will recursively access all object attributes (Date, String, Node, etc.)
 *	@param cfg.pathPrefix		{String=}	A prefix that will be assigned to all paths when calling the callback
 *	@param cfg.property			{String=}	Will only go into the specified property (for example childNodes to recursively iterate through all children)
 *	@return						{Array}		The paths along which we ran
 */
const forEachRecursive = (function () {
	let paths;
	let recursive = function (obj, path, iterator, cfg) {
		let pathPrefix, curPath, i, keys, l, key, value;
		path += path && '.';
		pathPrefix = (cfg.pathPrefix ? cfg.pathPrefix : '');
		cfg.pathPrefix = '';

		if (cfg.property) {
			obj = obj[cfg.property];
			if (!obj) {
				return;
			} else {
				path += cfg.property + '.';
			}
		}

		for (i = 0, keys = Object.keys(obj), l = keys.length; i < l; i++) {
			key = keys[i];
			value = obj[key];

			curPath = pathPrefix + path + key;

			if (isHash(value) || Array.isArray(value) || (!cfg.ignoreNonHash && Object.keys(value) > 0)) {
				if (cfg.objectCallback) {		// Вызываем итератор если нужно для ноды
					iterator(value, curPath, {object: obj, propertyName: key});
					paths.push(curPath);
				}
				recursive(value, curPath, iterator, cfg);
			} else {							// Вызываем итератор если это лист
				iterator(value, curPath, {object: obj, propertyName: key});
				paths.push(curPath);
			}
		}
	};

	return function (obj, iterator, cfg) {
		paths = [];
		if (!cfg) {
			cfg = {};
		}
		if (cfg.objectCallback === undefined) {
			cfg.objectCallback = true;
		}
		if (cfg.ignoreNonHash === undefined) {
			cfg.ignoreNonHash = true;
		}

		if (isObject(obj) || Array.isArray(obj) || cfg.ignoreNonHash === false) {
			recursive(obj, '', iterator, cfg);
		} else {
			console.warn('invalid type', obj, cfg);
		}
		return paths;
	};
})();

export {isObject, isHash, forEachRecursive};