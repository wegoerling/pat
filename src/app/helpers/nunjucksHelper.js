#!/usr/bin/env node

"use strict"
const nunjucks = require("nunjucks");
const fs = require("fs");

let inputPath = '';
let outputPath = '';
let outputFilename = '';

exports.generators = {
    create: createHtml,
    params: {
        inputDir: setInputPath,
        outputDir: setOutputPath,
        htmlFile: setOutputFilename
    }
};


function setInputPath(input) {
    inputPath = input;
}

function setOutputPath(output) {
    outputPath = output;
}

function setOutputFilename(filename) {
    outputFilename = filename;
}

/*
 * Create the html from the template file
 */
function createHtml(evaTask, htmlFileTemplate, callback) {
    //For now, since this is an example, ignore the html file template and use a hard-coded one.
    htmlFileTemplate = 'nunjucksTemplate.njk';
    nunjucks.configure('templates', { autoescape: true });
    var html = nunjucks.render(htmlFileTemplate, evaTask);

    fs.writeFile(outputFilename, html, err => {
        if (!!err) {
            console.log("Unable to save file:");
            console.log(err);
        } else {
            callback();
        }
    });
}