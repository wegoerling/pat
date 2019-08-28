'use strict';

module.exports = class Actor {

	constructor(actorYaml) {

		// Save the role (required)
		if (!actorYaml.role) {
			throw new Error(`Input YAML missing actor Role: ${JSON.stringify(actorYaml)}`);
		}
		this.role = actorYaml.role;

		// Save the name (if it exists)
		this.name = '';
		if (actorYaml.name) {
			this.name = actorYaml.name;
		}

	}

};