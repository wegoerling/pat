'use strict';

const fs = require('fs');
const docx = require('docx');
// const childProcess = require('child_process');

const Writer = require('./Writer');

module.exports = class ThreeColDocx extends Writer {

	constructor(program, procedure) {
		super(program, procedure);
	}

}
