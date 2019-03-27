'use strict';

let actor = require('./actor');
let evaTask = require('./evaTask');

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
 * This function creates an evaTaskList from a yaml file
 *
 * @param file      The full path to the YAML file
 * @param fs        An fs object for this function to use
 * @param yj        A yamljs object for this function to use
 * @returns         An evaTaskList, or null if an error occurred
 */
function taskListObjectFromFile(file, fs, yj) {
    if(!fs.existsSync(file)) {
        console.log("File doesn't exist: " + file);
        return null;
    }

    let yamlString = fs.readFileSync(file, 'utf8');

    //  Construct an evaTaskList from the YAML
    let etl = taskListObjectFromYamlString(yamlString);
    if(!etl) {
        return null;
    }

    //  Iterate each task and attempt to load the corresponding YAML file
    _.forEach(etl.taskFiles, function (t) {
        let taskFile = `${path.dirname(file)}/${t.file}`;
        path.join(path.dirname(file), t.file);
        if(fs.existsSync(taskFile)) {

            let et = evaTask.createFromFile(taskFile, fs, yj);
            if(et) {
                //  Add this evaTask to the evaTaskList
                etl.tasks.push(et);
            }
        }
    });

    return etl;
}
