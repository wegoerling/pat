'use strict';

const fs = require('fs');
const docx = require('docx');
const childProcess = require('child_process');

module.exports = class Writer {

	constructor(program, procedure) {
		let task;

		this.program = program;
		this.procedure = procedure;

		// NOTE: 720 = 1/2 inch
		//       360 = 1/4
		//       180 = 1/8
		//       90  = 1/16
		this.initialIndent = 45;
		this.indentStep = 360;
		// const tabOffset = 360;
		this.hanging = 360; // how far left of the up-pointing arrow the down-pointing arrow should be
		this.levelTypes = [
			'decimal',
			'lowerLetter',
			'decimal',
			'lowerLetter',
			'decimal',
			'lowerLetter',
			'decimal',
			'lowerLetter',
			'decimal',
			'lowerLetter'
		];
		this.levels = [];

		this.doc = this.getDoc();

		this.taskNumbering = null; // gets set by getNumbering...better to return value
		this.getNumbering();

		// console.log(JSON.stringify(concrete, null, 4));
		for (task of this.procedure.tasks) {
			this.renderTask(task);
		}
	}


	/**
	 * Detect and return what columns are present on a task. A given task may
	 * have 1 or more columns. Only return those present in a task.
	 *
	 * @param  {Task} task         Task object holding columns/steps
	 * @param  {Array} docColumns  The full list of possible columns, in the proper
	 *                             order
	 * @return {Array}             Array of column names in this procedure
	 */
	getTaskColumns(task, docColumns) {

		const stepRows = task.concurrentSteps;
		const taskColumns = [];
		const taskColumnsHash = {};
		let stepRow,
			colName;

		// Loop over the array of stepRows, and within that loop over each object of
		// colName:[array,of,steps].
		//
		// stepRows = [
		//   { IV: [Step, Step, Step] },              // stepRow 0
		//   { IV: [Step], EV1: [Step, Step] },       // stepRow 1
		//   { EV1: [Step, Step], EV2: [Step] }       // stepRow 2
		// ]
		//
		for (stepRow of stepRows) {
			for (colName in stepRow) {
				if (!taskColumnsHash[colName]) {
					// insert into a hash table because lookup is faster than array
					taskColumnsHash[colName] = true;
				}
			}
		}

		// create taskColumns in order specified by procedure
		for (colName of docColumns) {
			if (taskColumnsHash[colName]) {
				taskColumns.push(colName);
			}
		}

		return taskColumns;
	}

	// MOVED TO: ContainerWriter
	// markupFilter(procedureMarkup) {
	// 	// FIXME: Process the procedure markup from wikitext/markdown-ish to what
	// 	// docx needs. Similar to app/helpers/markdownHelper.js

	// 	procedureMarkup = procedureMarkup
	// 		.replace(/\{\{CHECK\}\}/g, '✓')
	// 		.replace(/\{\{CHECKBOX\}\}/g, '☐')
	// 		.replace(/\{\{CHECKEDBOX\}\}/g, '☑')
	// 		.replace(/\{\{LEFT\}\}/g, '←')
	// 		.replace(/\{\{RIGHT\}\}/g, '→')
	// 		.replace(/\{\{CONNECT\}\}/g, '→|←')
	// 		.replace(/\{\{DISCONNECT\}\}/g, '←|→');

	// 	return procedureMarkup;
	// }

	// MOVED TO: containerWriter
	// addParagraphToCell(cell, params = {}) {
	// 	if (!params.text) {
	// 		params.text = '';
	// 	}
	// 	if (!params.style) {
	// 		params.style = 'normal';
	// 	}
	// 	cell.add(new docx.Paragraph(params));
	// }

	// MOVED TO: containerWriter
	// addBlockToCell(taskCell, blockType, blockLines) {
	// 	const blockTable = new docx.Table({
	// 		rows: 2,
	// 		columns: 1
	// 	});

	// 	const fillColors = {
	// 		comment: '00FF00',
	// 		note: 'FFFFFF',
	// 		caution: 'FFFF00',
	// 		warning: 'FF0000'
	// 	};

	// 	const textColors = {
	// 		comment: '000000',
	// 		note: '000000',
	// 		caution: '000000',
	// 		warning: 'FFFFFF'
	// 	};

	// 	// FIXME add logic for formatting based upon type
	// 	blockTable.getCell(0, 0).add(new docx.Paragraph({
	// 		children: [new docx.TextRun({
	// 			text: blockType.toUpperCase(),
	// 			color: textColors[blockType]
	// 		})],
	// 		alignment: docx.AlignmentType.CENTER
	// 	})).setShading({
	// 		fill: fillColors[blockType],
	// 		val: docx.ShadingType.CLEAR,
	// 		color: 'auto'
	// 	});
	// 	const contentCell = blockTable.getCell(1, 0);

	// 	for (const line of blockLines) {
	// 		contentCell.add(new docx.Paragraph({
	// 			text: this.markupFilter(line),
	// 			numbering: {
	// 				num: taskNumbering.concrete,
	// 				level: 0
	// 			}

	// 		}));
	// 	}

	// 	// taskCell.add(new docx.Paragraph(blockTable));
	// 	taskCell.add(blockTable);
	// 	// taskCell.add(new docx.Table(1, 1));
	// }

	insertStep(series /* was cell */, step, level = 0) {

		// writeStep:
		// step.text via markdownformatter
		// loop over step.checkboxes via markdownformatter
		// FIXME: loop over images

		if (step.title) {
			series.container.addParagraph({
				text: step.title.toUpperCase()
			});
		}

		if (step.warnings.length) {
			series.container.addBlock('warning', step.warnings);
		}
		if (step.cautions.length) {
			series.container.addBlock('caution', step.cautions);
		}
		if (step.notes.length) {
			series.container.addBlock('note', step.notes);
		}
		if (step.comments.length) {
			series.container.addBlock('comment', step.comments);
		}

		if (step.text) {
			series.container.addParagraph({
				text: this.markupFilter(step.text),
				numbering: {
					num: this.taskNumbering.concrete,
					level: level
				}
			});
		}

		if (step.substeps.length) {
			for (const substep of step.substeps) {
				this.insertStep(cell, substep, level + 1);
			}
		}

		if (step.checkboxes.length) {
			for (const checkstep of step.checkboxes) {
				series.container.addParagraph({
					text: this.markupFilter(`☐ ${checkstep}`),
					numbering: {
						num: this.taskNumbering.concrete,
						level: level + 1
					}
				});
			}
		}

	}


	/*
	If you want step numbers like 3.5.2
	function getLongStepString (levelIndex) {
		let output = '';
		for (let i = 0; i <= levelIndex; i++) {
			let levelValue = i + 1;
			output += `%${levelValue}.`;
		}
		return output;
	}
	*/

	getGitHash() {
		// if (fs.existsSync(this.program.gitPath)) {
		// 	try {
		// 		gitHash = childProcess
		// 			.execSync(`git rev-parse HEAD`)
		// 			.toString().trim().slice(0,8);
		// 	}

		// }

		if (!this.gitHash) {
			this.gitHash = 'fake1234'; // FIXME
		}
		return this.gitHash;
	}

	getGitDate() {
		// gitDate = childProcess
		// .execSync('git log -1 --format=%cd --date=iso8601')
		// .toString().trim();

		if (!this.gitDate) {
			this.gitDate = '1970-01-01'; // FIXME
		}
		return this.gitDate;
	}

	writeFile(filepath) {
		docx.Packer.toBuffer(this.doc).then((buffer) => {
			fs.writeFileSync(filepath, buffer);
		});
	}

	getNumbering() {
		this.taskNumbering = {};

		// const numbering = new docx.Numbering();
		// const abstractNum = numbering.createAbstractNumbering();
		// const abstractNum = doc.Numbering.createAbstractNumbering();
		this.taskNumbering.abstract = this.doc.Numbering.createAbstractNumbering();

		for (let i = 0; i < 3; i++) {
			// var stepText = getLongStepString(i);
			var indents = this.getIndents(i);
			this.levels[i] = this.taskNumbering.abstract.createLevel(i, this.levelTypes[i], `%${i + 1}.`, 'left');
			this.levels[i].indent({ left: indents.left, hanging: indents.hanging });
			this.levels[i].leftTabStop(indents.tab);
		}

		this.taskNumbering.concrete = this.doc.Numbering.createConcreteNumbering(this.taskNumbering.abstract);
	}

	getIndents(levelIndex) {
		const left = this.initialIndent + (levelIndex * this.indentStep) + this.hanging;
		const tab = left;
		const output = {
			left: left,
			tab: tab,
			hanging: this.hanging
		};
		return output;
	}

	getLastModifiedBy() {
		return ""; // FIXME: get this from git repo if available
	}

	getDoc() {
		const docMeta = {
			title: this.procedure.procedure_name,
			lastModifiedBy: this.getLastModifiedBy(),
			creator: this.program.fullName
		};
		if (this.procedure.description) {
			docMeta.description = this.procedure.description; // FIXME: not implemented
		}
		const doc = new docx.Document(docMeta);
		doc.Styles.createParagraphStyle('normal', 'Normal')
			.basedOn('Normal')
			.next('Normal')
			.font('Arial')
			.quickFormat()
			.size(20)
			.spacing({
				// line: 276,
				before: 0, // 20 * 72 * 0.05,
				after: 0 // 20 * 72 * 0.05
			});

		doc.Styles.createParagraphStyle('listparagraph', 'List Paragraph')
			.basedOn('List Paragraph')
			.next('List Paragraph')
			.font('Arial')
			.quickFormat()
			.size(20)
			.spacing({
				// line: 276,
				before: 0, // 20 * 72 * 0.05,
				after: 0 // 20 * 72 * 0.05
			});

		doc.Styles.createParagraphStyle('strong', 'Strong')
			.basedOn('Normal')
			.next('Normal')
			.font('Arial')
			.bold()
			.quickFormat()
			.size(20)
			.spacing({
				// line: 276,
				before: 0, // 20 * 72 * 0.05,
				after: 0 // 20 * 72 * 0.05
			});

		return doc;
	}

	getPageSize() {
		throw new Error('Abstract function not implemented');
	}

	getPageMargins() {
		throw new Error('Abstract function not implemented');
	}

	renderTask(task) {

		// FIXME: this shouldn't be hard-code, but should come from procedure
		const docColumns = ['IV', 'EV1', 'EV2'];

		// taskCols = ["IV", "EV1", "EV2"]
		const taskCols = this.getTaskColumns(task, docColumns);

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
		const divisions = task.concurrentSteps;

		let division, // was "row", is a row in a 3-column table format
			d, // was "r", is index for division
			colName,
			c,
			col,
			step;

		var cell;

		const table = new docx.Table({
			rows: task.concurrentSteps.length + 1,
			columns: taskCols.length
		});

		for (c = 0; c < taskCols.length; c++) {
			cell = table.getCell(0, c);
			cell.add(new docx.Paragraph({
				text: taskCols[c],
				alignment: docx.AlignmentType.CENTER,
				style: 'strong'
			}));
		}

		for (d = 0; d < divisions.length; d++) {
			division = divisions[d];

			for (c = 0; c < taskCols.length; c++) {
				colName = taskCols[c];

				series = new Series(division, colName, procedure);
				if (series.hasSteps()) {
					series.setContainer(
						table.getCell(d + 1, c)
							.setVerticalAlign(docx.VerticalAlign.TOP)
					);
					for (step of series.getSteps()) {
						this.insertStep(series, step);
					}
				}
			}
		}

		this.doc.addSection({
			headers: { default: this.genHeader(task) },
			footers: { default: this.genFooter() },
			size: this.getPageSize(),
			margins: this.getPageMargins(),
			children: [table]
		});
	}

	genHeader(task) {
		return new docx.Header({
			children: [new docx.Paragraph({
				children: [new docx.TextRun({
					text: `${this.procedure.name} - ${task.title} (${task.duration})`,
					bold: true,
					size: 24, // half-points, so double the point height
					font: {
						name: 'Arial'
					}
				})]
			})]
		});
	}

	getRightTabPosition() {
		throw new Error('Abstract function not implemented');
	}

	genFooter() {
		// const procFooter = new docx.Paragraph({ children: [] }).maxRightTabStop();
		// const leftFooterText = new docx.TextRun(
		// ---   "Latest change: " + gitDate + " (Version: " + gitHash + ")");
		// const rightFooterText = new docx.TextRun("Page").tab();
		// procFooter.addRun(leftFooterText);
		// procFooter.addRun(rightFooterText);

		const gitDate = this.getGitDate();
		const gitHash = this.getGitHash();

		const footerParagraph = new docx.Paragraph({
			alignment: docx.AlignmentType.LEFT,
			children: [
				new docx.TextRun(`${gitDate} (${gitHash})`),
				new docx.TextRun('Page ').pageNumber().tab(),
				new docx.TextRun(' of ').numberOfTotalPages()
			],
			tabStop: {
				right: { position: this.getRightTabPosition() }
			},
			style: 'normal'
		}); // / .allCaps();

		const procFooter = new docx.Footer({
			children: [footerParagraph]
		});

		return procFooter;
	}

};
