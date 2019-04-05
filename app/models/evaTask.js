'use strict';

const YAML = require('yamljs');
const wait = require('wait.for');

exports.create = taskObject;
exports.createFromYamlString = taskObjectFromYamlString;
exports.createFromFile = taskObjectFromFile;
exports.createFromUrl = taskObjectFromUrl;

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
    console.log("Reading EVA Task YAML from file: " + file);

    if(!fs.existsSync(file)) {
        console.log("File doesn't exist: " + file);
        return null;
    }
    // console.log(file)
    let yamlString = fs.readFileSync(file, 'utf8');
    // console.log(yamlString)
    //  Construct an evaTask from the YAML
    let et = taskObjectFromYamlString(yamlString);
    if(!et) {
        return null;
    }

    return et;
}

function doRequest(url, https, callback) {
    return new Promise((resolve, reject) => {
        const request = https.get(url, (response) => {
            const body = [];

            response.on('data', (chunk) => {
                console.log("data");
                body.push(chunk);
            });

            response.on('end', () => {
                console.log("end");
                resolve(body.toString('utf8'));
            });
        });

        request.on('error', (err) => reject(err));
    });
}

/**
 * This function creates an evaTask from a URL pointing to a YAML file
 *
 * @param url       The url to load
 * @param https     An http object for this function to use
 * @param yj        A yamljs object for this function to use
 * @returns         An evaTask, or null if an error occurred
 */
function taskObjectFromUrl(url, https, yj) {
    console.log("Reading EVA Task YAML from url: " + url);

    return new Promise((resolve, reject) => {
        const request = https.get(url, (response) => {
            const body = [];

            response.on('data', (chunk) => {
                console.log("data");
                body.push(chunk);
            });

            response.on('end', () => {
                console.log("end");
                let et = taskObjectFromYamlString(body.toString('utf8'));
                resolve(et);
            });
        });

        request.on('error', (err) => reject(err));
    });
    /*
    //  Wait for the HTTPS response
    getPromise.then(function(value) {
        console.log('resolved');
        return value;
    });

    //  Check for errors
    getPromise.catch(function(value) {
        console.log('rejected');
        console.log(value);
    });
    */

}


