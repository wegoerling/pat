'use strict';

const fs = require('fs');
const path = require('path');
const docx = require('docx');

const consoleHelper = require('../../helpers/consoleHelper');

const ProcedureWriter = require('./ProcedureWriter');

module.exports = class DocxProcedureWriter extends ProcedureWriter {

	constructor(program, procedure) {
		super(program, procedure);

		// NOTE: 720 = 1/2 inch
		//       360 = 1/4
		//       180 = 1/8
		//       90  = 1/16
		this.initialIndent = 45;
		this.indentStep = 360;
		// const tabOffset = 360;

		// how far left of the up-pointing arrow the down-pointing arrow should be
		this.hanging = 360;
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

	}

	/**
	 * [getIndents description]
	 *
	 * @param  {int} levelIndex How far indented? Top level list is 0, first
	 *                          sub-list is 1, next is 2, and so on.
	 * @return {Object} Indent object like { left: INT, tab: INT, hanging: INT }
	 */
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

	getDoc() {
		const doc = new docx.Document(this.getDocMeta());
		doc.Styles.createParagraphStyle('normal', 'Normal')
			.basedOn('Normal')
			.next('Normal')
			.font('Arial')
			.quickFormat()
			.size(20)
			.indent({ left: 45 })
			.spacing({
				// line: 276,
				before: 45, // 20 * 72 * 0.05,
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
				before: 45, // 20 * 72 * 0.05,
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
				before: 45, // 20 * 72 * 0.05,
				after: 0 // 20 * 72 * 0.05
			});

		return doc;
	}

	writeFile(filepath) {
		const relativeFilepath = path.relative(process.cwd(), filepath);

		console.log(`Starting to write ${relativeFilepath}`);
		docx.Packer.toBuffer(this.doc).then((buffer) => {
			fs.writeFileSync(filepath, buffer);
			consoleHelper.success(`SUCCESS: ${relativeFilepath} written!`);
		});
	}

	genHeader(headerText) {

		return new docx.Header({
			children: [new docx.Paragraph({
				children: [new docx.TextRun({
					text: headerText,
					bold: true,
					size: 24, // half-points, so double the point height
					font: {
						name: 'Arial'
					}
				})]
			})]
		});
	}

	genTaskHeader(task) {
		const durationDisplay = this.getTaskDurationDisplay(task);
		return this.genHeader(`${this.procedure.name} - ${task.title} (${durationDisplay})`);
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
		const gitUncommitted = this.getGitUncommittedChanges();

		const children = [ new docx.TextRun(`${gitDate} (version: ${gitHash})`) ];
		if (gitUncommitted) {
			children.push(new docx.TextRun({
				text: ` WARNING: ${gitUncommitted}`,
				color: 'red',
				bold: true
			}));
		}
		children.push(new docx.TextRun('Page ').pageNumber().tab());
		children.push(new docx.TextRun(' of ').numberOfTotalPages());

		const footerParagraph = new docx.Paragraph({
			alignment: docx.AlignmentType.LEFT,
			children: children,
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

	renderIntro() {
		return '';
	}

	renderOutro() {
		return '';
	}
};
