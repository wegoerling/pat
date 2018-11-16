#!/usr/bin/env node

'use strict';
const program = require('commander');
const _ = require('lodash');
const fs = require('fs');
let yaml = require('js-yaml');
const path = require('path');

const ver = require('./app/models/version');
const doc = require('./app/models/evaTaskList');
const html = require('./app/helpers/htmlHelper').generators;
let evaTask = require('./app/models/evaTask');

const DEFAULT_FILE = `${__dirname}/main.yml`;
const DEFAULT_HTML = `${__dirname}/main.html`;
program
    .version(ver.currentVersion)
    .option('-i, --input [.yml]', 'specify the yml file to use', DEFAULT_FILE)
    .option('-o, --output [.html]', 'where do you want the result located', DEFAULT_HTML)
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

    doc.generateEVATasks(program.input, fs, yaml, _, path, evaTask, (evaTaskList) => {
        console.log(JSON.stringify(evaTaskList));

        html.create(evaTaskList, program.output);
        const outputFile = program.output.replace('\\', '/');
        console.log(`Completed! your file is located at file://${outputFile}`);
    });
}

function getFileExtension(fileName) {
    let fileExtension = path.extname(fileName || '').split('.');
    return fileExtension[fileExtension.length - 1];
}