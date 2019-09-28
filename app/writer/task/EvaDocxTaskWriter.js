'use strict';

const docx = require('docx');
const DocxTaskWriter = require('./DocxTaskWriter');
const arrayHelper = require('../../helpers/arrayHelper');
const consoleHelper = require('../../helpers/consoleHelper');

module.exports = class EvaDocxTaskWriter extends DocxTaskWriter {

	constructor(task, procedureWriter) {
		super(task, procedureWriter);

		this.taskColumns = task.getColumns(task); // FIXME no need to pass task into getColumns

		this.numCols = this.taskColumns.length;
		this.numContentRows = task.concurrentSteps.length;
		this.numRows = this.numContentRows + 1;

		this.divisionIndex = 0;

		this.table = new docx.Table({
			rows: this.numRows,
			columns: this.numCols
		});

	}

	setTaskTableHeader() {

		const columnKeys = this.task.getColumns();

		if (columnKeys.length !== this.numCols) {
			throw new Error('header column text array does not match number of table columns');
		}

		for (let c = 0; c < this.numCols; c++) {
			const cell = this.table.getCell(0, c);
			cell.add(new docx.Paragraph({
				text: this.procedure.columnToDisplay[columnKeys[c]],
				alignment: docx.AlignmentType.CENTER,
				style: 'strong'
			}));
		}

		this.table.getRow(0).setTableHeader();

		this.divisionIndex++;
	}

	writeDivision(division) {
		console.log(division);
		const actorsInDivision = [];
		const columnsInDivision = [];
		const columnIndexesInDivision = [];
		const actorToColumn = {};
		const actorToColumnIndex = {};

		const jointActors = [];

		for (const actor in division) {
			if (actor.indexOf('+') === -1) {
				actorsInDivision.push(actor);

				const columnKey = this.procedure.getActorColumnKey(actor);
				columnsInDivision.push(columnKey);
				actorToColumn[actor] = columnKey;

				const taskColumnIndex = this.task.getColumnIndex(columnKey);
				columnIndexesInDivision.push(taskColumnIndex);
				actorToColumnIndex[actor] = taskColumnIndex;
			} else {
				jointActors.push(actor);
			}
		}

		// for holding not just one set of joint actors, but all of them. So if there were two joins
		// like "EV1 + IV" and "EV2 + SSRMS" we add all of these actors' column keys here
		const allJointActorColumnKeys = [];

		for (let a = 0; a < jointActors.length; a++) {

			const actors = jointActors[a];

			const actorsArr = actors.split('+').map((str) => {
				return str.trim();
			});
			const jointActorColumnKeys = actorsArr.map((act) => {
				return this.procedure.getActorColumnKey(act);
			});
			const jointActorTaskColumnIndexes = jointActorColumnKeys.map((colKey) => {
				return this.task.getColumnIndex(colKey);
			}).sort();

			// check if the columns are adjacent
			if (!arrayHelper.allAdjacent(jointActorTaskColumnIndexes)) {
				consoleHelper.error('When joining actors, columns must be adjacent');
			}

			// compute intersect between allJointActorColumnKeys and jointActorColumnKeys
			// then compute against columnsInDivision
			const intersect1 = allJointActorColumnKeys.filter(function(n) {
				return jointActorColumnKeys.indexOf(n) > -1;
			});
			const intersect2 = columnsInDivision.filter(function(n) {
				return jointActorColumnKeys.indexOf(n) > -1;
			});
			if (intersect1.length > 0 || intersect2.length > 0) {
				intersect1.push(...intersect2);
				consoleHelper.error(
					[
						'For joint actors (e.g. EV1 + EV2), actors cannot be used more than once.',
						`The following actors used more than once: ${intersect1.toString()}`
					],
					'Joint actors error'
				);
			}
			allJointActorColumnKeys.push(...jointActorColumnKeys);

			// save this for later
			jointActors[a] = {
				key: actors,
				array: actorsArr,
				columnKeys: jointActorColumnKeys,
				taskColumnIndexes: jointActorTaskColumnIndexes
			};
		}

		const columnReMap = {};
		for (let c = 0; c < this.numCols; c++) {
			columnReMap[c] = c; // map to itself
		}
		console.log(jointActors);
		// merge the merged columns and write the series' to them
		for (const actors of jointActors) {

			const firstCol = actors.taskColumnIndexes[0];
			const lastCol = actors.taskColumnIndexes[actors.taskColumnIndexes.length - 1];

			for (let i = firstCol; i <= lastCol; i++) {
				columnReMap[i] = firstCol;
			}
			const remapDiff = lastCol - firstCol;
			for (let i = lastCol + 1; i < this.numCols; i++) {
				columnReMap[i] = i - remapDiff;
			}
			this.table.getRow(this.divisionIndex).mergeCells(firstCol, lastCol);

			this.writeSeries(
				this.divisionIndex,
				firstCol, // Guessing only able to reference merged columns by first column
				division[actors.key] // get the division info by the key like "EV1 + EV2"
			);
		}

		// write series' the normal columns
		for (const actor in actorToColumnIndex) {
			this.writeSeries(this.divisionIndex, actorToColumnIndex[actor], division[actor]);
		}

		this.table.getRow(this.divisionIndex).setCantSplit();

		// OPTIMIZE for joint actor cases where there are fewer columns
		for (let c = 0; c < this.numCols; c++) {
			this.table.getCell(this.divisionIndex, columnReMap[c]).Borders.addTopBorder(docx.BorderStyle.SINGLE, 1, 'AAAAAA');

			if (this.divisionIndex < this.numRows - 1) {
				this.table.getCell(this.divisionIndex, columnReMap[c]).Borders.addBottomBorder(docx.BorderStyle.SINGLE, 1, 'AAAAAA');
			}
		}

		this.divisionIndex++;
	}

	writeSeries(row, col, series) {
		const cell = this.table.getCell(row, col).setVerticalAlign(docx.VerticalAlign.TOP);
		this.preInsertSteps();
		for (const step of series) {
			this.setContainer(cell); // FIXME: pretty sure this can move outside for loop
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
		return [this.table];
	}

};
