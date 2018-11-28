#!/usr/bin/env node

"use strict";

const showdown = require('showdown');
const wiky = require('wiky');

exports.convert = function (html) {
    if (!html || html === null || (typeof html !== 'string')) {
        return html;
    }

    html = html.replace(/{{CHECKMARK}}/gi, '&#10063;');
    html = html.replace(/{{CHECK MARK}}/gi, '&#10063;');
    html = html.replace(/{{CHECK}}/gi, '&#10003;');
<<<<<<< HEAD
    if (html.includes("'''")) {
        let regex = /([\'])+/gi;
        // Need to place a space around ** on both sides.
        html = html.replace(regex, '**');
=======
    if (html.includes("'''") || html.includes('**')) {
        let regex = html.includes("'''") ? /([\'])+/gi : /([\*])+/gi;
        html = html.replace(regex, '*');
>>>>>>> c4b1ec0eb004d6d414f393a243e7b4f2f8b860d0
    }
    let text = wiky.toHtml(html);
    return new showdown.Converter().makeHtml(text);
}