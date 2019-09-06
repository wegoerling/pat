/**
 * High-level functions for eva-tasklist
 */

'use strict';

const program = require('commander');
const path = require('path');
const fs = require('fs');
const child = require('child_process');
const pjson = require('./package.json');

const ver = require('./app/helpers/versionHelper');
const Procedure = require('./app/model/procedure');
const html = require('./app/helpers/nunjucksHelper').generators;
const ThreeColDocx = require('./app/writer/ThreeColDocx');

/**
 * Surrogate program entry point
 *
 * @param   {*} args Command line arguments
 */
function run(args) {
	console.log(`xOPS procedure generator v${ver.currentVersion}\n`);

	// Use Commander to process command line arguments
	buildProgramArguments(program, args); // eslint-disable-line no-use-before-define

	validateProgramArguments(program); // eslint-disable-line no-use-before-define

	fs.readdir(program.procedurePath, function (err, files) {
		if (err) {
			console.log('Unable to scan procedures directory: ' + err);
			process.exit();
		}
		files.forEach(function (file) {
			console.log(`Generating procedure from ${file}`);

			let procedureFile = path.join(program.procedurePath, file);

			// Parse the input file
			const procedure = new Procedure();
			procedure.populateFromFile(procedureFile).then((err) => {
				// Check if an error occurred
				if (err) {
					console.error(`Error while deserializing YAML: ${err}`);
					if (err.validationErrors) {
						console.log('Validation Errors:');
						console.log(err.validationErrors);
					}
					return;
				}

				console.logIfVerbose(program, 2, 4);
				console.logIfVerbose(procedure, 1, 3);

				// genDocx...
				const threecoldocx = new ThreeColDocx(program, procedure);
				threecoldocx.writeFile(path.join(
					program.outputPath,
					`${procedure.filename}.docx`
				));

				if (program.html) {
					genHtml(program, procedure); // eslint-disable-line no-use-before-define
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
		if (!fs.existsSync(program.output)) {
			console.error('Failed to generate HTML output');
			return;
		}

		console.log(`HTML output written to: \t${program.output}`);
		console.log(`HTML url for browser: \t\tfile://${path.resolve(program.output)}`);

		if (program.pandoc) {
			genPandocDocx(program); // eslint-disable-line no-use-before-define
		}
	});
}

/**
 * High level function to generate DOCX output using Pandoc
 *
 * @param   {*} program       Program arguments and stuff
 */
function genPandocDocx(program) {

	//  Perform HTML -> DOCX conversion

	//  Figure out docx output filename
	const p = path.parse(program.output);
	const ext = p.ext;
	const docfile = program.output.replace(ext, '.pandoc.docx');

	//  Outsource the conversion to pandoc
	//  WARNING: NEVER USE THIS ON A WEB SERVER!
	const command = `pandoc -s -o ${docfile} -t html5 -t docx ${program.output}`;
	child.execSync(command);

	if (!fs.existsSync(docfile)) {
		console.error('Failed to generate DOCX output');
		return;
	}

	console.log(`DOCX output written to: \t${docfile}`);

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
	const DEFAULT_TEMPLATE = 'templates/spacewalk.njk';

	program
		.version(ver.currentVersion, '--version')
		.name('xops')
		.description(pjson.description)
		.option('-v, --verbose', 'Verbosity that can be increased from -v to -vvvv', increaseVerbosity, 0)
		.allowUnknownOption();

	program
		.command('build [projectPath]')
		.description('Build products for an xOPS project')
		// .option('-i, --input <input.yml>', 'name the YAML file for this EVA')
		// .option('-o, --output <.html>', 'name of output HTML file')
		.option('-t, --template <.html>', 'specify a template to use', DEFAULT_TEMPLATE)
		.option('--html', 'Generate HTML file', null)
		.option('-p, --pandoc', 'Generate Word doc from HTML using Pandoc (requires --html option)', null)
		.option('-c, --css <.css>', 'CSS to append to generated HTML', null)
		.action(function (projectPath, options) {
			if (projectPath) {
				program.projectPath = path.resolve(projectPath)
			}
			else {
				program.projectPath = process.cwd();
			}
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
		}
		else {
			throw e;
		}
	}

	console.logIfVerbose = function (msg, verbosityThreshold = 0, fullObjVerbosityThreshold = 4) {
		if (program.verbose >= verbosityThreshold) {
			if (program.verbose >= fullObjVerbosityThreshold) {
				msg = JSON.stringify(msg, null, 4);
			}
			console.log('');
			console.log(msg);
		}
	};

	return program;
}

function pathMustExist (path, createIfMissing = false) {
	try {
		fs.statSync(path);
	} catch(e) {
		if (createIfMissing) {
			fs.mkdirSync(path); // catch here, too?
		}
		else {
			console.error(`Path ${path} does not exist`);
			process.exit();
		}
	}
	return true;
}

/**
 * Validates the arguments...
 *
 * @param   {*} program   TBD
 */
function validateProgramArguments(program) {

	program.procedurePath = path.join(program.projectPath, 'procedures');
	program.tasksPath = path.join(program.projectPath, 'tasks');
	program.outputPath = path.join(program.projectPath, 'build');

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
 * @param   {*} evaTaskList  TBD
 * @param   {*} program      TBD
 * @param   {*} callback     TBD
 * @return  {*} TBD FIXME
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

module.exports = {
	run: run,
	buildProgramArguments: buildProgramArguments,
	validateProgramArguments: validateProgramArguments
};
