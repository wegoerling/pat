#!/usr/bin/env node

"use strict"
const nunjucks = require("nunjucks");
const formatter = require("./markdownHelper");
const fs = require("fs");
const path = require('path');
const beautify_html = require('js-beautify').html;

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
    var env = new nunjucks.Environment(new nunjucks.FileSystemLoader('templates'), {autoescape: false});
    env.addFilter('isString', function (obj) {
        return typeof obj == 'string';
    });

    // Add custom nunjucks filter to control ordered lists for each actor.  Adds a variable 
    // called stepNum to each actor which keeps track of the ordered list number for the next step.
    // The value can be reset by passing in a number into the filter.
    env.addFilter('stepIncrement', function(actor, value) {
        
        // Check if actor exists
        if (!actor) {
            console.log("Actor does not exist!");
            return "";
        }
        
        // If the stepNum does not exist, set it to one
        if (!actor.stepNum) {
            actor.stepNum = 1;
        }

        // If the value was passed in, set to the specified value
        if (typeof value !== 'undefined') {
            actor.stepNum = value;
        } 
        
        // Increment the step if no value was sent
        else {
            actor.stepNum = actor.stepNum+1;
        }
        return "";
    });

    // Add custom nunjucks filter to pass the content through the markdown helper
    env.addFilter('markdownFormatter', function(text) {
        return formatter.convert(text);
    });

    // Add custom nunjucks filter for checkboxes
    env.addFilter('checkboxes', function(text) {
        if (text.indexOf('{{CHECKMARK}}') < 0) {
            text = `{{CHECKMARK}} ${text}`;
        }
        return text;
    });

    // Add custom nunjucks filter for images
    env.addFilter('imagePath', function(image) {
        const dir = path.dirname(outputPath);
        let imageName = path.basename(image);
        fs.copyFile(`${inputPath}/${imageName}`, `${dir}/${imageName}`, (err) => {
            if (err) {
                console.log('could not move an image from the source YAML file', err);
            }
        });

        return `${dir}/${imageName}`;
    });

    // Render the html
    var html = env.render(htmlFileTemplate, evaTask);

    // Beautify the html
    var prettyHtml = beautify_html(html, { indent_size: 2, space_in_empty_paren: true, preserve_newlines: false });

    fs.writeFile(outputFilename, prettyHtml, err => {
        if (!!err) {
            console.log("Unable to save file:");
            console.log(err);
        } else {
            callback();
        }
    });
}