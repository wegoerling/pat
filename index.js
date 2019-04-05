/**
 * This file contains the program entry point for the EVA task list generator
 */

'use strict';

const program = require('commander');

const app = require('./startup').startup;// calls startup.js?
const Procedure = require("./app/model/procedure");

/**
 * Program entry point when run from the command line using node
 */
(function () {
    app.buildProgramArguments(program, process.argv);

    // Parse the input file
    let procedure = new Procedure();
    procedure.populateFromFile(program.input).then( (err) => {

        // Check if an error occurred
        if(err) {
            console.error(err);
            return;
        }

        // Generate the output file
        app.generateHtmlChecklist(procedure, program);// startup.js fn generateHtmlChecklist()
    })


})();
