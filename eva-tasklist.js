/**
 * High-level functions for eva-tasklist
 */

'use strict';

const program = require('commander');
const path = require('path');
const fs = require('fs');
const child = require('child_process');

const ver = require('./app/helpers/versionHelper');
const Procedure = require("./app/model/procedure");
const html = require('./app/helpers/nunjucksHelper').generators;

module.exports = {
	run: run,
	buildProgramArguments: buildProgramArguments,
	validateProgramArguments: validateProgramArguments
}

/**
 * Surrogate program entry point
 *
 * @param args      Command line arguments
 */
function run(args) {
	console.log('\nNASA EVA Tasklist Generator version ' + ver.currentVersion + '\n');

	//  Use Commander to process command line arguments
	buildProgramArguments(program, args);

	validateProgramArguments(program);

	console.log('Input YAML file: \t\t' + program.input);

	// Parse the input file
	const procedure = new Procedure();
	procedure.populateFromFile(program.input).then( (err) => {
		// Check if an error occurred
		if(err) {
			console.error('Error while deserializing YAML: ' + err);
			if (err.validationErrors) {
				console.log("Validation Errors:");
				console.log(err.validationErrors);
			}
			return;
		}

		genHtml(program, procedure);
	});
}

/**
 * High level function to generate HTML output
 *
 * @param program       Program arguments and stuff
 * @param procedure     The procedure to generate HTML for
 */
function genHtml(program, procedure) {

	// Generate the HTML output file
	generateHtmlChecklist(procedure, program, function () {
		if(!fs.existsSync(program.output)) {
			console.error('Failed to generate HTML output');
			return;
		}

		console.log('HTML output written to: \t' + program.output);
		console.log('HTML url for browser: \t\tfile://' + path.resolve(program.output));

		genDoc(program);
	});
}

/**
 * High level function to generate DOCX output
 *
 * @param program       Program arguments and stuff
 */
function genDoc(program) {

	//  Perform HTML -> DOCX conversion, if requested
	if(program.doc) {

		//  Figure out docx output filename
		const p = path.parse(program.output);
		const ext = p.ext;
		const docfile = program.output.replace(ext, '.docx');

		//  Outsource the conversion to pandoc
		//  WARNING: NEVER USE THIS ON A WEB SERVER!
		const command = `pandoc -s -o ${docfile} -t html5 -t docx ${program.output}`;
		child.execSync(command);

		if(!fs.existsSync(docfile)) {
			console.error('Failed to generate DOCX output');
			return;
		}

		console.log('DOCX output written to: \t' + docfile);
	}

	console.log('\nDone!');
}

/**
 * This function configures commander.js for this application's command line
 * arguments, and attemps to parse the arguments passed to this process.
 *
 * @param program   A commander.js object for this function to use
 * @param args      Command line argument array (e.g. process.argv)
 */
function buildProgramArguments(program, args) {
	const DEFAULT_TEMPLATE = 'templates/spacewalk.njk';

	program
		.version(ver.currentVersion, '-v, --version')
		.name('eva-checklist')
		.description('Generate the spacewalk EVA checklist from YAML files')
		.option('-i, --input <input.yml>', 'name the YAML file for this EVA')
		.option('-o, --output <.html>', 'name of output HTML file')
		.option('-t, --template <.html>', 'specify a template to use', DEFAULT_TEMPLATE)
		.option('-d, --doc', 'Also generate Word doc output', null)
		.option('-c, --css <.css>', 'CSS to append to generated HTML', null)
		.allowUnknownOption();

	//  Commander.js does an unhelpful thing if there are invalid options;
	//  Override the default behavior to do a more helpful thing.
	program.unknownOption = function() {
		//  An invalid option has been received. Print usage and exit.
		program.help();
	}

	try {
		program.parse(args);
	} catch(e) {
		if(e instanceof TypeError) {
			//  Commander.js will annoyingly throw a TypeError if an argument
			//  that requires a parameter is missing its parameter.
			program.help();
		}
	}

	return program;
}

/**
 * Validates the arguments...
 */
function validateProgramArguments(program) {

	//  Minimum number of arguments is 4:
	//  e.g. node index.js -i something
	if(process.argv.length < 4) {
		program.help();
	}

	//  If no output file was specified, use a default
	if(!program.output) {
		const p = path.parse(program.input);
		const file_without_path = p.base;
		const ext = p.ext;

		//  Use input file name with .html extension
		//  e.g. test.yml becomes test.html
		const name = file_without_path.replace(ext, '.html');

		program.output = name;
	}

	//  If the input file doesn't exist, emit an error and quit
	if(!fs.existsSync(program.input)) {
		console.error('Input YAML doesn\'t exist: ' + program.input);
		process.exit();
	}

	//  If this process can't write to the output location, emit an error and quit
	if(!canWrite(program.output)) {
		console.error('Can\'t write to output location: ' + program.output);
		process.exit();
	}
}

/**
 * This function generates a checklist in HTML format and calls the callback
 * when complete.
 */
async function generateHtmlChecklist(evaTaskList, program, callback) {
	const outputFile = path.resolve(program.output);

	html.params.inputDir(path.resolve(path.dirname(program.input)));
	html.params.outputDir(path.resolve(path.dirname(program.output)));
	html.params.htmlFile(outputFile);
	if (program.css) {
		html.params.cssFile(path.resolve(program.css));
	}
    
	html.create(evaTaskList, program.template, callback);
}

/**
 * Tests whether the specified path can be written to by this process
 *
 * @param pathToTest    The path to test
 * @returns             True if path can be written to, false otherwise
 */
function canWrite(pathToTest) {

	//  Check whether the path exists
	if(!fs.existsSync(pathToTest)) {
		//  File doesn't exist - check permissions for the parent dir
		const p = path.parse(pathToTest);
		let dir = p.dir;

		if(dir === '') {
			dir = '.';
		}

		pathToTest = dir;
	}

	//  Test permissions
	try {
		fs.accessSync(pathToTest, fs.constants.W_OK);
		//  Yes
		return true;
	} catch(err) {
		//  No
		return false;
	}
}
