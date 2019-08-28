const yaml = require('js-yaml');
const fs = require('fs');
const _ = require('lodash');
const program = require('commander');
const exp = require('./exports');

// Run npm start to run this function
function startUp(fileLocation) {

	const doc = yaml.safeLoad(fs.readFileSync(fileLocation, 'utf8'));
	const actors = _.get(doc, 'actors');
	console.log('*actors from doc', actors);
	const files = _.get(doc, 'tasks');

	_.forEach(files, (file) => {
		if (_.get(file, 'file') && !_.get(file, 'repo')) {
			console.log('Internal file');
			if (_.get(file, 'actors')) {
				console.log(`File: ${file.file} actor: ${file.actors}`);
			} else {
				console.log(`File with no specified actors: ${file.file}`);
			}
		} else if (_.get(file, 'repo')) {
			console.log('External file');
			console.log(`Repo: ${file.repo} version: ${file.version} file: ${file.file} actors: ${file.actors} vars: ${JSON.stringify(file.vars)}`);
		}
	});
	return doc;
}

// To run this command, in the console run node main.js -e or --export. This
// will only work if it's ran soley by itself. We need to talk about how to
// refactor the code to make more sense.

// Options

// ex. node main.js -e docx f:\\code\\spacewalk_fork\\src\main.yml wordFile
// -e: option
// docx: file type
// f:\\code\\spacewalk_fork\\src\main.yml: path to file for parsing
// wordFile: file path/name for exported file
program.option('-e, --export [type]', 'Export yaml to specified file type', /^(html|doc|docx)$/i, 'html');
program.on('option:export', () => {
	const yamlFile = process.argv[process.argv.length - 2];
	const fileLocation = process.argv[process.argv.length - 1];
	switch (program.export) {
		case 'html':
			exp.html(startUp(yamlFile), fileLocation);
			break;
		case 'docx':
		case 'doc':
			exp.doc(startUp(yamlFile), fileLocation);
			break;
		default:
			break;
	}
});

program.parse(process.argv);

exports.startUp = startUp;
