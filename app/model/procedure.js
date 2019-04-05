"use strict"

const fs = require("fs");
const path = require ("path");
const YAML = require("yamljs");

const Actor = require("./actor.js");
const Task = require("./task.js");

module.exports = class Procedure {

    constructor() {
        this.name = "";
        this.actors = [];
        this.tasks = [];
    }

    /**
     * Populates data, reading in the specified file.
     * 
     * @param {*} fileName The full path to the YAML file
     * 
     * @throws {Error} if an error is encountered parsing the file.
     */
    async populateFromFile(fileName) {

        // Load the YAML File
        if (!fs.existsSync(fileName)) {
            throw new Error("Could not find file " + fileName);
        }
        let procedureYaml = YAML.load(fileName, null, true);

        // Save the procedure Name
        if (!procedureYaml.procedure_name) {
            throw new Error("Input YAML missing procedure_name");
        }
        this.name = procedureYaml.procedure_name;

        // Save the actors
        if (!procedureYaml.actors) {
            throw new Error("Input YAML missing actors");
        }
        
        for (var actorYaml of procedureYaml.actors) {
            this.actors.push(new Actor(actorYaml));
        }

        // Save the tasks
        if (!procedureYaml.tasks) {
            throw new Error("Input YAML missing tasks");
        }
        
        for (var taskYaml of procedureYaml.tasks) {

            // Check that the task is a file
            if (taskYaml.file) {
                
                // Since the task file is in relative path to the procedure file, need to translate it!
                let taskFileName = path.join(path.dirname(fileName), taskYaml.file);

                // Load the yaml file!
                if (!fs.existsSync(taskFileName)) {
                    throw new Error("Could not find task file " + taskFileName);
                }
                let loadedTaskYaml = YAML.load(taskFileName, null, true);

                // Save the task!
                this.tasks.push(new Task(loadedTaskYaml));

            } 

            //  Is this a URL?
            else if(taskYaml.url) {

                //  Wait for URL fetch to complete
                // console.log('Reading task URL: ' + t.url);
                let yamlString = await readUrlPromise(taskYaml.url);

                //  Parse the Task YAML
                let loadedTaskYaml = YAML.parse(yamlString);
                
                // Save the task!
                this.tasks.push(new Task(loadedTaskYaml));
            }
            
            // Task encountered that do not know how to handle!
            else {
                throw new Error("Unknown task type found in procedure: " + JSON.stringify(taskYaml));
            }

        }

    }

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