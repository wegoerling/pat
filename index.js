/**
 * This file contains the program entry point for the EVA task list generator
 */

'use strict';

const program = require('commander');
const path = require('path');
const fs = require('fs');
const child = require('child_process');

const app = require('./startup').startup;
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

    //  If the input file doesn't exist, emit an error and quit
    if(!fs.existsSync(program.input)) {
        console.error('Input YAML doesn\'t exist: ' + program.input);
        return;
    }

    //  If this process can't write to the output location, emit an error and quit
    if(fs.existsSync(program.output)) {
        //  Output file exists - Can we write to it?
        try {
            fs.accessSync(program.output, fs.constants.W_OK);
        } catch(err) {
            console.error('Can\'t write to output file: ' + program.output);
            return;
        }
    } else {
        //  Output file doesn't exist - Can we write to the output directory?
        let p = path.parse(program.output);
        let outputDir = p.dir;

        if(outputDir === '') {
            outputDir = '.';
        }

        try {
            fs.accessSync(outputDir, fs.constants.W_OK);
        } catch(err) {
            console.error('Can\'t write to output directory: ' + outputDir);
            return;
        }
    }

    // Parse the input file
    let procedure = new Procedure();
    procedure.populateFromFile(program.input).then( (err) => {

        // Check if an error occurred
        if(err) {
            console.error(err);
            return;
        }

        // Generate the HTML output file
        app.generateHtmlChecklist(procedure, program, function () {
            if(!fs.existsSync(program.output)) {
                console.error('Failed to generate HTML output');
                return;
            }

            console.log('HTML output written to: ' + program.output);

            //  Perform HTML -> DOCX conversion, if requested
            if(program.doc) {

                //  Figure out docx output filename
                let p = path.parse(program.output);
                let ext = p.ext;
                let docfile = program.output.replace(ext, '.docx');

                //  Outsource the conversion to pandoc
                //  WARNING: NEVER USE THIS ON A WEB SERVER!
                let command = `/usr/bin/pandoc -s -o ${docfile} -t html5 -t docx ${program.output}`;
                child.execSync(command);

                if(!fs.existsSync(docfile)) {
                    console.error('Failed to generate DOCX output');
                    return;
                }

                console.log('DOCX output written to: ' + docfile);
            }
        });
    });

})();

