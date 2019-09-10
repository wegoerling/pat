'use strict';

const fs = require('fs');
const docx = require('docx');
// const childProcess = require('child_process');

const Writer = require('./Writer');

module.exports = class ThreeColDocx extends Writer {

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
}
