'use strict';

const fs = require('fs');
const path = require('path');
const docx = require('docx');
const getImageFileDimensions = require('image-size');

const TaskWriter = require('./TaskWriter');

module.exports = class DocxTaskWriter extends TaskWriter {

	constructor(task, procedureWriter) {
		super(task, procedureWriter);

		this.taskNumbering = null;
		this.getNumbering();
	}

	addImages(images) {

		const imagesPath = this.procedureWriter.program.imagesPath;
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
	addBlock(blockType, blockLines) {
		const numbering = this.taskNumbering;

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

	getNumbering() {
		this.taskNumbering = {};

		this.taskNumbering.abstract = this.doc.Numbering.createAbstractNumbering();

		for (let i = 0; i < 3; i++) {
			const indents = this.procedureWriter.getIndents(i);
			const level = this.taskNumbering.abstract.createLevel(
				i,
				this.procedureWriter.levelTypes[i],
				`%${i + 1}.`, 'left'
			);
			level.indent({ left: indents.left, hanging: indents.hanging });
			level.leftTabStop(indents.tab);
		}

		this.taskNumbering.concrete = this.doc.Numbering.createConcreteNumbering(
			this.taskNumbering.abstract
		);
	}

	addStepText(stepText, level) {
		const paraOptions = {
			numbering: {
				num: this.taskNumbering.concrete,
				level: level
			}
		};
		if (typeof stepText === 'string') {
			paraOptions.text = this.markupFilter(stepText);
		} else if (Array.isArray(stepText)) {
			paraOptions.children = stepText;
		} else {
			throw new Error('addStepText() stepText must be string or array');
		}

		this.addParagraph(paraOptions);
	}

	addCheckStepText(stepText, level) {
		const paragraphChildren = [
			new docx.TextRun({
				text: 'q', // in Wingdings this is an empty checkbox
				font: {
					name: 'Wingdings'
				}
			}),
			new docx.TextRun(this.markupFilter(` ${stepText}`))
		];
		this.addStepText(paragraphChildren, level);
	}

	addTitleText(step) {
		this.addParagraph({
			children: [
				new docx.TextRun({
					text: step.title.toUpperCase().trim(),
					underline: {
						type: 'single'
					}
				}),
				new docx.TextRun({
					text: ` (${step.duration.format('H:M')})`
				})
			]
		});
	}

};
