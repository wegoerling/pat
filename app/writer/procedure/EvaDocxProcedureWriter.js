'use strict';

const docx = require('docx');

const DocxProcedureWriter = require('./DocxProcedureWriter');
const EvaDocxTaskWriter = require('../task/EvaDocxTaskWriter');

module.exports = class EvaDocxProcedureWriter extends DocxProcedureWriter {

	constructor(program, procedure) {
		super(program, procedure);
	}

	getRightTabPosition() {
		return 14400;
	}

	getPageSize() {
		return {
			width: 12240, // width and height transposed in LANDSCAPE
			height: 15840,
			orientation: docx.PageOrientation.LANDSCAPE
		};
	}

	getPageMargins() {
		return {
			top: 720,
			right: 720,
			bottom: 720,
			left: 720
		};
	}

	renderTask(task) {

		const handler = new EvaDocxTaskWriter(
			task,
			this
		);

		handler.setTaskTableHeader();

		handler.writeDivisions();

		this.doc.addSection({
			headers: { default: this.genHeader(task) },
			footers: { default: this.genFooter() },
			size: this.getPageSize(),
			margins: this.getPageMargins(),
			children: handler.getSectionChildren()
		});
	}

};
