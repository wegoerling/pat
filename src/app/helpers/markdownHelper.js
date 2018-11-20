const showdown = require('showdown');

exports.convert = function (html) {
    return new showdown.Converter().makeHtml(html);
}

// This is for testing. Not too sure how we can incorporate this into application. 
// Running through each line may be a little to excessive.
console.log(new showdown.Converter().makeHtml('### **Yo yo**'));