'use strict';

const fs = require('fs');
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

		for (const task of this.procedure.tasks) {
			this.renderTask(task);
		}
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
		docx.Packer.toBuffer(this.doc).then((buffer) => {
			fs.writeFileSync(filepath, buffer);
			consoleHelper.success(`${filepath} written!`);
		});
	}

	genHeader(task) {

		const durationDisplays = [];
		let durationDisplay;

		for (const role of task.rolesArr) {
			durationDisplays.push(role.duration.format('H:M'));
		}

		// if all the duration displays are the same
		if (durationDisplays.every((val, i, arr) => val === arr[0])) {
			durationDisplay = durationDisplays[0];

		// not the same, concatenate them
		} else {
			durationDisplay = durationDisplays.join(' / ');
		}

		return new docx.Header({
			children: [new docx.Paragraph({
				children: [new docx.TextRun({
					text: `${this.procedure.name} - ${task.title} (${durationDisplay})`,
					bold: true,
					size: 24, // half-points, so double the point height
					font: {
						name: 'Arial'
					}
				})]
			})]
		});
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
				new docx.TextRun(`${gitDate} (version: ${gitHash})`),
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
