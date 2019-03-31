"use strict";

const fs = require("fs");

const YAML = require("yamljs");
const Ajv = require("ajv");

const ValidationError = require("./validationError");

/**
 * Validates a file against a YAML schema
 */
module.exports = class YamlValidator {

    constructor() {}

    /**
     * Validates a YAML file against the provided schema.
     * 
     * @param {*} yamlFile 
     * @param {*} jsonSchemaFile 
     */
    validate(yamlFile, jsonSchemaFile) {
        
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

}