/**
 * This file contains the program entry point for the EVA task list generator
 */

'use strict';

const program = require('commander');

const app = require('./startup').startup;// calls startup.js?
const Procedure = require("./app/model/procedure");

/**
 * This function is called back after all YAML has been fetched (from files,
 * urls, etc)
 */
function generateHtmlOutput(err, evaTaskList) {
    if(err) {
        console.error(err);
    }

    app.generateHtmlChecklist(evaTaskList, program);
}

/**
 * Program entry point when run from the command line using node
 */
(function () {
    app.buildProgramArguments(program, process.argv);

    // Parse the input file
    let procedure = new Procedure();
    procedure.populateFromFile(program.input).then( () => {
        // Generate the output file
        app.generateHtmlChecklist(procedure, program);// startup.js fn generateHtmlChecklist()
    })


})();
