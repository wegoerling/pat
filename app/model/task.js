"use strict";

const ConcurrentStep = require("./concurrentStep.js");

module.exports = class Task {

	constructor(taskYaml) {

		// Get the title
		if(!taskYaml.title) {
			throw new Error(`Input YAML task missing title: ${JSON.stringify(taskYaml)}`);
		}
		this.title = taskYaml.title;

		// Get the duration
		if(!taskYaml.duration) {
			throw new Error(`Input YAML task missing duration: ${JSON.stringify(taskYaml)}`);
		}
		this.duration = taskYaml.duration;

		// Get the steps.  ConcurrentSteps class will handle the simo vs actor stuff in the yaml.
		if (!taskYaml.steps) {
			throw new Error(`Input YAML task missing steps: ${JSON.stringify(taskYaml)}`);
		}
		this.concurrentSteps = [];
		for (var concurrentStepYaml of taskYaml.steps) {
			this.concurrentSteps.push(new ConcurrentStep(concurrentStepYaml));
		}

	}

}