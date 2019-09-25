'use strict';

const path = require('path');
const fs = require('fs');

const nunjucks = require('nunjucks');
const nunjucksEnvironment = new nunjucks.Environment(
	new nunjucks.FileSystemLoader(path.join(__dirname, '../../view')),
	{ autoescape: false }
);

const consoleHelper = require('../../helpers/consoleHelper');

const ProcedureWriter = require('./ProcedureWriter');

module.exports = class HtmlProcedureWriter extends ProcedureWriter {

	constructor(program, procedure) {
		super(program, procedure);

		// Properties handled in CSS
		// initialIndent
		// indentStep
		// hanging
		// levelTypes <----------- maybe
		// levels <--------------- maybe

		this.getDocMeta();
		this.content = '';

		for (const task of this.procedure.tasks) {
			this.renderTask(task);
		}
	}

	// Handle with CSS
	// getIndents(levelIndex)

	wrapDocument() {
		return nunjucksEnvironment.render('document.html', {
			title: this.procedure.name,
			content: this.content,
			footer: this.genFooter()
		});
	}

	writeFile(filepath) {
		fs.writeFileSync(filepath, this.wrapDocument());
		consoleHelper.success(`${filepath} written!`);
	}

	genHeader(task) {
		return nunjucksEnvironment.render('task-header.html', {
			procedureName: this.procedure.name,
			taskTitle: task.title,
			duration: this.getTaskDurationDisplay(task)
		});
	}

	genFooter() {
		return nunjucksEnvironment.render('procedure-footer.html', {
			programName: this.program.fullName,
			programURL: this.program.repoURL,
			procedureName: this.procedure.name,
			gitDate: this.getGitDate(),
			gitHash: this.getGitHash()
		});
	}

};
