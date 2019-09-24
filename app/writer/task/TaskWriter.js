'use strict';

const consoleHelper = require('../../helpers/consoleHelper');

module.exports = class TaskWriter {

	constructor(task, procedureWriter) {

		this.task = task;

		this.procedureWriter = procedureWriter;
		this.procedure = procedureWriter.procedure;
		this.doc = procedureWriter.doc;

		this.maxImageWidth = 800; // landscape: 800, portrait probably 640
		this.maxImageHeight = 640; // landscape: 640, portrait can be more like 800

		this.container = null;

		const abstractMethods = [
			'addImages',
			'addParagraph',
			'addBlock',
			'insertStep'
		];

		for (const fn of abstractMethods) {
			if (typeof this[fn] !== 'function') {
				throw new Error(`Abstract method "${fn}" not implemented in class ${this.constructor.name}`);
			}
		}
	}

	setContainer(container) {
		this.container = container;
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

	markupFilter(procedureMarkup) {
		// FIXME: Process the procedure markup from wikitext/markdown-ish to what
		// docx needs. Similar to app/helpers/markdownHelper.js

		if (typeof procedureMarkup !== 'string') {
			console.error(procedureMarkup);
			throw new Error('procedureMarkup must be type string');
		}

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

};
