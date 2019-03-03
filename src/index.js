#!/usr/bin/env node

'use strict';

const _ = require('lodash');
const fs = require('fs');
const path = require('path');
const YAML = require('yamljs');

const doc = require('./app/models/evaTaskList');
let evaTask = require('./app/models/evaTask');
const app = require('./startup').startup;

(function () {
    const args = app.buildProgramArguments();// startup.js fn buildProgramArguments()
    app.validateArguments(args);// startup.js fn validateArguments()
    const evaTaskList = doc.generateEVATasks(args.input, fs, YAML, _, path, evaTask);//evaTaskList.js fn readEVATaskMainYaml()
    app.generateHtmlChecklist(evaTaskList, args);
})();