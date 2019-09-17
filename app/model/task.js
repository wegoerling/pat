'use strict';

const ConcurrentStep = require('./concurrentStep.js');

module.exports = class Task {

	constructor(taskYaml, procedureColumnKeys=null) {

		// Get the title
		if (!taskYaml.title) {
			throw new Error(`Input YAML task missing title: ${JSON.stringify(taskYaml)}`);
		}
		this.title = taskYaml.title;

		// Get the duration
		if (!taskYaml.duration) {
			throw new Error(`Input YAML task missing duration: ${JSON.stringify(taskYaml)}`);
		}
		this.duration = taskYaml.duration;

		// Get the steps.  ConcurrentSteps class will handle the simo vs actor stuff in the yaml.
		if (!taskYaml.steps) {
			throw new Error(`Input YAML task missing steps: ${JSON.stringify(taskYaml)}`);
		}
		this.concurrentSteps = [];
		for (var concurrentStepYaml of taskYaml.steps) {
			this.concurrentSteps.push(new ConcurrentStep(concurrentStepYaml));
		}

		if (procedureColumnKeys) {
			if (!Array.isArray(procedureColumnKeys) || procedureColumnKeys.length === 0) {
				throw new Error('Procedure column keys must be an array with length > 0\n');
			} else {
				for (let key of procedureColumnKeys) {
					if (typeof key !== 'string') {
						throw new Error('Procedure column keys must be type string');
					}
				}
			}
			this.procedureColumnKeys = procedureColumnKeys
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
