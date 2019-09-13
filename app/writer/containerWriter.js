'use strict';

const docx = require('docx');

module.exports = class ContainerWriter {

	constructor(container) {
		this.container = container;
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

};
