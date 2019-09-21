'use strict';

const arrayHelper = require('../helpers/arrayHelper');
const consoleHelper = require('../helpers/consoleHelper');

const Duration = require('./Duration');

module.exports = class Step {

	constructor() {
		// Initiate the vars as empty.
		this.title = '';
		this.text = '';
		this.images = [];
		this.checkboxes = [];
		this.warnings = [];
		this.cautions = [];
		this.comments = [];
		this.notes = [];
		this.substeps = [];
	}

	populateFromYaml(stepYaml) {

		// Check if the step is a simple string
		if (typeof stepYaml === 'string') {
			this.text = stepYaml;
			return;
		}

		this.duration = new Duration(stepYaml.duration);

		// Check for the title
		if (stepYaml.title) {
			this.title = this.parseTitle(stepYaml.title);
			const titleWarnings = [];

			// check if text like "(01:15)" is in the title and warn against it
			const regex = /\([\d\w]{2}:[\d\w]{2}\)/g;
			if (regex.test(this.title)) {
				titleWarnings.push(
					`Should not have "${this.title.match(regex)}" within title, use duration field`
				);
			}

			// check if duration is zero, and recommend adding duration
			if (this.duration.getTotalSeconds() === 0) {
				titleWarnings.push(
					'Should include "duration" field with hours, minutes, and/or seconds field'
				);
				titleWarnings.push(`Example:\n     duration:\n       hours: 1\n       minutes: 15`);
			}

			// warn if necessary
			if (titleWarnings.length > 0) {
				consoleHelper.warn(titleWarnings, `Title "${this.title}"`);
			}
		}

		// Check for the text
		if (stepYaml.step) {
			this.text = this.parseStepText(stepYaml.step);
		}

		// Check for images
		if (stepYaml.images) {
			this.images = arrayHelper.parseArray(stepYaml.images);

			for (let i = 0; i < this.images.length; i++) {
				if (typeof this.images[i] === 'string') {
					this.images[i] = { path: this.images[i] };
				}
				const image = this.images[i];

				if (image.width && !Number.isInteger(image.width) && image.width < 1) {
					throw new Error(`Width should be empty or a positive integery: ${image.path}`);
				}
				if (image.height && !Number.isInteger(image.height) && image.height < 1) {
					throw new Error(`Height should be empty or a positive integery: ${image.path}`);
				}
			}
		}

		// Check for checkboxes
		if (stepYaml.checkboxes) {
			this.checkboxes = arrayHelper.parseArray(stepYaml.checkboxes)
				.map(this.replaceTaskRoles);
		}

		// Check for warnings
		if (stepYaml.warning) {
			this.warnings = arrayHelper.parseArray(stepYaml.warning).map(this.replaceTaskRoles);
		}

		// Check for cautions
		if (stepYaml.caution) {
			this.cautions = arrayHelper.parseArray(stepYaml.caution).map(this.replaceTaskRoles);
		}

		// Check for comments
		if (stepYaml.comment) {
			this.comments = arrayHelper.parseArray(stepYaml.comment).map(this.replaceTaskRoles);
		}

		// Check for notes
		if (stepYaml.note) {
			this.notes = arrayHelper.parseArray(stepYaml.note).map(this.replaceTaskRoles);
		}

		// Check for substeps
		if (stepYaml.substeps) {
			this.substeps = this.parseSubsteps(stepYaml.substeps);
		}

	}

	mapTaskRolesToActor(taskRoles) {
		this.taskRoles = taskRoles;
		const taskRolesMap = {};
		for (const role in taskRoles) {
			taskRolesMap[role] = taskRoles[role].actor;
		}
		this.replaceTaskRoles = function(text) {
			for (const role in taskRolesMap) {
				text = text.replace(`{{role:${role}}}`, taskRolesMap[role]);
			}
			return text;
		};
	}

	/**
	 * Return the title. FFIXME: what's the point of this?
	 *
	 * @param   {*} titleYaml YAML for the title
	 * @return  {*} array of substeps
     */
	parseTitle(titleYaml) {
		// return titleYaml;
		return this.replaceTaskRoles(titleYaml);
	}

	/**
	 * Return the step text, or an empty string if does not exist.
	 *
	 * FIXME: should this be `return stepTextYaml || "";` ???
	 *
	 * @param   {*} stepTextYaml YAML for the step text
	 * @return  {Array} array of substeps
	 */
	parseStepText(stepTextYaml) {
		// return stepTextYaml;
		return this.replaceTaskRoles(stepTextYaml);
	}

	/**
	 * Returns an array of substeps for the step, or an empty array if none are found.
	 *
	 * @param   {*} substepsYaml YAML for the substeps
	 * @return  {Array} array of substeps
	 */
	parseSubsteps(substepsYaml) {

		const substeps = [];

		// Check for string
		if (typeof substepsYaml === 'string') {
			const substep = new Step();
			substep.mapTaskRolesToActor(this.taskRoles);
			substep.populateFromYaml(substepsYaml);
			substeps.push(substep);

		// Check for array
		} else if (Array.isArray(substepsYaml)) {
			for (var substepYaml of substepsYaml) {
				const substep = new Step();
				substep.mapTaskRolesToActor(this.taskRoles);
				substep.populateFromYaml(substepYaml);
				substeps.push(substep);
			}

		// Don't know how to process
		} else {
			throw new Error(`Expected substeps to be string or array.  Instead got: ${JSON.stringify(substepsYaml)}`);
		}

		return substeps;

	}

};
