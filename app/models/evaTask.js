'use strict';

const YAML = require('yamljs');

exports.create = taskObject;
exports.createFromYamlString = taskObjectFromYamlString;
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
 * @param yamlString    A YAML string
 * @returns             An evaTask, or null if an error occurred
 */
function taskObjectFromYamlString(yamlString) {

    try {
        var yaml = YAML.parse(yamlString);
    }
    catch (e) {
        console.log("Failed to parse task YAML");
        return null;
    }

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
 * @param fs        An fs object for this function to use
 * @param yj        A yamljs object for this function to use
 * @returns         An evaTask, or null if an error occurred
 */
function taskObjectFromFile(file, fs, yj) {
    if(!fs.existsSync(file)) {
        console.log("File doesn't exist: " + file);
        return null;
    }

    let yamlString = fs.readFileSync(file, 'utf8');

    //  Construct an evaTask from the YAML
    let et = taskObjectFromYamlString(yamlString);
    if(!et) {
        return null;
    }

    return et;
}

