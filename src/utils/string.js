const stringRepeat = function (obj, n) {
	let i;
	let str = '';
	if (!Number.is(n)) {
		throw new Error('x: must be a number');
	}
	for (i = 0; i < n; i++) {
		str += obj;
	}
	return str;
};

export {stringRepeat};