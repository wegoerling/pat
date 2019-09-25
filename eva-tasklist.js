/**
 * High-level functions for eva-tasklist
 */

'use strict';

const program = require('commander');
const path = require('path');
const fs = require('fs');
const pjson = require('./package.json');

const ver = require('./app/helpers/versionHelper');
const html = require('./app/helpers/nunjucksHelper').generators;
const consoleHelper = require('./app/helpers/consoleHelper');

const Procedure = require('./app/model/procedure');
const EvaDocxProcedureWriter = require('./app/writer/procedure/EvaDocxProcedureWriter');
const SodfDocxProcedureWriter = require('./app/writer/procedure/SodfDocxProcedureWriter');
const EvaHtmlProcedureWriter = require('./app/writer/procedure/EvaHtmlProcedureWriter');
/**
 * Surrogate program entry point
 *
 * @param   {*} args Command line arguments
 */
function run(args) {
	program.fullName = `Procedure Author Thing v${pjson.version}`;
	program.repoURL = pjson.repository.url;

	console.log(`${program.fullName}\n`);

	// Use Commander to process command line arguments
	buildProgramArguments(program, args); // eslint-disable-line no-use-before-define

	validateProgramArguments(program); // eslint-disable-line no-use-before-define

	fs.readdir(program.procedurePath, function(err, files) {
		if (err) {
			console.log(`Unable to scan procedures directory: ${err}`);
			process.exit();
		}
		files.forEach(function(file) {
			console.log(`Generating procedure from ${file}`);

			const procedureFile = path.join(program.procedurePath, file);

			// Parse the input file
			const procedure = new Procedure();
			procedure.populateFromFile(procedureFile).then((err) => {
				// Check if an error occurred
				if (err) {
					consoleHelper.noExitError(`Error while processing procedure ${file}: ${err}`);
					if (err.validationErrors) {
						consoleHelper.noExitError('Validation Errors:');
						consoleHelper.noExitError(err.validationErrors);
					}
					return;
				}

				console.logIfVerbose(program, 2, 4);
				console.logIfVerbose(procedure, 1, 3);

				// genDocx...
				console.log('Creating EVA format');
				const eva = new EvaDocxProcedureWriter(program, procedure);
				eva.writeFile(path.join(
					program.outputPath,
					`${procedure.filename}.docx`
				));

				if (program.sodf) {
					console.log('Creating SODF format');
					const sodf = new SodfDocxProcedureWriter(program, procedure);
					sodf.writeFile(path.join(
						program.outputPath,
						`${procedure.filename}.sodf.docx`
					));
				}

				if (program.html) {
					// genHtml(program, procedure); // eslint-disable-line no-use-before-define

					console.log('Creating EVA HTML format');
					const evaHtml = new EvaHtmlProcedureWriter(program, procedure);
					evaHtml.writeFile(path.join(
						program.outputPath,
						`${procedure.filename}.eva.html`
					));

				}
			});

		});
	});

}

/**
 * High level function to generate HTML output
 *
 * @param   {*} program       Program arguments and stuff
 * @param   {*} procedure     The procedure to generate HTML for
 */
function genHtml(program, procedure) {

	// Generate the HTML output file
	// eslint-disable-next-line no-use-before-define
	generateHtmlChecklist(procedure, program, function() {
		if (!fs.existsSync(program.outputPath)) {
			console.error('Failed to generate HTML output');
			return;
		}

		console.log(`HTML output written to: \t${program.outputPath}`);
		console.log(`HTML url for browser: \t\tfile://${path.resolve(program.outputPath)}`);
	});
}

function increaseVerbosity(dummyValue, previous) {
	return previous + 1;
}

/**
 * This function configures commander.js for this application's command line
 * arguments, and attemps to parse the arguments passed to this process.
 *
 * @param   {*} program     A commander.js object for this function to use
 * @param   {*} args        Command line argument array (e.g. process.argv)
 * @return  {*} TBD FIXME
 */
