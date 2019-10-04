'use strict';

const docx = require('docx');
const DocxProcedureWriter = require('./DocxProcedureWriter');
const SodfDocxTaskWriter = require('../task/SodfDocxTaskWriter');
const consoleHelper = require('../../helpers/consoleHelper');

module.exports = class SodfDocxProcedureWriter extends DocxProcedureWriter {

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

		const handler = new SodfDocxTaskWriter(
			task,
			this
		);

		const sectionChildren = [];
		sectionChildren.push(
			...handler.writeDivisions()
		);

		this.doc.addSection({
			headers: { default: this.genTaskHeader(task) },
			footers: { default: this.genFooter() },
			size: this.getPageSize(),
			margins: this.getPageMargins(),
			// ! FIXME DOCX EVA has removed the getSectionChildren() function. Refactor this.
			children: sectionChildren
		});

		consoleHelper.success(`Added section to SODF DOCX for task ${task.title}`);
	}

};
