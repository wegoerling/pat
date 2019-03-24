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

(function () {
    app.buildProgramArguments(program, process.argv);

    const evaTaskList = doc.createFromFile(program.input, fs, YAML);
    app.generateHtmlChecklist(evaTaskList, program);// startup.js fn generateHtmlChecklist()
})();
