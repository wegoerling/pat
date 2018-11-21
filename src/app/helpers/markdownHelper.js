const showdown = require('showdown');

exports.convert = function (html) {
    html = html.replace('{{CHECKMARK}}', '&#10063;');
    html = html.replace('{{CHECK MARK}}', '&#10063;');
    html = html.replace('{{CHECK}}', '&#10003;');
    if (html.includes("'''")) {
        html = html.replace(new RegExp(/([\'])+/gi), "**");
    }
    return new showdown.Converter().makeHtml(html);
}