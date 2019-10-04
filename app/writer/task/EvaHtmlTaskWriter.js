'use strict';

const path = require('path');

const nunjucks = require('nunjucks');

const nunjucksEnvironment = new nunjucks.Environment(
	new nunjucks.FileSystemLoader(path.join(__dirname, '../../view')),
	{ autoescape: false }
);

const HtmlTaskWriter = require('./HtmlTaskWriter');
const EvaDivisionWriter = require('./EvaDivisionWriter');

module.exports = class EvaHtmlTaskWriter extends HtmlTaskWriter {

	constructor(task, procedureWriter) {
		super(task, procedureWriter);

		this.taskColumns = task.getColumns();

		this.numCols = this.taskColumns.length;
		this.numContentRows = task.concurrentSteps.length;
		this.numRows = this.numContentRows + 1;

		// this.divisionIndex = 0;

		this.tableContents = '';

		this.columnContainers = [];
		for (let c = 0; c < this.numCols; c++) {
			this.columnContainers[c] = {
				content: '',
				add: function(text) {
					this.content += text;
				}
			};
		}

	}

	setTaskTableHeader() {

		const columnKeys = this.task.getColumns();
		const columnNames = [];

		if (columnKeys.length !== this.numCols) {
			throw new Error('header column text array does not match number of table columns');
		}

		for (let c = 0; c < this.numCols; c++) {
			columnNames.push(this.procedure.columnToDisplay[columnKeys[c]]);
		}

		const tableHeaderHtml = nunjucksEnvironment.render(
			// path.join(__dirname, '..', '..', 'view', 'eva-task-table-header.html'),
			'eva-task-table-header.html',
			{
				columnNames: columnNames
			}
		);

		// this.divisionIndex++;
		return tableHeaderHtml;
	}

	/*
	writeDivision(division) {

		const columnContainers = [];
		for (let c = 0; c < this.numCols; c++) {
			columnContainers[c] = {
				content: '',
				add: function(text) {
					this.content += text;
				}
			};
		}

		for (const actor in division) {
			// NOTE: aSeries === division[actor]
			const columnKey = this.procedure.getActorColumnKey(actor);
			const taskColumnIndex = this.task.getColumnIndex(columnKey);
			this.writeSeries(columnContainers[taskColumnIndex], division[actor]);
		}

		const divisionHtml = nunjucksEnvironment.render('eva-table-division.html', {
			division: columnContainers
		});

		// this.divisionIndex++;
		return [divisionHtml];
	}
	*/

	writeDivision(division) {
		const divWriter = new EvaDivisionWriter();

		const columns = divWriter.prepareDivision(
			division, this
		);

		const columnSettings = [];
		for (let c = 0; c < this.numCols; c++) {
			if (!columns[c]) {
				columnSettings.push({
					content: '',
					colspan: 1
				});
				continue;
			}
			columnSettings.push({
				content: columns[c].children.join(''),
				colspan: columns[c].colspan
			});
			if (columns[c].colspan > 1) {
				c += columns[c].colspan - 1;
			}
		}

		const tableDivision = nunjucksEnvironment.render(
			'eva-table-division.html',
			{
				division: columnSettings
			}
		);

		this.divisionIndex++;
		return [tableDivision];
	}

	writeSeries(series) {
		const steps = [];
		const preStep = this.preInsertSteps();
		if (preStep) {
			steps.push(preStep);
		}
		for (const step of series) {
			steps.push(
				...this.insertStep(step)
			);
		}
		const postStep = this.postInsertSteps();
		if (postStep) {
			steps.push(postStep);
		}
		return steps;
	}

};
