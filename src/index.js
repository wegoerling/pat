#!/usr/bin/env node

'use strict';
const program = require('commander');
const _ = require('lodash');
const fs = require('fs');
const path = require('path');
const YAML = require('yamljs');

const ver = require('./app/models/version');
const doc = require('./app/models/evaTaskList');
const html = require('./app/helpers/htmlHelper').generators;
let evaTask = require('./app/models/evaTask');

const DEFAULT_FILE = `${__dirname}/main.yml`;
const DEFAULT_HTML = `${__dirname}/main.html`;
const DEFAULT_TEMPLATE = `${__dirname}/templates/htmlHelper-template.thtml`;
program
    .version(ver.currentVersion)
    .option('-i, --input [.yml]', 'specify the yml file to use', DEFAULT_FILE)
    .option('-o, --output [.html]', 'where do you want the result located', DEFAULT_HTML)
    .option('-t, --template [.html]', 'specify a template to generate', DEFAULT_TEMPLATE)
    .parse(process.argv);

if (program.input) {
    try {
        if (getFileExtension(program.input) !== 'yml') {
            throw "\n" + program.input + "\nInvalid file extension\n";
        }
        if (!fs.existsSync(program.input)) {
            throw "\n" + program.input + "\nFile Does Not Exist\n";
        }
    } catch (err) {
        console.log(err);
        process.exit(-1);
    }

    doc.generateEVATasks(program.input, fs, YAML, _, path, evaTask, (evaTaskList) => {
        // console.log(JSON.stringify(evaTaskList));

        html.create(evaTaskList, program.output, program.template);
        const outputFile = program.output.replace('\\', '/');
        console.log(`Completed! your file is located at file://${outputFile}`);
    });
}

function getFileExtension(fileName) {
    let fileExtension = path.extname(fileName || '').split('.');
    return fileExtension[fileExtension.length - 1];
}