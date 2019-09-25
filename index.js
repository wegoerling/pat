#!/usr/bin/env node

/**
 * This file contains the program entry point for PAT
 */

'use strict';

const pat = require('./pat.js');

(function() {
	pat.run(process.argv);
}());
