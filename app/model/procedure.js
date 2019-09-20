'use strict';

const fs = require('fs');
const path = require('path');
const YAML = require('yamljs');
const filenamify = require('filenamify');

const Actor = require('./actor.js');
const Column = require('./column.js');
const Task = require('./task.js');
const SpacewalkValidator = require('../schema/spacewalkValidator');

function translatePath(procedureFilePath, taskFileName) {
	// Look in tasks directory, sister to procedures directory
	// Someday look in a directory provided by dependency manager, issue #21
	const taskFilePath = path.join(
		path.dirname(procedureFilePath),
		'..',
		'tasks',
		taskFileName
	);

	// Validate & Load the yaml file!
	if (!fs.existsSync(taskFilePath)) {
		throw new Error(`Could not find task file ${taskFilePath}`);
	}

	return taskFilePath;
}

function mapActorToColumn(columnDefinition) {

	// Create a mapping of actor --> column
	const actorToColumn = {};

	for (const col of columnDefinition) {
		if (typeof col.actors === 'string') {
			col.actors = [col.actors]; // array-ify
		} else if (!Array.isArray(col.actors)) {
			throw new Error('Procedure columns.actors must be array or string');
		}

		for (const actor of col.actors) {
			actorToColumn[actor] = col.key;
		}
	}

	return actorToColumn;
}

function mapColumnKeyToDisplay(columnDefinition) {

	// Create a mapping of actor --> column
	const columnToDisplay = {};

	for (const col of columnDefinition) {
		if (col.display) {
			columnToDisplay[col.key] = col.display;
		} else {
			columnToDisplay[col.key] = col.key;
		}
	}

	return columnToDisplay;
}

module.exports = class Procedure {

	constructor() {
		this.name = '';
		this.filename = '';
		this.actors = [];
		this.columns = [];
		this.tasks = [];
		this.css = '';
		this.actorToColumn = {};

		// FIXME: this shouldn't be hard-code, but should come from procedure
		this.docColumns = ['IV', 'EV1', 'EV2'];
	}

	/**
	 * May actor key to column key. Both strings. this.actorToColumn in form:
	 *   {
	 *     "*": "IV",
	 *     "EV1": "EV1",
	 *     "EV2": "EV2"
	 *   }
	 * A more complicated form may be:
	 *   {
	 *     "*": "IV",
	 *     "EV1": "EV1",
	 *     "ROBO": "EV1"
	 *   }
	 * In this second example the "ROBO" actor gets mapped to the EV1 column.
	 *
	 * @param  {string} actor   key for actor
	 * @return {string}         key of column (key of primary actor of column)
	 */
	getActorColumnKey(actor) {
		if (this.actorToColumn[actor]) {
			return this.actorToColumn[actor];
		} else if (this.actorToColumn['*']) {
			return this.actorToColumn['*']; // wildcard for all others
		} else {
			throw new Error(`Unknown column for actor ${actor}. Consider adding wildcard * actor to a column`);
		}
	}

	getColumnKeys() {
		const keys = [];
		for (const column of this.columns) {
			keys.push(column.key);
		}
		return keys;
	}

	getColumnHeaderText() {
		const headerTexts = [];
		for (const column of this.columns) {
			headerTexts.push(column.display);
		}
		return headerTexts;
	}

	/**
     * Populates data, reading in the specified file.
     *
     * @param {*} fileName The full path to the YAML file
     *
     * @throws {Error} if an error is encountered parsing the file.
     */
	async populateFromFile(fileName) {

		this.procedureFile = fileName;

		try {

			// Check if the file exists
			if (!fs.existsSync(fileName)) {
				throw new Error(`Could not find file ${fileName}`);
			}

			// Validate the input file
			const spacewalkValidator = new SpacewalkValidator();
			spacewalkValidator.validateProcedureSchemaFile(fileName);

			// Load the YAML File
			const procedureYaml = YAML.load(fileName, null, true);

			// Save the procedure Name
			this.name = procedureYaml.procedure_name;
			this.filename = filenamify(this.name.replace(/\s+/g, '_'));

			// Save the actors
			if (procedureYaml.actors) {
				for (var actorYaml of procedureYaml.actors) {
					this.actors.push(new Actor(actorYaml));
				}
			}

			for (var columnYaml of procedureYaml.columns) {
				this.columns.push(new Column(columnYaml));
			}

			this.actorToColumn = mapActorToColumn(this.columns);
			this.columnToDisplay = mapColumnKeyToDisplay(this.columns);

			// Save the tasks
			for (const proceduresTaskInstance of procedureYaml.tasks) {

				// Since the task file is in relative path to the procedure
				// file, need to translate it!
				const taskFileName = translatePath(fileName, proceduresTaskInstance.file);

				spacewalkValidator.validateTaskSchemaFile(taskFileName);
				const taskDefinition = YAML.load(taskFileName, null, true);

				// Save the task!
				this.tasks.push(new Task(
					taskDefinition, // all the task info from the task file (steps, etc)
					proceduresTaskInstance, // info about task from procedure file
					this.getColumnKeys()
				));

			}

			// Pull in css file if it is defined
			if (procedureYaml.css) {
				const cssFileName = translatePath(fileName, procedureYaml.css);
				if (!fs.existsSync(cssFileName)) {
					throw new Error(`Could not find css file ${cssFileName}`);
				}
				this.css = fs.readFileSync(cssFileName);
			}

		} catch (err) {
			return err;
		}

	}

};
