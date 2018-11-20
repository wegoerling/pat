const showdown = require('showdown');
var wiky = require('wiky');
let _ = require('lodash');

exports.convert = function (html) {
    html = html.replace('{{CHECKMARK}}', '&#10063;');
    html = html.replace('{{CHECK MARK}}', '&#10063;');
    html = html.replace('{{CHECK}}', '&#10003;');
    if (html.includes("'''")) {
        let regex = /[^A-Za-z0-9]+[\']+[\W]*/gi;
        html = html.replace(regex, '**');
    }
    let text = wiky.toHtml(html);
    return new showdown.Converter().makeHtml(html);
}