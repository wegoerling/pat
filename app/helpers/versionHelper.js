/**
 * This helper knows the current version of the application, as documented
 * in package.json
 */
'use strict';

var pjson = require('../../package.json');

exports.currentVersion = pjson.version;
