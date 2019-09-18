'use strict';

const arrayHelper = require('../helpers/arrayHelper.js');

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

		// Check for the title
		if (stepYaml.title) {
			this.title = this.parseTitle(stepYaml.title);
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

		if (stepYaml.minutes) {
			this.minutes = stepYaml.minutes;
		}

		// Check for checkboxes
		if (stepYaml.checkboxes) {
			this.checkboxes = arrayHelper.parseArray(stepYaml.checkboxes);
		}

		// Check for warnings
		if (stepYaml.warning) {
			this.warnings = arrayHelper.parseArray(stepYaml.warning);
		}

		// Check for cautions
		if (stepYaml.caution) {
			this.cautions = arrayHelper.parseArray(stepYaml.caution);
		}

		// Check for comments
		if (stepYaml.comment) {
			this.comments = arrayHelper.parseArray(stepYaml.comment);
		}

		// Check for notes
		if (stepYaml.note) {
			this.notes = arrayHelper.parseArray(stepYaml.note);
		}

		// Check for substeps
		if (stepYaml.substeps) {
			this.substeps = this.parseSubsteps(stepYaml.substeps);
		}

	}

	/**
     * Return the title. FFIXME: what's the point of this?
     *
     * @param   {*} titleYaml YAML for the title
     * @return  {*} array of substeps
     */
	parseTitle(titleYaml) {
		return titleYaml;
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
		return stepTextYaml;
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
			substep.populateFromYaml(substepsYaml);
			substeps.push(substep);

		// Check for array
		} else if (Array.isArray(substepsYaml)) {
			for (var substepYaml of substepsYaml) {
				const substep = new Step();
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
