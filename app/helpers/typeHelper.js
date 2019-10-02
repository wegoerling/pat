'use strict';

const validTypes = {
	scalar: (v) => {
		return ['boolean', 'string', 'number', 'bigint', 'symbol'].indexOf(typeof v) !== -1;
	},
	boolean: (v) => { return typeof v === 'boolean'; },
	integer: (v) => { return Number.isInteger(v); },
	number: (v) => { return typeof v === 'number'; },
	string: (v) => { return typeof v === 'string'; },
	array: (v) => { return Array.isArray(v); },
	function: (v) => { return typeof v === 'function'; },
	object: (v) => { return typeof v === 'object'; }
};

function is(value, ...types) {
	// types will be an array by definition because of the ...types. If it has just one element, and
	// that element is itself an array, set types to that element (flatten the 2D array into 1D).
	if (types.length === 1 && is(types[0], 'array')) {
		types = types[0];
	}

	for (const type of types) {
		const maybeIsClass = typeof type === 'function';
		const isValidType = typeof type === 'string' && validTypes[type];

		if (!maybeIsClass && !isValidType) {
			throw new Error(`typeHelper.is() does not support type ${type}`);
		}

		if (maybeIsClass && value instanceof type) {
			return type;
		} else if (isValidType && validTypes[type](value)) {
			return type;
		}
	}
}

function errorIfIsnt(value, ...types) {
	if (!is(value, types)) {
		throw new Error(`Value ${value} must be one of these types:\n  - ${types.join('\n  - ')}`);
	}
}

module.exports = {
	is: is,
	errorIfIsnt: errorIfIsnt
};
