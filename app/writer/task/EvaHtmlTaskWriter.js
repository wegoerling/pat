'use strict';

const path = require('path');

const nunjucks = require('nunjucks');

const nunjucksEnvironment = new nunjucks.Environment(
	new nunjucks.FileSystemLoader(path.join(__dirname, '../../view')),
	{ autoescape: false }
);

const HtmlTaskWriter = require('./HtmlTaskWriter');

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

		this.tableContents += nunjucksEnvironment.render(
			// path.join(__dirname, '..', '..', 'view', 'eva-task-table-header.html'),
			'eva-task-table-header.html',
			{
				columnNames: columnNames
			}
		);

		// this.divisionIndex++;
	}

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

		this.tableContents += nunjucksEnvironment.render('eva-table-division.html', {
			division: columnContainers
		});

		// this.divisionIndex++;
	}

	writeSeries(container, series) {
		this.setContainer(container);
		this.preInsertSteps();
		for (const step of series) {
			this.insertStep(step);
		}
		this.postInsertSteps();
	}

	getContent() {
		// NOTE: this is not Table of Contents
		return `<table class="gridtable">${this.tableContents}</table>`;
	}

};
