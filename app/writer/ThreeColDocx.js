'use strict';

const fs = require('fs');
const docx = require('docx');
// const childProcess = require('child_process');

var doc;
var taskNumbering;

// NOTE: 720 = 1/2 inch
//       360 = 1/4
//       180 = 1/8
//       90  = 1/16
const initialIndent = 45;
const indentStep = 360;
// const tabOffset = 360;
const hanging = 360; // how far left of the up-pointing arrow the down-pointing arrow should be
const levelTypes = [
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
var levels = [];

function getGitHash(repoPath) {
	// FIXME: This needs update to point to a repoPath rather than using the
	// current working directory

	// gitHash = childProcess
	// .execSync('git rev-parse HEAD')
	// .toString().trim().slice(0,8);

	repoPath.slice(0, 8); // quiet eslint for now
	return 'fake1234'; // FIXME
}

function getGitDate(repoPath) {
	// FIXME: This needs update to point to a repoPath rather than using the
	// current working directory

	// gitDate = childProcess
	// .execSync('git log -1 --format=%cd --date=iso8601')
	// .toString().trim();

	repoPath.slice(0, 8); // quiet eslint for now
	return '1970-01-01'; // FIXME
}

/**
 * Detect and return what columns are present on a task. A given task may have 1
 * or more columns. Only return those present in a task.
 *
 * @param  {Task} task         Task object holding columns/steps
 * @param  {Array} docColumns  The full list of possible columns, in the proper
 *                             order
 * @return {Array}             Array of column names in this procedure
 */
function getTaskColumns(task, docColumns) {

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

function markupFilter(procedureMarkup) {
	// FIXME: Process the procedure markup from wikitext/markdown-ish to what
	// docx needs. Similar to app/helpers/markdownHelper.js
	return procedureMarkup;
}

function addParagraphToCell(cell, params = {}) {
	if (!params.text) {
		params.text = '';
	}
	if (!params.style) {
		params.style = 'normal';
	}
	cell.add(new docx.Paragraph(params));
}

function addBlockToCell(taskCell, blockType, blockLines) {
	const blockTable = new docx.Table({
		rows: 2,
		columns: 1
	});

	const fillColors = {
		comment: '00FF00',
		note: 'FFFFFF',
		caution: 'FFFF00',
		warning: 'FF0000'
	};

	const textColors = {
		comment: '000000',
		note: '000000',
		caution: '000000',
		warning: 'FFFFFF'
	};

	// FIXME add logic for formatting based upon type
	blockTable.getCell(0, 0).add(new docx.Paragraph({
		children: [new docx.TextRun({
			text: blockType.toUpperCase(),
			color: textColors[blockType]
		})],
		alignment: docx.AlignmentType.CENTER
	})).setShading({
		fill: fillColors[blockType],
		val: docx.ShadingType.CLEAR,
		color: 'auto'
	});
	const contentCell = blockTable.getCell(1, 0);

	for (const line of blockLines) {
		contentCell.add(new docx.Paragraph({
			text: markupFilter(line),
			numbering: {
				num: taskNumbering.concrete,
				level: 0
			}

		}));
	}

	// taskCell.add(new docx.Paragraph(blockTable));
	taskCell.add(blockTable);
	// taskCell.add(new docx.Table(1, 1));
}

function insertStep(cell, step, level = 0) {

	// writeStep:
	// step.text via markdownformatter
	// loop over step.checkboxes via markdownformatter
	// loop over step.substeps, do writeStep
	// loop over images ... do nothing but print for now
	// loop over comments...what is this?

	if (step.title) {
		addParagraphToCell(cell, {
			text: step.title.toUpperCase()
		});
	}

	if (step.warnings.length) {
		addBlockToCell(cell, 'warning', step.warnings);
	}
	if (step.cautions.length) {
		addBlockToCell(cell, 'caution', step.cautions);
	}
	if (step.notes.length) {
		addBlockToCell(cell, 'note', step.notes);
	}
	if (step.comments.length) {
		addBlockToCell(cell, 'comment', step.comments);
	}

	if (step.text) {
		addParagraphToCell(cell, {
			text: markupFilter(step.text),
			numbering: {
				num: taskNumbering.concrete,
				level: level
			}
		});
	}

	if (step.substeps.length) {
		for (const substep of step.substeps) {
			insertStep(cell, substep, level + 1);
		}
	}

}

function genHeader(procedure, task) {
	return new docx.Header({
		children: [new docx.Paragraph({
			children: [new docx.TextRun({
				text: `${procedure.name} - ${task.title} (${task.duration})`,
				bold: true,
				size: 24, // half-points, so double the point height
				font: {
					name: 'Arial'
				}
			})]
		})]
	});
}

function genFooter() {
	// const procFooter = new docx.Paragraph({ children: [] }).maxRightTabStop();
	// const leftFooterText = new docx.TextRun(
	// ---   "Latest change: " + gitDate + " (Version: " + gitHash + ")");
	// const rightFooterText = new docx.TextRun("Page").tab();
	// procFooter.addRun(leftFooterText);
	// procFooter.addRun(rightFooterText);

	const gitDate = getGitDate('FIXMEpathTOrepo');
	const gitHash = getGitHash('FIXMEpathTOrepo');

	const footerParagraph = new docx.Paragraph({
		alignment: docx.AlignmentType.LEFT,
		children: [
			new docx.TextRun(`${gitDate} (${gitHash})`),
			new docx.TextRun('Page ').pageNumber().tab(),
			new docx.TextRun(' of ').numberOfTotalPages()
		],
		tabStop: {
			right: { position: 14400 }
		},
		style: 'normal'
	}); // / .allCaps();

	const procFooter = new docx.Footer({
		children: [footerParagraph]
	});

	return procFooter;
}

function renderTask(procedure, task) {

	// FIXME: this shouldn't be hard-code, but should come from procedure
	const docColumns = ['IV', 'EV1', 'EV2'];

	const rows = task.concurrentSteps;
	const taskCols = getTaskColumns(task, docColumns);

	let row,
		r,
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

	// taskCols = ["IV", "EV1", "EV2"]
	// rows = [
	//   { IV: [Step, Step, Step] },              // stepRow 0
	//   { IV: [Step], EV1: [Step, Step] },       // stepRow 1
	//   { EV1: [Step, Step], EV2: [Step] }       // stepRow 2
	// ]
	for (r = 0; r < rows.length; r++) {
		row = rows[r];

		for (c = 0; c < taskCols.length; c++) {

			colName = taskCols[c];

			// each col name may not have steps within each row. If not, just
			// set it false.
			col = row[colName] ? row[colName] : false;

			if (col) {
				cell = table.getCell(r + 1, c);
				for (step of col) {
					insertStep(cell, step);
				}

				cell.setVerticalAlign(docx.VerticalAlign.TOP);

			}
		}
	}

	doc.addSection({
		headers: { default: genHeader(procedure, task) },
		footers: { default: genFooter() },
		size: {
			width: 12240, // width and height transposed in LANDSCAPE
			height: 15840,
			orientation: docx.PageOrientation.LANDSCAPE
		},
		margins: {
			top: 720,
			right: 720,
			bottom: 720,
			left: 720
		},
		children: [table]
	});
}

function getDoc(program, procedure) {
	const doc = new docx.Document({
		title: procedure.procudure_name,
		description: 'FIXME: Get from procedure yaml',
		// creator: Get from git? What if multiple committers to a proc?
		// Just make creator 'Spacewalk'?
		lastModifiedBy: 'FIXME-InsertFromGit'
		// revision: ??? ref: https://github.com/dolanmiu/docx/blob/552580bc47b09898d5b5793e656c27ebaf54e06f/docs/usage/document.md
	});
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

function getIndents(levelIndex) {
	const left = initialIndent + (levelIndex * indentStep) + hanging;
	const tab = left;
	const output = {
		left: left,
		tab: tab,
		hanging: hanging
	};
	return output;
}

function getNumbering() {
	taskNumbering = {};

	// const numbering = new docx.Numbering();
	// const abstractNum = numbering.createAbstractNumbering();
	// const abstractNum = doc.Numbering.createAbstractNumbering();
	taskNumbering.abstract = doc.Numbering.createAbstractNumbering();

	for (let i = 0; i < 3; i++) {
		// var stepText = getLongStepString(i);
		var indents = getIndents(i);
		levels[i] = taskNumbering.abstract.createLevel(i, levelTypes[i], `%${i + 1}.`, 'left');
		levels[i].indent({ left: indents.left, hanging: indents.hanging });
		levels[i].leftTabStop(indents.tab);
	}

	taskNumbering.concrete = doc.Numbering.createConcreteNumbering(taskNumbering.abstract);
}

/*
function getLongStepString (levelIndex) {
	let output = '';
	for (let i = 0; i <= levelIndex; i++) {
		let levelValue = i + 1;
		output += `%${levelValue}.`;
	}
	return output;
}
*/

module.exports = class ThreeColDocx {

	constructor(program, procedure) {
		let task;

		this.program = program;
		this.procedure = procedure;
		doc = getDoc(program, procedure);
		getNumbering();
		// console.log(JSON.stringify(concrete, null, 4));
		for (task of this.procedure.tasks) {
			renderTask(procedure, task, this.doc);
		}
	}

	writeFile(filepath) {
		docx.Packer.toBuffer(doc).then((buffer) => {
			fs.writeFileSync(filepath, buffer);
		});
	}
};
