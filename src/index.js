#!/usr/bin/env node

'use strict';
const program = require('commander');
let _ = require('lodash');
let path = require('path');

const fs = require('fs');
const ver = require('./app/helpers/version');
const doc = require('./app/helpers/genericEvaTask');
const actor = require('./app/helpers/actor');

const DEFAULT_FILE = `${__dirname}/main.yml`;
const DEFAULT_HTML = `${__dirname}/main.html`;
program
    .version(ver.currentVersion)
    .option('-i, --input [.yml]', 'specify the yml file to use', DEFAULT_FILE)
    .option('-o, --output [.html]', 'where do you want the result located', DEFAULT_HTML)
    .parse(process.argv);

if (program.input) {
    try {      
        if(getFileExtension(program.input) !== 'yml') {
            throw "\n" + program.input + "\nInvalid file extension\n";
        }
        if(!fs.existsSync(program.input)) {
            throw "\n" + program.input + "\nFile Does Not Exist\n";
        }
    }
    catch (err) {
        console.log(err);
        process.exit(1);
    }
     
    const yml = doc.genericEvaTask(program.input);
    console.log(`converted the YAML file [${program.input}]`);

    const actors = actor.actors(yml);
    console.log(`Getting actors array...`);

    //TODO: loop thru tasks and build the output
    let evaTaskList = {
        actors: actors
    };
    _.forEach(_.get(yml, 'tasks'), (task) => {
        let path = _.get(task, 'file');
        if (!!path) {
            let fileTask = doc.genericEvaTask(`${__dirname}/${path}`);

            if (fileTask !== null) {
                evaTaskList[_.split(path, '.')[0]] = fileTask;
            }
        }
    });
    console.log('result', evaTaskList);
}

function getFileExtension(fileName) {
    let fileExtension = path.extname(fileName||'').split('.');
    return fileExtension[fileExtension.length - 1];
}