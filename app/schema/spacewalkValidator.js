"use strict";

const path = require("path");
const fs = require("fs");

const YAML = require("yamljs");
const Ajv = require("ajv");

const ValidationError = require("./validationError");

const PROCEDURE_SCHEMA_FILE = "./procedureSchema.json";
const TASK_SCHEMA_FILE = "./taskSchema.json";

/**
 * Validates a file against a YAML schema.  
 * Provides helper methods for procedure and task schemas.
 */
module.exports = class SpacewalkValidator {

    constructor() {}
    
    /**
     * Validates a yaml file against the procedure schema
     * 
     * @param {*} procedureYamlFilePath YAML file to validate
     */
    validateProcedureSchemaFile(procedureYamlFilePath) {

        let procedureSchema = path.join(__dirname, PROCEDURE_SCHEMA_FILE);
        
        return this.validateFile(procedureYamlFilePath, procedureSchema);

    }

    /**
     * Validates a yaml string against the procedure schema
     * 
     * @param {*} procedureYamlString YAML string to validate
     */
    validateProcedureSchemaString(procedureYamlString) {
        
        let procedureSchema = path.join(__dirname, PROCEDURE_SCHEMA_FILE);
        
        return this.validateString(procedureYamlString, procedureSchema);

    }

    /**
     * Validates a yaml file against the task schema.
     * 
     * @param {*} taskYamlFilePath YAML file to validate
     */
    validateTaskSchemaFile(taskYamlFilePath) {
        
        let taskSchema = path.join(__dirname, TASK_SCHEMA_FILE);
        
        return this.validateFile(taskYamlFilePath, taskSchema);

    }

    /**
     * Validates a yaml string against the task schema.
     * 
     * @param {*} taskYamlString YAML string to validate
     */
    validateTaskSchemaString(taskYamlString) {
        
        let taskSchema = path.join(__dirname, TASK_SCHEMA_FILE);
        
        return this.validateString(taskYamlString, taskSchema);

    }


    /**
     * Validates a YAML file against the provided schema.
     * 
     * @param {*} yamlFile Yaml file to validate
     * @param {*} jsonSchemaFile Schema file to validate against
     */
    validateFile(yamlFile, jsonSchemaFile) {
        
        // Load the json-schema
        let schema = JSON.parse(fs.readFileSync(jsonSchemaFile));

        // Parse the yaml file into json
        let yaml = YAML.load(yamlFile);

        // Validate the yaml
        let ajv = new Ajv();
        let valid = ajv.validate(schema, yaml);
        if (!valid) {
            throw new ValidationError("YAML Validation Failed", ajv.errors);
        }

        return valid;

    }

    validateString(yamlString, jsonSchemaFile) {
        // Load the json-schema
        let schema = JSON.parse(fs.readFileSync(jsonSchemaFile));

        // Parse the yaml file into json
        let yaml = YAML.parse(yamlString);

        // Validate the yaml
        let ajv = new Ajv();
        let valid = ajv.validate(schema, yaml);
        if (!valid) {
            throw new ValidationError("YAML Validation Failed", ajv.errors);
        }

        return valid;
    }

}
