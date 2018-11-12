#!/usr/bin/env node

'use strict';
const program = require('commander');
const _ = require('lodash');

const fs = require('fs');
const ver = require('./app/helpers/version');
const doc = require('./app/helpers/genericEvaTask');
const actor = require('./app/helpers/actor');
const path = require('path');
const html = require('./app/helpers/htmlHelper').generators;

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
        procudure_name: yml.procudure_name,
        actors: actors
    };
    _.forEach(_.get(yml, 'tasks'), (task) => {
        const fileStr = _.get(task, 'file');
        let taskFile = `${path.dirname(program.input)}/${fileStr}`;
        console.log('serializing task', `${__dirname}/${taskFile}`);
        if (!!taskFile) {
            let fileTask = doc.genericEvaTask(`${__dirname}/${taskFile}`);

            if (fileTask !== null) {
                evaTaskList[_.split(fileStr, '.')[0]] = fileTask;
            }
        }
    });
    console.log(html.create(evaTaskList, program.output));
    console.log('result', evaTaskList);
}

function getFileExtension(fileName) {
    let fileExtension = path.extname(fileName||'').split('.');
    return fileExtension[fileExtension.length - 1];
}