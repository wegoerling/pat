'use strict';

const fs = require('fs');
const path = require('path');
const YAML = require('yamljs');
const filenamify = require('filenamify');

const Actor = require('./actor.js');
const Task = require('./task.js');
const SpacewalkValidator = require('../schema/spacewalkValidator');

/**
 * This function returns a Promise that provides the contents of a fetched URL
 * as a UTF-8 string.
 *
 * @see: https://www.tomas-dvorak.cz/posts/nodejs-request-without-dependencies
 *
 * @param   {string} url The URL to read
 * @return  {Promise} A promise
 */
function readUrlPromise(url) {
	const lib = url.startsWith('https') ? require('https') : require('http');

	return new Promise((resolve, reject) => {
		const request = lib.get(url, (response) => {
			const body = [];
			response.setEncoding('utf8');

			response.on('data', (chunk) => {
				body.push(chunk);
			});

			response.on('end', () => {
				resolve(body.toString());
			});
		});

		request.on('error', (err) => {
			reject(err);
		});
	});
}

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

module.exports = class Procedure {

	constructor() {
		this.name = '';
		this.filename = '';
		this.actors = [];
		this.tasks = [];
		this.css = '';
	}

	/**
     * Populates data, reading in the specified file.
     *
     * @param {*} fileName The full path to the YAML file
     *
     * @throws {Error} if an error is encountered parsing the file.
     */
	async populateFromFile(fileName) {

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
			for (var actorYaml of procedureYaml.actors) {
				this.actors.push(new Actor(actorYaml));
			}
			// Save the tasks
			for (var taskYaml of procedureYaml.tasks) {

				// Check that the task is a file
				if (taskYaml.file) {

					// Since the task file is in relative path to the procedure
					// file, need to translate it!
					const taskFileName = translatePath(fileName, taskYaml.file);

					spacewalkValidator.validateTaskSchemaFile(taskFileName);
					const loadedTaskYaml = YAML.load(taskFileName, null, true);

					// Save the task!
					this.tasks.push(new Task(loadedTaskYaml));

				//  Is this a URL?
				} else if (taskYaml.url) {

					//  Wait for URL fetch to complete
					// console.log('Reading task URL: ' + t.url);
					const yamlString = await readUrlPromise(taskYaml.url);

					// Validate the data read from url
					spacewalkValidator.validateTaskSchemaString(yamlString);

					//  Parse the Task YAML
					const loadedTaskYaml = YAML.parse(yamlString);

					// Save the task!
					this.tasks.push(new Task(loadedTaskYaml));
				}

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