function buildProgramArguments(program, args) {

	program
		.version(ver.currentVersion, '--version')
		.name('xops')
		.description(pjson.description)
		.option('-v, --verbose', 'Verbosity that can be increased from -v to -vvvv', increaseVerbosity, 0)
		.allowUnknownOption();

	console.logIfVerbose = function(msg, verbosityThreshold = 0, fullObjVerbosityThreshold = 4) {
		if (program.verbose >= verbosityThreshold) {
			if (program.verbose >= fullObjVerbosityThreshold) {
				msg = JSON.stringify(msg, null, 4);
			}
			console.log('');
			console.log(msg);
		}
	};

	program
		.command('build [projectPath]')
		.description('Build products for PAT project')
		.option('-t, --template <.html>', 'specify a template to use')
		.option('--html', 'Generate HTML file', null)
		.option('--sodf', 'Generate SODF style procedure', null)
		.option('-c, --css <.css>', 'CSS to append to generated HTML', null)
		.action(function(projectPath, options) {
			console.logIfVerbose(options, 3);
			if (projectPath) {
				program.projectPath = path.resolve(projectPath);
			} else {
				program.projectPath = process.cwd();
			}
			program.sodf = options.sodf;
			program.html = options.html;
			program.template = options.template || path.join(
				__dirname, 'templates', 'spacewalk.njk'
			);
		});

	//  Commander.js does an unhelpful thing if there are invalid options;
	//  Override the default behavior to do a more helpful thing.
	program.unknownOption = function() {
		//  An invalid option has been received. Print usage and exit.
		program.help();
	};

	try {
		program.parse(args);
	} catch (e) {
		if (e instanceof TypeError) {
			//  Commander.js will annoyingly throw a TypeError if an argument
			//  that requires a parameter is missing its parameter.
			program.help();
			console.log('\n');
			console.error(e);
		} else {
			throw e;
		}
	}

	return program;
}

function pathMustExist(path, createIfMissing = false) {
	try {
		fs.statSync(path);
	} catch (e) {
		if (createIfMissing) {
			fs.mkdirSync(path); // catch here, too?
		} else {
			console.error(`Path ${path} does not exist`);
			process.exit();
		}
	}
	return true;
}

/**
 * Tests whether the specified path can be written to by this process
 *
 * @param   {string} pathToTest The path to test
 * @return  {boolean} True if path can be written to, false otherwise
 */
function canWrite(pathToTest) {

	//  Check whether the path exists
	if (!fs.existsSync(pathToTest)) {
		//  File doesn't exist - check permissions for the parent dir
		const p = path.parse(pathToTest);
		let dir = p.dir;

		if (dir === '') {
			dir = '.';
		}

		pathToTest = dir;
	}

	//  Test permissions
	try {
		fs.accessSync(pathToTest, fs.constants.W_OK);
		//  Yes
		return true;
	} catch (err) {
		//  No
		return false;
	}
}

/**
 * Validates the arguments...
 *
 * @param   {*} program   TBD
 */
function validateProgramArguments(program) {

	program.procedurePath = path.join(program.projectPath, 'procedures');
	program.tasksPath = path.join(program.projectPath, 'tasks');
	program.imagesPath = path.join(program.projectPath, 'images');
	program.outputPath = path.join(program.projectPath, 'build');
	program.gitPath = path.join(program.projectPath, '.git');

	pathMustExist(program.procedurePath);
	pathMustExist(program.tasksPath);

	// at this point tasks and procedures paths exist. Reasonably certain this
	// is an xOPS project. Allow forcing creation of outputPath with `true`.
	pathMustExist(program.outputPath, true);

	//  If this process can't write to the output location, emit an error and quit
	if (!canWrite(program.outputPath)) {
		console.error(`Can't write to output location: ${program.outputPath}`);
		process.exit();
	}

}

/**
 * This function generates a checklist in HTML format and calls the callback
 * when complete.
 *
 * @param   {*} procedure  TBD
 * @param   {*} program    TBD
 * @param   {*} callback   TBD
 * @return  {*} TBD FIXME
 */
async function generateHtmlChecklist(procedure, program, callback) {

	html.params.inputDir(program.imagesPath);
	html.params.outputDir(program.outputPath);
	html.params.htmlFile(path.join(
		program.outputPath,
		`${procedure.filename}.html`
	));
	if (program.css) {
		html.params.cssFile(path.resolve(program.css));
	}

	html.create(procedure, program.template, callback);
}

module.exports = {
	run: run,
	buildProgramArguments: buildProgramArguments,
	validateProgramArguments: validateProgramArguments
};
