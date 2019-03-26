/**
 * This file contains the program entry point for the EVA task list generator
 */

'use strict';

const program = require('commander');
const _ = require('lodash');
const fs = require('fs');
const path = require('path');
const YAML = require('yamljs');

const doc = require('./app/models/evaTaskList');
let evaTask = require('./app/models/evaTask');
const app = require('./startup').startup;// calls startup.js?

/**
 * This function is called back after all YAML has been fetched (from files,
 * urls, etc)
 */
function generateHtmlOutput(err, evaTaskList) {
    if(err) {
        console.err(err);
    }

    app.generateHtmlChecklist(evaTaskList, program);
}

/**
 * Program entry point when run from the command line using node
 */
(function () {
    app.buildProgramArguments(program, process.argv);

    doc.createFromFile(program.input, fs, YAML, generateHtmlOutput);
})();
