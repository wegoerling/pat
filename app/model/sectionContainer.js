'use strict';

module.exports = class SectionContainer {

	constructor() {
		this.children = [];
	}

	add(stuffToAdd) {
		this.children.push(stuffToAdd);
	}
};
