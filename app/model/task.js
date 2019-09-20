'use strict';

const ConcurrentStep = require('./concurrentStep.js');
const TaskRole = require('./TaskRole.js');
const consoleHelper = require('../helpers/consoleHelper');

module.exports = class Task {

	/**
	 * Constructor for Task object
	 * @param  {Object} taskDefinition          All the task info from the task file (steps, etc)
	 * @param  {Object} proceduresTaskInstance  Info about this usage of task from procedure file
	 * @param  {Array}  procedureColumnKeys     Array of column keys
	 * @return {Object}                         Task instance
	 */
	constructor(taskDefinition, proceduresTaskInstance, procedureColumnKeys = null) {

		// Get the title
		if (!taskDefinition.title) {
			throw new Error(`Input YAML task missing title: ${JSON.stringify(taskDefinition)}`);
		}
		this.title = taskDefinition.title;

		// Get the duration
		if (!taskDefinition.duration) {
			throw new Error(`Input YAML task missing duration: ${JSON.stringify(taskDefinition)}`);
		}
		this.duration = taskDefinition.duration;

		if (taskDefinition.roles) {
			this.roles = {};
			for (const role of taskDefinition.roles) {
				if (!role.name) {
					consoleHelper.error([
						'Roles require a name, none found in role definition',
						roleDef
					], 'Task role definition error');
				}
				this.roles[role.name] = new TaskRole(role, proceduresTaskInstance);
			}
		}

		// Get the steps.  ConcurrentSteps class will handle the simo vs actor stuff in the yaml.
		if (!taskDefinition.steps) {
			throw new Error(`Input YAML task missing steps: ${JSON.stringify(taskDefinition)}`);
		}
		this.concurrentSteps = [];
		for (var concurrentStepYaml of taskDefinition.steps) {
			this.concurrentSteps.push(new ConcurrentStep(concurrentStepYaml, this.roles));
		}

		if (procedureColumnKeys) {
			if (!Array.isArray(procedureColumnKeys) || procedureColumnKeys.length === 0) {
				throw new Error('Procedure column keys must be an array with length > 0\n');
			} else {
				for (const key of procedureColumnKeys) {
					if (typeof key !== 'string') {
						throw new Error('Procedure column keys must be type string');
					}
				}
			}
			this.procedureColumnKeys = procedureColumnKeys;
		}
	}

	/**
	 * Detect and return what columns are present on a task. A given task may
	 * have 1 or more columns. Only return those present in a task.
	 *
	 * @return {Array}             Array of column names in this task
	 */
	getColumns() {

		if (this.columnsArray) {
			return this.columnsArray;
		}

		const stepRows = this.concurrentSteps;
		const taskColumns = [];
		const taskColumnsHash = {};
		let stepRow,
			colName;

		// Loop over the array of stepRows, and within that loop over each object of
		// colName:[array,of,steps].
		//
		// stepRows = [
		//   { IV: [Step, Step, Step] },              // stepRow 0
		//   { IV: [Step], EV1: [Step, Step] },       // stepRow 1
		//   { EV1: [Step, Step], EV2: [Step] }       // stepRow 2
		// ]
		//
		for (stepRow of stepRows) {
			for (colName in stepRow) {
				if (!taskColumnsHash[colName]) {
					// insert into a hash table because lookup is faster than array
					taskColumnsHash[colName] = true;
				}
			}
		}

		if (this.docColumns) {

			// create taskColumns in order specified by procedure
			for (colName of this.docColumns) {
				if (taskColumnsHash[colName]) {
					taskColumns.push(colName);
				}
			}
		} else {

			for (colName in taskColumnsHash) {
				taskColumns.push(colName);
			}
		}

		this.columnsArray = taskColumns;
		return taskColumns;
	}

	getColumnIndex(actorKey) {
		return this.getColumnIndexes()[actorKey];
	}

	getColumnIndexes() {

		if (this.columnIndexes) {
			return this.columnIndexes;
		}

		this.columnIndexes = {};
		const taskColumns = this.getColumns();

		for (let i = 0; i < taskColumns.length; i++) {
			this.columnIndexes[taskColumns[i]] = i;
		}

		return this.columnIndexes;
	}

};
