const docx = require('docx');
const fs = require('fs');


exports.html = function (data, fileLocation) {
	fs.writeFile(`${fileLocation}.html`, `<div style="color: blue;">${JSON.stringify(data)}</div>`, (err) => {
		if (err) {
			return console.log(err);
		}
		console.log('The file was saved!');
	});
};

// https://docx.js.org/#/
exports.doc = function (data, fileLocation) {
	const doc = new docx.Document();
	const paragraph = new docx.Paragraph(JSON.stringify(data));
	doc.addParagraph(paragraph);

	const exp = new docx.Packer();
	exp.toBuffer(doc).then((buffer) => {
		fs.writeFileSync(`${fileLocation}.docx`, buffer);
	});
};