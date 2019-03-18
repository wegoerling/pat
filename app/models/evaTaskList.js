'use strict';

let actor = require('./actor');
let evaTask = require('./evaTask');

const fs = require('fs');
const _ = require('lodash');
const YAML = require('yamljs');
const path = require('path');

exports.create = taskListObject;
exports.createFromYaml = taskListObjectFromYaml;
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
 * @param yaml      A YAML object
 * @returns         An evaTaskList, or null if an error occurred
 */
function taskListObjectFromYaml(yaml) {
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
 * @returns         An evaTaskList, or null if an error occurred
 */
function taskListObjectFromFile(file) {
    if(!fs.existsSync(file)) {
        console.log("File doesn't exist: " + file);
        return null;
    }

    //  Load the main YAML
    let yaml = YAML.load(file);
    if(!yaml) {
        console.log("Failed to load YAML file: " + file);
        return null;
    }

    //  Construct an evaTaskList from the YAML
    let etl = taskListObjectFromYaml(yaml);
    if(!etl) {
        return null;
    }

    //  Iterate each task and attempt to load the corresponding YAML file
    _.forEach(etl.taskFiles, function (t) {
        let taskFile = `${path.dirname(file)}/${t.file}`;
        if(fs.existsSync(taskFile)) {

            //  Try to load the task YAML
            let taskYaml = YAML.load(taskFile);
            if(taskYaml) {

                //  Try to construct an evaTask from the YAML
                let et = evaTask.createFromYaml(taskYaml);
                if(et) {
                    //  Add this evaTask to the evaTaskList
                    etl.tasks.push(et);
                }
            }
        }
    });

    return etl;
}
