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
    //nunjucks.configure('templates', { autoescape: true });

    // Add custom nunjucks filter to test if variable is a string
    var env = new nunjucks.Environment(new nunjucks.FileSystemLoader('templates'), {autoescape: true});
    env.addFilter('isString', function (obj) {
        return typeof obj == 'string';
    });

    // Add custom nunjucks filter to control ordered lists for each actor.  Adds a variable 
    // called stepNum to each actor which keeps track of the ordered list number for the next step.
    // The value can be reset by passing in a number into the filter.
    env.addFilter('stepIncrement', function(actor, value) {
        if (!actor.stepNum) {
            actor.stepNum = 1;
        }
        if (typeof value !== 'undefined') {
            actor.stepNum = value;
        } else {
            actor.stepNum = actor.stepNum+1;
        }
        return "";
    })

    // Render the html
    var html = env.render(htmlFileTemplate, evaTask);

    fs.writeFile(outputFilename, html, err => {
        if (!!err) {
            console.log("Unable to save file:");
            console.log(err);
        } else {
            callback();
        }
    });
}