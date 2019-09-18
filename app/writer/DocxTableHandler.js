'use strict';

const docx = require('docx');
const DocxHandler = require('./DocxHandler');

module.exports = class DocxTableHandler extends DocxHandler {

	constructor(task, docWrapper/* procedure, doc*/) {
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

		const headerColTexts = this.task.getColumns();

		if (headerColTexts.length !== this.numCols) {
			throw new Error('header column text array does not match number of table columns');
		}

		for (let c = 0; c < this.numCols; c++) {
			const cell = this.table.getCell(0, c);
			cell.add(new docx.Paragraph({
				text: headerColTexts[c],
				alignment: docx.AlignmentType.CENTER,
				style: 'strong'
			}));
		}

		this.table.getRow(0).setTableHeader();

		this.divisionIndex++;
	}

	writeDivision(division) {
		for (const actor in division) {
			// NOTE: aSeries === division[actor]
			const columnKey = this.procedure.getActorColumnKey(actor);
			const taskColumnIndex = this.task.getColumnIndex(columnKey);
			this.writeSeries(this.divisionIndex, taskColumnIndex, division[actor]);
		}

		this.table.getRow(this.divisionIndex).setCantSplit();

		for (let c = 0; c < this.numCols; c++) {
			this.table.getCell(this.divisionIndex, c).Borders.addTopBorder(docx.BorderStyle.SINGLE, 1, 'AAAAAA');

			if (this.divisionIndex < this.numRows - 1) {
				this.table.getCell(this.divisionIndex, c).Borders.addBottomBorder(docx.BorderStyle.SINGLE, 1, 'AAAAAA');
			}
		}

		this.divisionIndex++;
	}

	writeSeries(row, col, series) {
		const cell = this.table.getCell(row, col).setVerticalAlign(docx.VerticalAlign.TOP);
		for (const step of series) {
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

};
