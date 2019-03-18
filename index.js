#!/usr/bin/env node

'use strict';

const _ = require('lodash');
const fs = require('fs');
const path = require('path');
const YAML = require('yamljs');

const doc = require('./app/models/evaTaskList');
let evaTask = require('./app/models/evaTask');
const app = require('./startup').startup;// calls startup.js?

(function () {
    const args = app.buildProgramArguments();// app is alias to startup.js fn buildProgramArguments() returns cli arguments
    app.validateArguments(args);// startup.js fn validateArguments()
    const evaTaskList = doc.createFromFile(args.input);
    app.generateHtmlChecklist(evaTaskList, args);// startup.js fn generateHtmlChecklist()
})();
