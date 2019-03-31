"use strict";

const path = require("path");

const YamlValidator = require("./yamlValidator");

const PROCEDURE_SCHEMA_FILE = "./procedureSchema";
const TASK_SCHEMA_FILE = "./taskSchema";

module.exports = class SpacewalkValidator {

    constructor();
    
    validateProcedureSchema(procedureYamlFilePath) {

        let yamlValidator = new YamlValidator();

        let procedureSchema = path.join(__dirname, PROCEDURE_SCHEMA_FILE);
        
        return yamlValidator.validate(procedureYamlFilePath, procedureSchema);

    }

    validateTaskSchema(taskYamlFilePath) {
        
        let yamlValidator = new YamlValidator();

        let taskSchema = path.join(__dirname, TASK_SCHEMA_FILE);
        
        return yamlValidator.validate(procedureYamlFilePath, taskSchema);

    }

}