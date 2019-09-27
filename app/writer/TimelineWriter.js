'use strict';

// returns a window with a document and an svg root node
const window = require('svgdom');
const document = window.document;
const { SVG, registerWindow } = require('@svgdotjs/svg.js');
const fs = require('fs');
const svg2img = require('svg2img');
// const consoleHelper = require('../helpers/consoleHelper');

// register window and document
registerWindow(window, document);

let xPosition,
	conversionFactor,
	maxWidth,
	maxHeight,
	colWidth,
	sidebarWidth,
	leftTextMargin,
	topTextMargin,
	totalMinutes,
	headerRowY,
	imageHeight,
	headerTextSize,
	textSize,
	tickLengthMajor,
	tickLengthMinor,
	numColumns;

const bottomPadding = 5;

function minutesToPixels(minutes) {
	// If max height were 650 pixels
	// and procedure max length was 7 hours
	// 7 hours * 60 minutes = 420 minutes
	// 420 * 1.5 = 630
	return Math.floor(conversionFactor * minutes);
}

function getConversionFactor(totalMinutes) {
	// totalMinutes * x = maxHeight
	return ((maxHeight - bottomPadding) - headerRowY) / totalMinutes;
}

/*
columnInfo = {
	actor: "EV1",
	header: "EV1 (Joe)",
	tasks: [
		Task {
			title: "Some title",
			actorRolesDict[actor].duration.getTotalMinutes()
			color: NOT YET IMPLEMENTED
		},
		Task {}
	]
}
 */
function addColumn(canvas, columnInfo) {
	let elapsedTime = 0;
	const actor = columnInfo.actor;

	const t = {
		rectWidth: colWidth,
		rectHeight: headerRowY,
		strokeColor: '#000',
		fillColor: 'white',
		textColor: '#000',
		rectX: xPosition,
		rectY: 0,
		fontSize: headerTextSize,
		textX: xPosition + leftTextMargin + Math.floor(colWidth / 2),
		textY: Math.floor((headerRowY - headerTextSize) / 2)
	};

	canvas
		.rect(
			t.rectWidth,
			t.rectHeight
		)
		.stroke(t.strokeColor)
		.fill(t.fillColor)
		.move(
			t.rectX,
			t.rectY
		);

	canvas
		.text(function(add) {
			add.tspan(columnInfo.header.toUpperCase());
		})
		.move(
			t.textX,
			t.textY
		)
		.font({
			fill: t.textColor,
			family: 'Arial',
			size: t.fontSize,
			weight: 'bold',
			anchor: 'middle'
		});

	for (const task of columnInfo.tasks) {

		const duration = task.actorRolesDict[actor].duration;
		const minutes = duration.getTotalMinutes();
		const t = {
			rectWidth: colWidth,
			rectHeight: minutesToPixels(minutes),
			strokeColor: '#000',
			fillColor: task.color || '#F0FFFF',
			textColor: '#000',
			rectX: xPosition,
			rectY: headerRowY + minutesToPixels(elapsedTime),
			fontSize: textSize,
			textX: xPosition + leftTextMargin,
			textY: headerRowY + minutesToPixels(elapsedTime) + topTextMargin
		};

		if (t.rectHeight < 16) {
			t.fontSize = 8;
		} else if (t.rectHeight < 22) {
			t.textY = t.textY - 6; // box getting too short, make more room
		}
		canvas
			.rect(
				t.rectWidth,
				t.rectHeight
			)
			.stroke(t.strokeColor)
			.fill(t.fillColor)
			.move(
				t.rectX,
				t.rectY
			);

		canvas
			.text(function(add) {
				if (t.rectHeight > 10) {
					add.tspan(task.title.toUpperCase());
					add.tspan(` (${duration.format('H:M')})`);
				}
			})
			.move(
				t.textX,
				t.textY
			)
			.font({
				fill: t.textColor,
				family: 'Arial',
				size: t.fontSize
			});

		elapsedTime += minutes;
	}
	xPosition += colWidth;
}

