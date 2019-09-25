'use strict';

const docx = require('docx');

const HtmlProcedureWriter = require('./HtmlProcedureWriter');
const EvaHtmlTaskWriter = require('../task/EvaHtmlTaskWriter');

module.exports = class EvaHtmlProcedureWriter extends HtmlProcedureWriter {

	constructor(program, procedure) {
		super(program, procedure);
	}

	// implement with CSS
	// getRightTabPosition() {}
	// getPageSize() {}
	// getPageMargins() {}

	renderTask(task) {

		const taskWriter = new EvaHtmlTaskWriter(
			task,
			this
		);

		taskWriter.setTaskTableHeader();

		taskWriter.writeDivisions();

		this.content += this.genHeader(task);
		this.content += taskWriter.getContent();

		// this.genFooter() <-- not done in HTML like DOCX
	}

};
