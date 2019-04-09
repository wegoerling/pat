/**
 * This file contains the program entry point for the EVA task list generator
 */

'use strict';

const program = require('commander');
const path = require('path');

const app = require('./startup').startup;// calls startup.js?
const Procedure = require("./app/model/procedure");

/**
 * Program entry point when run from the command line using node
 */
(function () {
    app.buildProgramArguments(program, process.argv);

    //  Minimum number of arguments is 3:
    if(process.argv.length < 3) {
        program.help();
    }

    //  If no output file was specified, use a default
    if(!program.output) {
        let p = path.parse(program.input);
        let file_without_path = p.base;
        let ext = p.ext;
        let name = file_without_path.replace(ext, '.html');

        program.output = name;

        console.log('No output filename specified, using default: ' + name);
    }

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
