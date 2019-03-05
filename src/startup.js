#!/usr/bin/env node

'use strict';
const program = require('commander');
const fs = require('fs');
const path = require('path');

const ver = require('./app/helpers/versionHelper');
const html = require('./app/helpers/htmlHelper').generators;

exports.startup = {
    buildProgramArguments: buildProgramArguments,
    additionalHelpArgument: additionalHelpArgument,
    validateArguments: validateArguments,
    getFileExtension: getFileExtension,
    generateHtmlChecklist: generateHtmlChecklist,
    postHtmlFileToConsole: postHtmlFileToConsole
}


function buildProgramArguments() {
    const DEFAULT_TEMPLATE = `${__dirname}/templates/htmlHelper-template.thtml`;

    program
        .version(ver.currentVersion, '-v, --version')
        .name('eva-checklist')
        .description('Generate the spacewalk EVA checklist from YAML files')
        .option('-i, --input [.yml]', 'specify the yml file to use')
        .option('-o, --output [.html]', 'where do you want the result located')
        .option('-t, --template [.html]', 'specify a template to generate', DEFAULT_TEMPLATE)
        .action(validateArguments);

    program.on('--help', additionalHelpArgument);

    program.parse(process.argv);
    return program;
}

function validateArguments(program) {
    try {

        if (!program.input) {
            throw new SyntaxError(`\nmissing --input or -i parameter: got: [${program.input}]\n`);
        }

        if (getFileExtension(program.input) !== 'yml') {
            throw new SyntaxError("\n" + program.input + "\nInvalid input file extension\n");
        }
        if (!fs.existsSync(program.input)) {
            throw new SyntaxError("\n" + program.input + "\nFile Does Not Exist\n");
        }
        if (!fs.existsSync(program.template)) {
            throw new SyntaxError("\n" + program.template + "\nTemplate file does not Exist\n");
        }

        if (!program.output || program.output === null) {
            throw new SyntaxError(`missing --output or -o parameter: got: [${program.output}]`);
        }

        if (getFileExtension(program.output) !== 'html') {
            throw new SyntaxError("\n" + program.output + "\nInvalid output file extension\n");
        }

        const dir = path.dirname(program.output);
        if (!fs.existsSync(dir)) {
            throw new SyntaxError(`directory has not been created: ${dir}`);
        }
    } catch (err) {
        console.log(err.message);
        process.exit(-1);
    }
}

function additionalHelpArgument() {
    const textOutput = `\n\n
Examples:
$ eva-checklist --input file.yml --output file.html
$ eva-checklist -i file.yml -o file.html\n`;
    console.log(textOutput);
}

function getFileExtension(fileName) {
    let fileExtension = path.extname(fileName || '').split('.');
    return fileExtension[fileExtension.length - 1];
}

function generateHtmlChecklist(evaTaskList, program) {
    let outputFile = path.resolve(program.output);

    html.params.inputDir(path.resolve(path.dirname(program.input)));
    html.params.outputDir(path.resolve(path.dirname(program.output)));
    html.params.htmlFile(outputFile);

    html.create(evaTaskList, program.template, () => postHtmlFileToConsole(outputFile));// call to htmlHelper.js fn createHtml() then postHtmlFileToConsole
}

function postHtmlFileToConsole(outputFile) {
    if (fs.existsSync(outputFile)) {
        console.log(`Completed! your file is located at file://${outputFile}`);
    } else {
        console.log('The HTML file was not created, please check your YAML file');
        process.exit(-1);
    }
}