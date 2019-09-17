'use strict';

const docx = require('docx');
const Writer = require('./Writer');
const DocxSodfHandler = require('./DocxSodfHandler');

module.exports = class SodfDocxWriter extends Writer {

	constructor(program, procedure) {
		super(program, procedure);
	}

	getRightTabPosition() {
		return 10800;
	}

	getPageSize() {
		return {
			width: 12240,
			height: 15840,
			orientation: docx.PageOrientation.PORTRAIT
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

		let handler = new DocxSodfHandler(
			task,
			this
		);

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
