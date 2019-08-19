#!/usr/bin/env node
/**
 * This helper converts markdown to html.
 */

"use strict";

const showdown = require('showdown');
const wiky = require('wiky');

/**
 * Convert markdown to HTML and replace special indicators (like {{CHECKBOX}})
 * with unicode symbols
 *
 * @param markdown Markdown input
 * @returns HTML with unicode characters, or an empty string if
 *          an error occurs
 */
exports.convert = function (markdown) {
    if (markdown === null || (typeof markdown !== 'string')) {
        return "";
    }

    //  Find and replace check marks
    markdown = markdown.replace(/{{CHECK}}/gi, '&#10003;');

    //  Find and replace check boxes
    markdown = markdown.replace(/{{CHECKBOX}}/gi, '&#10063;');
    markdown = markdown.replace(/{{CHECK BOX}}/gi, '&#10063;');

    //TODO: Why does checmkark actually mean checkbox?
    markdown = markdown.replace(/{{CHECKMARK}}/gi, '&#10063;');
    markdown = markdown.replace(/{{CHECK MARK}}/gi, '&#10063;');

    //  Find and replace emphasis markdown?
    if (markdown.includes("'''")) {
        var regex = /([\'])+/gi
        markdown = markdown.replace(regex, '*');
    }
    if (markdown.includes('**')) {
        var regex =  /([\*])+/gi;
        markdown = markdown.replace(regex, '*');
    }

    let text = wiky.toHtml(markdown);

    return new showdown.Converter().makeHtml(text);
}
