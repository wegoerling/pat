'use strict';

module.exports = class Actor {

	constructor(actorYaml) {

		// Save the id (required)
		if (!actorYaml.id) {
			throw new Error(`Input YAML missing actor ID: ${JSON.stringify(actorYaml)}`);
		}
		this.id = actorYaml.id;

		// Save the name (if it exists)
		this.name = '';
		if (actorYaml.name) {
			this.name = actorYaml.name;
		}

	}

};
