'use strict';

const docx = require('docx');
const path = require('path');
const fs = require('fs');

const DocxProcedureWriter = require('./DocxProcedureWriter');
const EvaDocxTaskWriter = require('../task/EvaDocxTaskWriter');
const consoleHelper = require('../../helpers/consoleHelper');
const TimelineWriter = require('../TimelineWriter');

module.exports = class EvaDocxProcedureWriter extends DocxProcedureWriter {

	constructor(program, procedure) {
		super(program, procedure);
	}

	getRightTabPosition() {
		return 14400;
	}

	getPageSize() {
		return {
			width: 12240, // width and height transposed in LANDSCAPE
			height: 15840,
			orientation: docx.PageOrientation.LANDSCAPE
		};
	}

	getPageMargins() {
		return {
			top: 720,
			right: 720,
			bottom: 720,
			left: 720
		};
	}

	renderIntro(callback) {
		const allActors = this.procedure.getAllActorsDefinedInColumns();
		const actorTasks = [];

		for (const actor of allActors) {
			const tasks = this.procedure.getTasksWithActorInLeadRole(actor);
			if (tasks.length > 0) {
				actorTasks.push({
					actor: actor,
					header: actor, // FIXME: column display text if single actor?
					tasks: tasks
				});
			}
		}

		const timeline = new TimelineWriter(actorTasks);
		const pngPath = path.join(
			this.program.outputPath,
			`${this.procedure.filename}.summary.timeline.png`
		);

		timeline.writePNG(pngPath, (imageDimensions) => {
			const image = docx.Media.addImage(
				this.doc,
				fs.readFileSync(pngPath),
				imageDimensions.width,
				imageDimensions.height
			);
			this.doc.addSection({
				headers: { default: this.genHeader(`${this.procedure.name} - Summary Timeline`) },
				footers: { default: this.genFooter() },
				size: this.getPageSize(),
				margins: this.getPageMargins(),
				children: [new docx.Paragraph(image)]
			});
			callback();
		});

		timeline.writeSVG(path.join(
			this.program.outputPath,
			`${this.procedure.filename}.summary.timeline.svg`
		));

	}

	renderTask(task) {

		const handler = new EvaDocxTaskWriter(
			task,
			this
		);

		const sectionChildren = [];
		sectionChildren.push(
			handler.setTaskTableHeader()
		);
		sectionChildren.push(
			...handler.writeDivisions()
		);

		this.doc.addSection({
			headers: { default: this.genTaskHeader(task) },
			footers: { default: this.genFooter() },
			size: this.getPageSize(),
			margins: this.getPageMargins(),
			children: [new docx.Table({
				rows: sectionChildren,
				width: {
					size: 100,
					type: docx.WidthType.PERCENTAGE
				}
				// columnWidths
				// margins: { marginUnitType, top, bottom, right, left }
				// float
				// layout
			})]
		});
		consoleHelper.success(`Added section to EVA DOCX for task ${task.title}`);
	}

};
