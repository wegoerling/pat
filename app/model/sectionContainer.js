'use strict';

const docx = require('docx');

module.exports = class SectionContainer {

	constructor (container) {
		this.children = [];
	}

	add (stuffToAdd) {
		this.children.push(stuffToAdd);
	}
};