function addTimelineMarkings(canvas, numColumns) {

	// how many half-hour segments to generate
	const halfHours = Math.ceil(totalMinutes / 30);

	for (let i = 0; i <= halfHours; i++) {
		const isHour = (i % 2) === 0;
		// eslint-disable-next-line no-restricted-properties
		const hours = Math.floor(i / 2).toString().padStart(2, '0');
		const minutes = isHour ? ':00' : ':30';
		const timeString = hours + minutes;

		const tickLength = isHour ? tickLengthMajor : tickLengthMinor;

		const y = headerRowY + minutesToPixels(i * 30);
		const rightX = sidebarWidth + (numColumns * colWidth) + tickLength;
		const leftX = sidebarWidth - tickLength;
		const rightEdge = (2 * sidebarWidth) + (numColumns * colWidth);

		canvas.line(leftX, y, rightX, y).stroke({ width: 1, color: 'black' });

		// text for left sidebar
		canvas
			.text(timeString)
			.move(
				5,
				y - 3
			)
			.font({
				fill: 'black',
				family: 'Arial',
				size: 11,
				leading: -1
			});

		// text for right sidebar
		canvas
			.text(timeString)
			.move(
				rightEdge - 28,
				y - 3
			)
			.font({
				fill: 'black',
				family: 'Arial',
				size: 11,
				leading: -1
			});
	}

}

function getTotalActorMinutes(tasks, actor) {
	return tasks.reduce(
		(acc, cur) => {
			return acc + (cur.actorRolesDict[actor].duration.getTotalMinutes() || 0);
		},
		0
	);
}

module.exports = class TimelineWriter {

	/**
	 * Construct TimelineWriter object
	 * @param  {Array}  actorTasks [{actor: "EV1", header: "EV1 (Joe)", tasks: [Task, Task]}, {...}]
	 * @param  {Object} options    {maxHeight: 300, colWidth: 100}
	 */
	constructor(actorTasks, options = {}) {

		// create canvas
		this.canvas = SVG(document.documentElement);

		maxWidth = options.maxWidth || 950;
		maxHeight = options.maxHeight || 660;
		colWidth = options.colWidth || null; // if colWidth not specified, get from on maxWidth
		sidebarWidth = options.sidebarWidth || 50;
		leftTextMargin = options.leftTextMargin || 5;
		topTextMargin = options.topTextMargin || 0;
		headerRowY = options.headerRowY || 25;
		headerTextSize = options.headerTextSize || 16;
		textSize = options.textSize || 12;
		tickLengthMajor = options.tickLengthMajor || 10;
		tickLengthMinor = options.tickLengthMinor || 5;
		// x coordinate of left side of column
		xPosition = sidebarWidth;

		const taskLengths = [];
		const validColumns = [];
		for (const column of actorTasks) {
			if (column.tasks.length > 0) {
				taskLengths.push(getTotalActorMinutes(column.tasks, column.actor));
				validColumns.push(column);
			}
		}
		totalMinutes = Math.max(...taskLengths);
		const roundMinutesUpToHalfHour = Math.ceil(totalMinutes / 30) * 30;
		conversionFactor = getConversionFactor(roundMinutesUpToHalfHour);

		// + 5 gives room for text below line
		imageHeight = headerRowY + minutesToPixels(roundMinutesUpToHalfHour) + bottomPadding;

		numColumns = validColumns.length;
		if (!colWidth) {
			colWidth = Math.floor((maxWidth - (2 * sidebarWidth)) / numColumns);
		}
		addTimelineMarkings(this.canvas, validColumns.length);

		for (const column of validColumns) {
			addColumn(this.canvas, column);
		}
	}

	writeSVG(filename) {
		fs.writeFileSync(filename, this.canvas.svg());
	}

	writePNG(filename, callback) {
		const dimensions = {
			width: (2 * sidebarWidth) + (numColumns * colWidth),
			height: imageHeight,
			preserveAspectRatio: true
		};
		svg2img(
			this.canvas.svg(),
			dimensions,
			function(error, buffer) {
				if (error) {
					throw error;
				}
				fs.writeFileSync(filename, buffer);
				callback(dimensions);
			}
		);
	}
};
