import {stringRepeat} from "./string.js";
import {sprintf} from "./number.js";

/**
 * @description return date by mask
 * @param obj	{Date}
 * @param mask	{String}
 * @returns {String}
 */
const dateGet = (obj, mask) => {	// mask = 'dd m yyyy'
	if (!mask) {
		return obj.getFullYear() + '-' + sprintf((obj.getMonth() + 1), '%02d') + '-' + sprintf(obj.getDate(), '%02d');
	} else {
		return mask.replace(/(d+|M+|y+|h+|m+|s+)/g, function (reg, name) {
			let prop = {d: 'getDate', M: 'getMonth', y: 'getFullYear', h: 'getHours', m: 'getMinutes', s: 'getSeconds'}[name[0]];
			let value = obj[prop]();
			if (prop === 'getMonth') {
				value+=1;
			}
			return stringRepeat('0', name.length - (value + '').length) + value;
		});
	}
};

export {dateGet};