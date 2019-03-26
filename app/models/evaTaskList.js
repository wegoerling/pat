'use strict';

let actor = require('./actor');
let evaTask = require('./evaTask');

const fs = require('fs');
const _ = require('lodash');
const YAML = require('yamljs');
const path = require('path');

exports.create = taskListObject;
exports.createFromYamlString = taskListObjectFromYamlString;
exports.createFromFile = taskListObjectFromFile;

/**
 * This Constructor creates a taskList using the specified parameters
 *
 * @param procedure_name  A human-readable name for this EVA
 * @param actors          A list of actors
 * @param taskFiles       A list of task YAML files
 * @returns               A new evaTaskList
 */
function taskListObject(procedure_name, actors, taskFiles) {
    this.procedure_name = procedure_name;
    this.actors = actors;
    this.taskFiles = taskFiles;
    this.tasks = [];
}

/**
 * This function creates an evaTaskList from a yaml object
 *
 * @param yamlString    A YAML string
 * @returns             An evaTaskList, or null if an error occurred
 */
function taskListObjectFromYamlString(yamlString) {

    try {
        var yaml = YAML.parse(yamlString);
    }
    catch (e) {
        console.log("Failed to parse task list YAML");
        return null;
    }

    if(!yaml.procedure_name) {
        console.log("Input YAML missing procedure_name");
        return null;
    }

    if(!yaml.actors) {
        console.log("Input YAML missing actors");
        return null;
    }

    if(!yaml.tasks) {
        console.log("Input YAML missing tasks");
        return null;
    }

    let etl = new taskListObject(
        yaml.procedure_name,
        yaml.actors.map(a => {
            let obj = new actor.create(a.role, a.name);
            return obj;
        }),
        yaml.tasks
    );

    return etl;
}

/**
 * This function returns a Promise that provides the contents of the specified
 * file as a UTF-8 string.
 *
 * @param file      The file to read
 * @returns         A promise
 */
function readFilePromise(file) {
    return new Promise((resolve, reject) => {
        fs.readFile(file, (err, data) => {
            if(err) {
                reject(err);
            }

            resolve(data.toString('utf8'));
        });
    });
}

/**
 * This function returns a Promise that provides the contents of a fetched URL
 * as a UTF-8 string.
 *
 * @see: https://www.tomas-dvorak.cz/posts/nodejs-request-without-dependencies
 *
 * @param url       The URL to read
 * @returns         A promise
 */
function readUrlPromise(url) {
    const lib = url.startsWith('https') ? require('https') : require('http');

    return new Promise((resolve, reject) => {
        const request = lib.get(url, (response) => {
            const body = [];

            response.on('data', (chunk) => {
                body.push(chunk);
            });

            response.on('end', () => {
                resolve(body.toString('utf8'));
            });
        });

        request.on('error', (err) => {
            reject(err)
        });
    });
}

/**
 * This function creates an evaTaskList from a yaml file
 *
 * @param file      The full path to the YAML file
 * @param fs        An fs object for this function to use
 * @param yj        A yamljs object for this function to use
 * @param callback  A function to be called after all YAML has been fetched
 */
async function taskListObjectFromFile(file, fs, yj, callback) {
    console.log("Reading EVA Task List YAML from file: " + file);

    if(!fs.existsSync(file)) {
        callback('File doesn\'t exist: ' + file, null);
    }

    let yamlString = fs.readFileSync(file, 'utf8');

    //  Construct an evaTaskList from the YAML
    let etl = taskListObjectFromYamlString(yamlString);
    if(!etl) {
        callback('Failed to construct an evaTaskList', null);
    }

    //  Iterate each task and attempt to load the corresponding YAML file
    //_.forEach(etl.taskFiles, function (t) { // this breaks await
    var i;
    for(i=0; i<etl.taskFiles.length; i++) {
        const t = etl.taskFiles[i];

        //  Is this a file?
        if(t.file) {
            const taskFile = `${path.dirname(file)}/${t.file}`;

            //  Wait for the file read to complete
            const yamlString = await readFilePromise(taskFile);

            //  Parse EVA Task YAML
            let et = evaTask.createFromYamlString(yamlString);
            if(et) {
                //  Add this evaTask to the evaTaskList
                etl.tasks.push(et);
            }

        //  Is this a URL?
        } else if(t.url) {
            //  Wait for URL fetch to complete
            const yamlString = await readUrlPromise(t.url);

            //  Parse EVA Task YAML
            let et = await evaTask.createFromYamlString(yamlString);
            if(et) {
                //  Add this evaTask to the evaTaskList
                etl.tasks.push(et);
            }
        }
    }

    //  Tasks have been fetched, send the complete evaTaskList to the callback
    //  function
    callback(null, etl);
}
