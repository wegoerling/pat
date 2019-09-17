'use strict';

const docx = require('docx');
const DocxHandler = require('./DocxHandler');

module.exports = class DocxTableHandler extends DocxHandler {

	constructor(task, docWrapper/*procedure, doc*/) {
		super(docWrapper);

		this.task = task;
		this.taskColumns = task.getColumns(task);

		this.numCols = this.taskColumns.length;
		this.numContentRows = task.concurrentSteps.length;
		this.numRows = this.numContentRows + 1;

		this.divisionIndex = 0;

		this.table = new docx.Table({
			rows: this.numRows,
			columns: this.numCols
		});

	}

	setContainer(container) {
		this.container = container;
	}

	setContainerHeader() {

		let headerColTexts = this.task.getColumns();

		if (headerColTexts.length !== this.numCols) {
			throw new Error('header column text array does not match number of table columns');
		}

		for (let c = 0; c < this.numCols; c++) {
			let cell = this.table.getCell(0, c);
			cell.add(new docx.Paragraph({
				text: headerColTexts[c],
				alignment: docx.AlignmentType.CENTER,
				style: 'strong'
			}));
		}

		this.divisionIndex++;
	}

	// add(stuffToAdd) {
	// 	this.children.push(stuffToAdd);
	// }

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

		for (let division of divisions) {
			this.writeDivision(division);
		}
	}

	writeDivision(division) {
		for(let actor in division) {
			// NOTE: aSeries === division[actor]
			let columnKey = this.procedure.getActorColumnKey(actor);
			let taskColumnIndex = this.task.getColumnIndex(columnKey);
			this.writeSeries(this.divisionIndex, taskColumnIndex, division[actor]);
		}

		this.divisionIndex++;
	}

	writeSeries(row, col, series) {
		let cell = this.table.getCell(row, col).setVerticalAlign(docx.VerticalAlign.TOP);
		for (let step of series) {
			this.setContainer(cell);
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
		return [this.table];
	}

	insertStep(step, level = 0) {

		// writeStep:
		// step.text via markdownformatter
		// loop over step.checkboxes via markdownformatter
		// FIXME: loop over images

		if (step.title) {
			this.addParagraph({
				text: step.title.toUpperCase()
			});
		}

		if (step.warnings.length) {
			this.addBlock('warning', step.warnings, this.docWrapper.taskNumbering);
		}
		if (step.cautions.length) {
			this.addBlock('caution', step.cautions, this.docWrapper.taskNumbering);
		}
		if (step.notes.length) {
			this.addBlock('note', step.notes, this.docWrapper.taskNumbering);
		}
		if (step.comments.length) {
			this.addBlock('comment', step.comments, this.docWrapper.taskNumbering);
		}

		if (step.text) {
			this.addParagraph({
				text: this.markupFilter(step.text),
				numbering: {
					num: this.docWrapper.taskNumbering.concrete,
					level: level
				}
			});
		}

		if (step.substeps.length) {
			for (const substep of step.substeps) {
				this.insertStep(substep, level + 1);
			}
		}

		if (step.checkboxes.length) {
			for (const checkstep of step.checkboxes) {
				this.addParagraph({
					text: this.markupFilter(`☐ ${checkstep}`),
					numbering: {
						num: this.docWrapper.taskNumbering.concrete,
						level: level + 1
					}
				});
			}
		}

	}
};
