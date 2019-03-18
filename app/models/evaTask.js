'use strict';

const fs = require('fs');
const YAML = require('yamljs');

exports.create = taskObject;
exports.createFromYaml = taskObjectFromYaml;
exports.createFromFile = taskObjectFromFile;

/**
 * This Constructor creates a evaTask using the specified parameters
 *
 * @param title
 * @param duration
 * @param steps
 * @returns         A new evaTask
 */
function taskObject(title, duration, steps) {
    this.title = title;
    this.duration = duration;
    this.steps = steps;
}

/**
 * This function creates an evaTask from a yaml object
 *
 * @param yaml    A YAML object
 * @returns       An evaTask, or null if an error occurred
 */
function taskObjectFromYaml(yaml) {
    if(!yaml.title) {
        console.log("Input YAML missing title");
        return null;
    }

    if(!yaml.duration) {
        console.log("Input YAML missing duration");
        return null;
    }

    if(!yaml.steps) {
        console.log("Input YAML missing steps");
        return null;
    }

    let et = new taskObject(
        yaml.title,
        yaml.duration,
        yaml.steps);

    return et;
}

/**
 * This function creates an evaTask from a yaml file
 *
 * @param file      The full path to the YAML file
 * @returns         An evaTask, or null if an error occurred
 */
function taskObjectFromFile(file) {
    if(!fs.existsSync(file)) {
        console.log("File doesn't exist: " + file);
        return null;
    }

    //  Load the task YAML
    let yaml = YAML.load(file);
    if(!yaml) {
        console.log("Failed to load YAML file: " + file);
        return null;
    }

    //  Construct an evaTask from the YAML
    let et = taskObjectFromYaml(yaml);
    if(!et) {
        return null;
    }

    return et;
}

/*
function DeserializeEvaTaskWithYaml(taskFile, callback) {
    if (!fs.existsSync(taskFile)) {
        console.log("\n" + taskFile + "\nFile Does Not Exist\n");
        callback([]);
    }

    let yamlFile = YAML.load(taskFile);
    callback(yamlFile.steps, yamlFile.title, yamlFile.duration);
}
*/
