const showdown = require('showdown');
var wiky = require('wiky');

exports.convert = function (html) {
    html = html.replace('{{CHECKMARK}}', '&#10063;');
    html = html.replace('{{CHECK MARK}}', '&#10063;');
    html = html.replace('{{CHECK}}', '&#10003;');
    let text = wiky.toHtml(html);
    return new showdown.Converter().makeHtml(html);
}

// This is for testing. Not too sure how we can incorporate this into application. 
// Running through each line may be a little to excessive.
console.log(new showdown.Converter().makeHtml('### **Yo yo**'));