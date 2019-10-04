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
	}

	setTaskTableHeader() {

		const columnKeys = this.task.getColumns();

		if (columnKeys.length !== this.numCols) {
			throw new Error('header column text array does not match number of table columns');
		}

		const tableCells = Array(this.numCols).fill(0).map((val, index) => {
			return new docx.TableCell({
				children: [new docx.Paragraph({
					text: this.procedure.columnToDisplay[columnKeys[index]],
					alignment: docx.AlignmentType.CENTER,
					style: 'strong'
				})]
			});
		});

		this.divisionIndex++;

		return new docx.TableRow({
			children: tableCells,
			tableHeader: true
		});

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
		const tableRows = [];
		for (const division of divisions) {
			tableRows.push(this.writeDivision(division));
		}
		return tableRows;
	}

	writeDivision(division) {

		const columns = {};

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

		// ! FIXME: with declarative tables the column remap may not be necessary anymore
		const columnReMap = {};
		for (let c = 0; c < this.numCols; c++) {
			columnReMap[c] = c; // map to itself
		}

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
			// this.table.getRow(this.divisionIndex).mergeCells(firstCol, lastCol);

			if (!columns[firstCol]) {
				columns[firstCol] = {
					colspan: lastCol - firstCol + 1,
					children: []
				};
			}

			columns[firstCol].children.push(...this.writeSeries(
				division[actors.key], // get the division info by the key like "EV1 + EV2"
			));
		}

		// write series' the normal columns
		for (const actor in actorToColumnIndex) {
			const col = actorToColumnIndex[actor];

			if (!columns[col]) {
				columns[col] = {
					colspan: 1,
					children: []
				};
			}

			columns[col].children.push(
				...this.writeSeries(division[actor])
			);
		}

		const borders = {
			top: {
				style: docx.BorderStyle.SINGLE,
				size: 1,
				color: 'AAAAAA'
			}
		};
		if (this.divisionIndex !== this.numRows - 1) {
			borders.bottom = {
				style: docx.BorderStyle.SINGLE,
				size: 1,
				color: 'AAAAAA'
			};
		}

		const rowChildren = [];
		for (let c = 0; c < this.numCols; c++) {
			if (!columns[c]) {
				rowChildren.push(new docx.TableCell({
					children: [],
					columnSpan: 1,
					verticalAlign: docx.VerticalAlign.TOP,
					borders: borders
				}));
				continue;
			}
			rowChildren.push(new docx.TableCell({
				children: columns[c].children,
				columnSpan: columns[c].colspan,
				verticalAlign: docx.VerticalAlign.TOP,
				borders: borders
			}));
			if (columns[c].colspan > 1) {
				c += columns[c].colspan - 1;
			}
		}
		const tableRow = new docx.TableRow({
			children: rowChildren,
			cantSplit: true
		});

		this.divisionIndex++;
		return tableRow;
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
