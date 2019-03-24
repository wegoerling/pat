'use strict';
const path = require('path');

const ver = require('./app/helpers/versionHelper');
//const html = require('./app/helpers/htmlHelper').generators;
const fs = require('fs');
const html = require('./app/helpers/nunjucksHelper').generators;

exports.startup = {
    buildProgramArguments: buildProgramArguments,
    validateArguments: validateArguments,
    getFileExtension: getFileExtension,
    generateHtmlChecklist: generateHtmlChecklist,
    postHtmlFileToConsole: postHtmlFileToConsole
}

/**
 * This function configures commander.js for this application's command line
 * arguments, and attemps to parse the arguments passed to this process.
 *
 * @param program   A commander.js object for this function to use
 * @param args      Command line argument array (e.g. process.argv)
 */
function buildProgramArguments(program, args) {
    const DEFAULT_TEMPLATE = `${__dirname}/templates/htmlHelper-template.thtml`;

    program
        .version(ver.currentVersion, '-v, --version')
        .name('eva-checklist')
        .description('Generate the spacewalk EVA checklist from YAML files')
        .option('-i, --input <input.yml>', 'name the YAML file for this EVA')
        .option('-o, --output <.html>', 'name of output HTML file')
        .option('-t, --template <.html>', 'specify a template to use', DEFAULT_TEMPLATE)
        .option('-d, --doc', 'Also generate Word doc output', null)
        .allowUnknownOption();

    //  Commander.js does an unhelpful thing if there are invalid options;
    //  Override the default behavior to do a more helpful thing.
    program.unknownOption = function() {
        //  An invalid option has been received. Print usage and exit.
        program.help();
    }

    try {
        program.parse(args);
    } catch(e) {
        if(e instanceof TypeError) {
            //  Commander.js will annoyingly throw a TypeError if an argument
            //  that requires a parameter is missing its parameter.
            program.help();
        }
    }

    return program;
}

/**
 * This function attempts to validate commander.js arguments for this program.
 * If invalid arguments are discovered, help is printed and the program will
 * exit.
 *
 * @param program       A commander.js object
 */
function validateArguments(program) {

    //  The input file must end in .yml
    if (getFileExtension(program.input) !== 'yml') {
        console.log("\nInvalid input file extension\n");
        program.help();
    }

    //  The output file must end in .html
    if (getFileExtension(program.output) !== 'html') {
        console.log("\nInvalid output file extension\n");
        program.help();
    }
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
    
    // call to htmlHelper.js fn createHtml() then postHtmlFileToConsole
    html.create(evaTaskList, program.template, () => postHtmlFileToConsole(fs, outputFile));
}

/**
 * This function checks whether the output file was created. If it was, a success
 * message is printed, otherwise a failure message is printed.
 *
 * @param fs            A commander.js object for this function to use
 * @param outputFile    The name of the output file to check
 */
function postHtmlFileToConsole(fs, outputFile) {
    if (fs.existsSync(outputFile)) {
        console.log(`Completed! your file is located at file://${outputFile}`);
    } else {
        console.log('The HTML file was not created, please check your YAML file');
        process.exit(-1);
    }
}
