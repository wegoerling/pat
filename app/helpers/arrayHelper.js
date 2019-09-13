'use strict';

/**
 * Parse yaml as either string or array, and return an array. If the YAML
 * was a simple string, the array has a single element. If the YAML was
 * multiple elements, return an array with all strings.
 *
 * @param   {*} yaml yaml string or array
 * @return  {Array} array of substeps
 */
exports.parseArray = function(yaml) {

	const array = [];

	// Check for string
	if (typeof yaml === 'string') {
		array.push(yaml);

	// Check for array
	} else if (Array.isArray(yaml)) {
		for (var element of yaml) {
			array.push(element);
		}

	// Don't know how to process
	} else {
		throw new Error(`Expected string or array. Instead got: ${JSON.stringify(yaml)}`);
	}

	return array;
};
