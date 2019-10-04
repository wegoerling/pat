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

	writeDivisions() {
		// Array of divisions. A division is a set of one or more series of
		// steps. So a division may have just one series for the "IV" actor, or
		// it may have multiple series for multiple actors.
		//
		// Example:
		// divisions = [
		//   { IV: [Step, Step, Step] },             // div 0: just IV series
		//   { IV: [Step], EV1: [Step, Step] },      // div 1: IV & EV1 series
		//   { EV1: [Step, Step], EV2: [Step] }      // div 2: EV1 & EV2 series
		// ]
		const divisions = this.task.concurrentSteps;
		const steps = [];
		for (const division of divisions) {
			steps.push(
				...this.writeDivision(division)
			);
		}
		return steps;
	}

	writeDivision(division) {
		const steps = [];
		for (const actor in division) {
			// NOTE: aSeries === division[actor]
			steps.push(
				// for now, flatten this series so all the steps are added directly to the section
				...this.writeSeries(division[actor])
			);
		}
		return steps;
	}

	writeSeries(series) {
		const steps = [];
		this.preInsertSteps();
		for (const step of series) {
			steps.push(...this.insertStep(step));
		}
		this.postInsertSteps();
		return steps;
	}

};
