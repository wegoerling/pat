'use strict';

const fs = require('fs');
const path = require('path');

const getImageFileDimensions = require('image-size');
const nunjucks = require('nunjucks');
const nunjucksEnvironment = new nunjucks.Environment(
	new nunjucks.FileSystemLoader(path.join(__dirname, '../../view')),
	{ autoescape: false }
);

const consoleHelper = require('../../helpers/consoleHelper');
const TaskWriter = require('./TaskWriter');

module.exports = class HtmlTaskWriter extends TaskWriter {

	constructor(task, procedureWriter) {
		super(task, procedureWriter);
		// this.taskNumbering = null;
		// this.getNumbering();
	}

	addImages(images) {

		const imageHtmlArray = [];
		const imagesPath = this.procedureWriter.program.imagesPath;
		const buildPath = this.procedureWriter.program.outputPath;
		for (const imageMeta of images) {

			const imageSrcPath = path.join(imagesPath, imageMeta.path);
			const imageBuildPath = path.join(buildPath, imageMeta.path);
			const imageSize = this.scaleImage(
				getImageFileDimensions(imageSrcPath),
				imageMeta
			);

			// copy image from ./images to ./build
			// Do this asynchronously...no need to wait
			// Also, super lazy: if the image already exists don't copy it again
			if (!fs.existsSync(imageBuildPath)) {
				fs.copyFile(imageSrcPath, imageBuildPath, (err) => {
					if (err) {
						// for now don't throw errors on this. Allow build to finish
						consoleHelper.warn(err);
					}
					consoleHelper.success(`Image ${imageMeta.path} transferred to build directory`);
				});
			}

			const image = nunjucksEnvironment.render('image.html', {
				path: imageMeta.path,
				width: imageSize.width,
				height: imageSize.height
			});

			imageHtmlArray.push(image);
		}

		return imageHtmlArray;
	}

	addParagraph(params = {}) {
		if (!params.text) {
			params.text = '';
		}
		return `<p>${params.text}</p>`;
	}

	addBlock(blockType, blockLines) {

		const blockTable = nunjucksEnvironment.render('block-table.html', {
			blockType: blockType,
			blockLines: blockLines.map(this.markupFilter)
		});

		return blockTable;
	}

	addStepText(stepText, level) {
		// added class li-level-${level} really just as a way to remind that
		// some handling of this will be necessary
		return `<li class="li-level-${level}">${this.markupFilter(stepText)}</li>`;
	}

	addCheckStepText(stepText, level) {
		return this.addStepText(`☐ ${stepText}`, level);
	}

	addTitleText(step) {
		const subtaskTitle = nunjucksEnvironment.render('subtask-title.html', {
			title: step.title.toUpperCase().trim(),
			duration: step.duration.format('H:M')
		});

		return subtaskTitle;
	}

	preInsertSteps(level) {
		let start;
		if (!level || level === 0) {
			start = `start="${this.stepNumber}"`;
		} else {
			start = '';
		}
		return `<ol ${start}>`;
	}

	postInsertSteps(level) { // eslint-disable-line no-unused-vars
		return '</ol>';
	}

};
