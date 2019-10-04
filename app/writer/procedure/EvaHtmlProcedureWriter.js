'use strict';

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

		this.content += this.genHeader(task);
		this.content += '<table class="gridtable">';
		this.content += taskWriter.setTaskTableHeader();
		this.content += taskWriter.writeDivisions().join('');
		this.content += '</table>';

		// this.genFooter() <-- not done in HTML like DOCX
	}

};
