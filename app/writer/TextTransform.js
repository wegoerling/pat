'use strict';

function htmlColor(color) {
	return `<span style="font-weight:bold;color:${color.toLowerCase()};">${color}</span>`;
}

var transforms = [
	{
		text: '{{CHECK}}',
		html: '✓',
		docx: '✓'
	},
	{
		text: '{{CHECKBOX}}',
		html: '☐',
		docx: '☐'
	},
	{
		text: '{{CHECKEDBOX}}',
		html: '☑',
		docx: '☑'
	},
	{
		text: '{{LEFT}}',
		html: '←',
		docx: '←'
	},
	{
		text: '{{RIGHT}}',
		html: '→',
		docx: '→'
	},
	{
		text: 'ANCHOR',
		html: '<strong>ANCHOR</strong>',
		docx: 'ANCHOR'
	}
];
var colors = [
	'GREEN',
	'RED',
	'YELLOW',
	'BLACK',
	'BLUE',
	'PURPLE',
	'ORANGE'
];
for (const color of colors) {
	transforms.push({
		text: color,
		html: htmlColor(color),
		docx: color
	});
}

function doTransform(text, xformFormat) {
	if (!text) {
		return [];
	}
	if (!xformFormat) {
		throw new Error('TextWriter#doTransform must have second arg xformFormat');
	}
	let prefix;
	let suffix;
	let transformed;
	const result = [];
	for (const xform of transforms) {
		if (text.indexOf(xform.text) !== -1) {
			prefix = text.substring(0, text.indexOf(xform.text));
			suffix = text.substring(text.indexOf(xform.text) + xform.text.length);
			transformed = xform[xformFormat];
			if (typeof transformed === 'function') {
				transformed = transformed(xform.text);
			}
			break;
		}
	}
	if (prefix || suffix || transformed) {
		result.push(...doTransform(prefix, xformFormat)); // recurse until no more prefixes
		result.push(transformed);
		result.push(...doTransform(suffix, xformFormat)); // recurse until no more suffixes
		return result;
	} else {
		return [text];
	}
}

module.exports = class TextTransform {

	constructor(format) {
		const validFormats = ['html', 'docx'];
		if (validFormats.indexOf(format) === -1) {
			throw new Error('new TextWriter(format) requires format to be in ${validFormats.toString()}');
		}
		this.format = format;
	}

	transform(text) {
		return doTransform(text, this.format);
	}

	/**
	 * Exposed outside module purely for testing
	 * @param {string} color string like "RED"
	 * @return {string} HTML like <span style="font-weight:bold;color:red;">RED</span>
	 */
	htmlColor(color) {
		return htmlColor(color);
	}
};
