'use strict';

// const docx = require('docx');
const DocxTaskWriter = require('./DocxTaskWriter');

module.exports = class SodfDocxTaskWriter extends DocxTaskWriter {

	constructor(task, procedureWriter) {
		super(task, procedureWriter);

		this.container = {
			children: [],
			add: function(item) {
				this.children.push(item);
			}
		};
	}

	writeDivision(division) {
		for (const actor in division) {
			// NOTE: aSeries === division[actor]
			this.writeSeries(division[actor]);
		}
	}

	writeSeries(series) {
		this.preInsertSteps();
		for (const step of series) {
			this.insertStep(step);
		}
		this.postInsertSteps();
	}

	/**
	 * For the EvaDocxTaskWriter type, the content is all within the docx table.
	 * However, it must be wrapped in an array since docx.Document.addSection
	 * expects one argument: an object with { children: anIterable }.
	 *
	 * @return {Array} array wrapped around a docx.Table object
	 */
	getSectionChildren() {
		return this.container.children;
	}

};
