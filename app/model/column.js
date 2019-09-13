'use strict';

const arrayHelper = require('../helpers/arrayHelper.js');

module.exports = class Column {

	constructor(columnYaml) {

		// Save the role (required)
		if (!columnYaml.key) {
			throw new Error(`Columns must have 'key' defined: ${JSON.stringify(columnYaml)}`);
		}
		this.key = columnYaml.key;

		this.actors = arrayHelper.parseArray(columnYaml.actors);

		if (columnYaml.display) {
			this.display = columnYaml.display;
		}

	}

};
