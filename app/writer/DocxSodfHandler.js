'use strict';

const docx = require('docx');
const DocxHandler = require('./DocxHandler');

module.exports = class DocxSodfHandler extends DocxHandler {

	constructor(task, docWrapper) {
		super(docWrapper);

		this.task = task;

		this.container = {
			children: [],
			add: function(item) {
				this.children.push(item);
			}
		};
	}

	writeDivision(division) {
		for(let actor in division) {
			// NOTE: aSeries === division[actor]
			this.writeSeries(division[actor]);
		}
	}

	writeSeries(series) {
		for (let step of series) {
			this.insertStep(step);
		}
	}

	/**
	 * For the DocxTableHandler type, the content is all within the docx table.
	 * However, it must be wrapped in an array since docx.Document.addSection
	 * expects one argument: an object with { children: anIterable }.
	 *
	 * @return {Array} array wrapped around a docx.Table object
	 */
	getSectionChildren() {
		return this.container.children;
	}

};
