#!/usr/bin/env node

'use strict';

const program = require('commander');
const _ = require('lodash');
const fs = require('fs');
const path = require('path');
const YAML = require('yamljs');

const doc = require('./app/models/evaTaskList');
let evaTask = require('./app/models/evaTask');
const app = require('./startup').startup;// calls startup.js?
const Procedure = require("./app/model/procedure");

(function () {
    app.buildProgramArguments(program, process.argv);

    // Parse the input file
    let procedure = new Procedure(program.input);

    // Generate the output file
    app.generateHtmlChecklist(procedure, program);// startup.js fn generateHtmlChecklist()
})();
