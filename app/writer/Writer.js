'use strict';

const fs = require('fs');
const docx = require('docx');
const childProcess = require('child_process');
// const Series = require('../model/series');
const DocxTableHandler = require('./DocxTableHandler');

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

		for (task of this.procedure.tasks) {
			this.renderTask(task);
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

	/**
	 * MOVE TO: Program (currently there is no Program.js; "Program" is really
	 * NPM Commander package. Perhaps should have Project.js since procedures
	 * are really documents within a project.)
	 *
	 * FIXME: Instead of using child_process, dig into .git directory. Or use
	 * an npm package for dealing with git\
	 *
	 * FIXME: This does not currently account for changes to working directory.
	 *
	 * ADD FEATURE: Consider `git describe --tags` if tags are available. That
	 * will be easier for people to understand if a version they are looking at
	 * is significantly different. Something like semver. If version is = X.Y.Z,
	 * then maybe version changes could be:
	 *
	 *    Changes to X = Adding/removing significant tasks from a procedure
	 *    Changes to Y = ??? Adding/removing/modifying steps or adding/removing
	 *                   insignificant tasks.
	 *    Changes to Z = Fixes and minor clarifications. Changes should not
	 *                   affect what crew actually do.
	 *
	 * @return {string} First 8 characters of git hash for project
	 */
	getGitHash() {

		if (this.gitHash) {
			return this.gitHash;
		}

		if (fs.existsSync(this.program.gitPath)) {
			try {
				this.gitHash = childProcess
					.execSync(`cd ${this.program.projectPath} && git rev-parse HEAD`)
					.toString().trim().slice(0, 8);
			} catch (err) {
				console.error(err);
			}
			return this.gitHash;
		} else {
			return 'NO VERSION (NOT CONFIG MANAGED)';
		}

	}

	/**
	 * Get the date of the HEAD commit
	 *
	 * @return {string} Date in iso8601 format
	 */
	getGitDate() {

		if (this.gitDate) {
			return this.gitDate;
		}

		if (fs.existsSync(this.program.gitPath)) {
			try {
				this.gitDate = childProcess
					.execSync(`cd ${this.program.projectPath} && git log -1 --format=%cd --date=iso8601`)
					.toString().trim();
			} catch (err) {
				console.error(err);
			}
			return this.gitDate;
		} else {
			return 'NO DATE (NOT CONFIG MANAGED)';
		}

	}

	writeFile(filepath) {
		docx.Packer.toBuffer(this.doc).then((buffer) => {
			fs.writeFileSync(filepath, buffer);
		});
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

	getLastModifiedBy() {
		return ''; // FIXME: get this from git repo if available
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

		const handler = new DocxTableHandler(
			task,
			this
		);

		handler.setContainerHeader();

		handler.writeDivisions();

		this.doc.addSection({
			headers: { default: this.genHeader(task) },
			footers: { default: this.genFooter() },
			size: this.getPageSize(),
			margins: this.getPageMargins(),
			children: handler.getSectionChildren()
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
