'use strict';

const fs = require('fs');
const path = require('path');
const docx = require('docx');
const getImageFileDimensions = require('image-size');
const consoleHelper = require('../helpers/consoleHelper');

module.exports = class DocxHandler {

	constructor(docWrapper) {
		this.docWrapper = docWrapper;
		this.procedure = docWrapper.procedure;
		this.doc = docWrapper.doc;

		this.docWrapper.taskNumbering = null;
		this.getNumbering();

		this.maxImageWidth = 800; // landscape: 800, portrait probably 640
		this.maxImageHeight = 640; // landscape: 640, portrait can be more like 800
	}

	/*
	FIXME: thought this would be necessary but it doesn't seem to be. Keeping
	it for now while things are in flux

	getContainerType() {
		if (this.container instanceof TableCell) {
			return 'tablecell';
		} else if (this.container instanceof SectionContainer) {
			return 'sectioncontainer';
		} else {
			const containerJson = JSON.stringify(this.container, null, 4);
			throw new Error(`Unknown container type: ${containerJson}`);
		}
	}
	*/

	setContainer() {
		throw new Error('Abstract function not implemented');
	}

	fitImageInBox(img, box = {}) {

		if (!box.width) {
			box.width = this.maxImageWidth;
		}
		if (!box.height) {
			box.height = this.maxImageHeight;
		}

		if (img.width <= box.width && img.height <= box.height) {
			return img; // already fits, no change
		}

		const oriWidth = img.width,
			oriHeight = img.height;

		if (img.width > box.width) {
			img.width = box.width;
			img.height = Math.round(img.height * (box.width / oriWidth));
		}

		if (img.height > box.height) {
			img.height = box.height;
			img.width = Math.round(oriWidth * (box.height / oriHeight));
		}

		return img;
	}

	scaleImage(sourceFileDims, desiredImage) {
		const widthToHeightRatio = sourceFileDims.width / sourceFileDims.height;

		const imgWarnings = [];
		imgWarnings.check = function(dim, requested, srcSize) {
			if (requested > srcSize) {
				this.push(`Desired ${dim} ${requested}px is greater than file ${dim} ${srcSize}px`);
			}
		};
		imgWarnings.flush = function(imgPath) {
			if (this.length > 0) {
				consoleHelper.warn(
					[`Possibly undesirable dimensions for ${imgPath}`].concat(this), // warnings array
					'Image quality warning',
					true // add a newline above and below warning
				);
			}
		};

		imgWarnings.check('width', desiredImage.width, sourceFileDims.width);
		imgWarnings.check('height', desiredImage.height, sourceFileDims.height);

		// if both dimensions are desired, just return them (no need to scale)
		if (Number.isInteger(desiredImage.width) && Number.isInteger(desiredImage.height)) {
			// FIXME: add check for desiredImage ratio being significantly
			// different from widthToHeightRatio, and notify user that image may
			// be distorted. Alternatively: just don't allow specifying W and H.
			imgWarnings.flush(desiredImage.path);
			return desiredImage;
		}

		let scaledDims = {};

		// if just desired width is an integer (first check shows both aren't)
		if (Number.isInteger(desiredImage.width)) {
			scaledDims.width = desiredImage.width;
			scaledDims.height = Math.floor(scaledDims.width / widthToHeightRatio);

		// if just desired height is an integer (first check shows both aren't)
		} else if (Number.isInteger(desiredImage.height)) {
			scaledDims.height = desiredImage.height;
			scaledDims.width = Math.floor(scaledDims.height * widthToHeightRatio);

		// neither are valid integers. Keep image at source file's dimensions,
		// unless they are too big. Then scale image to fit.
		} else {
			scaledDims = this.fitImageInBox(sourceFileDims);
		}

		imgWarnings.flush(desiredImage.path);
		return scaledDims;
	}

	addImages(images) {

		const imagesPath = this.docWrapper.program.imagesPath;
		for (const imageMeta of images) {

			const imagePath = path.join(imagesPath, imageMeta.path);
			const imageSize = this.scaleImage(
				getImageFileDimensions(imagePath),
				imageMeta
			);

			const image = docx.Media.addImage(
				this.doc,
				fs.readFileSync(imagePath),
				imageSize.width,
				imageSize.height
			);

			this.container.add(new docx.Paragraph(image));
		}

	}

	addParagraph(params = {}) {
		if (!params.text) {
			params.text = '';
		}
		if (!params.style) {
			params.style = 'normal';
		}

		this.container.add(new docx.Paragraph(params));
	}

	// taskCell
	addBlock(blockType, blockLines, numbering) {
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
				text: this.markupFilter(line),
				numbering: {
					num: numbering.concrete,
					level: 0
				}

			}));
		}

		this.container.add(blockTable);
	}

	markupFilter(procedureMarkup) {
		// FIXME: Process the procedure markup from wikitext/markdown-ish to what
		// docx needs. Similar to app/helpers/markdownHelper.js

		procedureMarkup = procedureMarkup
			.replace(/\{\{CHECK\}\}/g, '✓')
			.replace(/\{\{CHECKBOX\}\}/g, '☐')
			.replace(/\{\{CHECKEDBOX\}\}/g, '☑')
			.replace(/\{\{LEFT\}\}/g, '←')
			.replace(/\{\{RIGHT\}\}/g, '→')
			.replace(/\{\{CONNECT\}\}/g, '→|←')
			.replace(/\{\{DISCONNECT\}\}/g, '←|→');

		return procedureMarkup;
	}

	getNumbering() {
		this.docWrapper.taskNumbering = {};

		// const numbering = new docx.Numbering();
		// const abstractNum = numbering.createAbstractNumbering();
		// const abstractNum = doc.Numbering.createAbstractNumbering();
		this.docWrapper.taskNumbering.abstract = this.doc.Numbering.createAbstractNumbering();

		for (let i = 0; i < 3; i++) {
			// var stepText = getLongStepString(i);
			var indents = this.docWrapper.getIndents(i);
			this.docWrapper.levels[i] = this.docWrapper.taskNumbering.abstract.createLevel(
				i, this.docWrapper.levelTypes[i], `%${i + 1}.`, 'left'
			);
			this.docWrapper.levels[i].indent({ left: indents.left, hanging: indents.hanging });
			this.docWrapper.levels[i].leftTabStop(indents.tab);
		}

		this.docWrapper.taskNumbering.concrete = this.doc.Numbering.createConcreteNumbering(
			this.docWrapper.taskNumbering.abstract
		);
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

		for (const division of divisions) {
			this.writeDivision(division);
		}
	}

	formatDuration(step) {
		if (step.seconds || step.second) {
			throw new Error('"seconds" duration format not supported yet. Use "minutes".');
		}
		if (step.hours || step.hour) {
			throw new Error('"hours" duration format not supported yet. Use "minutes".');
		}
		if (step.duration) {
			throw new Error('"duration" is not a supported time format. Use "minutes".');
		}
		if (!step.minute && !step.minutes) {
			const warningMsg = ['should include "minutes" field'];
			const regex = /\([\d\w]{2}:[\d\w]{2}\)/g;
			if (regex.test(step.title)) {
				warningMsg.push(`should not have "${step.title.match(regex)}" within title`);
			}
			consoleHelper.warn(warningMsg, `Title "${step.title}"`);

			return 'XX:YY';
		}

		const totalMinutes = step.minutes || step.minute;
		const hours = Math.floor(totalMinutes / 60); // eslint-disable-line no-unused-vars
		const minutes = totalMinutes % 60; // eslint-disable-line no-unused-vars

		return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
	}

	insertStep(step, level = 0) {

		// writeStep:
		// step.text via markdownformatter
		// loop over step.checkboxes via markdownformatter

		if (step.images) {
			this.addImages(step.images);
		}

		if (step.title) {
			this.addParagraph({
				children: [
					new docx.TextRun({
						text: step.title.toUpperCase().trim(),
						underline: {
							type: 'single'
						}
					}),
					new docx.TextRun({
						text: ` (${this.formatDuration(step)})`
					})
				]
			});
		}

		if (step.warnings.length) {
			this.addBlock('warning', step.warnings, this.docWrapper.taskNumbering);
		}
		if (step.cautions.length) {
			this.addBlock('caution', step.cautions, this.docWrapper.taskNumbering);
		}
		if (step.notes.length) {
			this.addBlock('note', step.notes, this.docWrapper.taskNumbering);
		}
		if (step.comments.length) {
			this.addBlock('comment', step.comments, this.docWrapper.taskNumbering);
		}

		if (step.text) {
			this.addParagraph({
				text: this.markupFilter(step.text),
				numbering: {
					num: this.docWrapper.taskNumbering.concrete,
					level: level
				}
			});
		}

		if (step.substeps.length) {
			for (const substep of step.substeps) {
				this.insertStep(substep, level + 1);
			}
		}

		if (step.checkboxes.length) {
			for (const checkstep of step.checkboxes) {
				this.addParagraph({
					text: this.markupFilter(`☐ ${checkstep}`),
					numbering: {
						num: this.docWrapper.taskNumbering.concrete,
						level: level + 1
					}
				});
			}
		}

	}

};
