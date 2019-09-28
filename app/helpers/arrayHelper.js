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

/**
 * Determine if all array values (must be integer) are 1 or 0 difference from values before and
 * after.
 * @param  {Array} inputArr Array like [1, 2, 3] (returns true) or [1, 3, 5] (returns false) to
 *                          check for adjacency.
 * @return {boolean}        Whether or not all items are adjacent
 */
exports.allAdjacent = function(inputArr) {
	return inputArr.reduce((acc, cur, i, arr) => {
		if (!acc) {
			return false;
		}
		if (i === 0) {
			return true;
		}
		if (Math.abs(cur - arr[i - 1]) > 1) {
			return false;
		} else {
			return true;
		}
	}, true);
};
