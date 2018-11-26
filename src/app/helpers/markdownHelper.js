#!/usr/bin/env node

"use strict";

const showdown = require('showdown');
var wiky = require('wiky');
let _ = require('lodash');

exports.convert = function (html) {
    if (!html || html === null || (typeof html !== 'string')) {
        return html;
    }

    html = html.replace(/{{CHECKMARK}}/gi, '&#10063;');
    html = html.replace(/{{CHECK MARK}}/gi, '&#10063;');
    html = html.replace(/{{CHECK}}/gi, '&#10003;');
    if (html.includes("'''")) {
        console.log(html);
        let regex = /([\'])+/gi;
        // Need to place a space around ** on both sides.
        html = html.replace(regex, '**');
    }
    let text = wiky.toHtml(html);
    return new showdown.Converter().makeHtml(text);
}