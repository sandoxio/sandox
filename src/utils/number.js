import {stringRepeat} from "./string.js";

const sprintf = function (number, format) {
	number += '';
	format = format.replace(/%0*(.*)?d$/, '$1');
	number = stringRepeat('0', (format - number.length)) + number;
	return number;
};

Number.is = function (value) {
	return typeof value === 'number' && !isNaN(value);
};

export {sprintf};