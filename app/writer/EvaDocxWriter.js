'use strict';

const docx = require('docx');
const DocxWriter = require('./DocxWriter');

module.exports = class EvaDocxWriter extends DocxWriter {

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
};
