'use strict';

const consoleHelper = require('../helpers/consoleHelper');

module.exports = class TaskRole {

	/**
	 * Constructor for TaskRole
	 * @param  {Object} roleDef           Ex: { name: crewA, description: 'Person who does XYZ' }
	 * @param  {Object} procTaskInstance  Info about this usage of task from procedure file
	 */
	constructor(roleDef, procTaskInstance) {
		this.name = roleDef.name;
		this.description = roleDef.description;
		if (!procTaskInstance || !procTaskInstance.roles || !procTaskInstance.roles[this.name]) {
			consoleHelper.error([
				'Roles defined within tasks must be filled by procedure actors',
				`Within task "${procTaskInstance.file}", role "${this.name}" is defined`,
				`Within the procedure, role "${this.name}" is not filled by an actor`
			], 'TaskRole error');
		} else {
			this.actor = procTaskInstance.roles[this.name];
		}
	}
};
