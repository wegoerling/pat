"use strict";

module.exports = class Step {

    constructor(stepYaml) {

        // Initiate the vars as empty.
        this.title = "";
        this.text = "";
        this.images = [];
        this.checkboxes = [];
        this.warnings = [];
        this.cautions = [];
        this.comments = [];
        this.notes = [];
        this.substeps = [];

        // Check if the step is a simple string
        if(typeof stepYaml === "string") {
            this.text = stepYaml;
            return;
        }

        // Check for the title
        if (stepYaml.title) {
            this.title = stepYaml.title;
        }

        // Check for the text
        if (stepYaml.step) {
            this.text = stepYaml.step;
        }

        // Check for images
        if (stepYaml.images) {

            // Check for string
            if (typeof stepYaml.images === "string") {
                this.images.push(stepYaml.images);
            }

            // Check for array
            else if (Array.isArray(stepYaml.images)) {
                for (var imageYaml of stepYaml.images) {
                    this.images.push(imageYaml);
                }
            }

            // Don't know how to process
            else {
                throw new Error("Expected images to be string or array.  Instead got: " + JSON.stringify(stepYaml.images));
            }
        }

        // Check for checkboxes
        if (stepYaml.checkboxes) {

            // Check for string
            if (typeof stepYaml.checkboxes === "string") {
                this.checkboxes.push(stepYaml.checkboxes);
            }

            // Check for array
            else if (Array.isArray(stepYaml.checkboxes)) {
                for (var checkboxYaml of stepYaml.checkboxes) {
                    this.checkboxes.push(checkboxYaml);
                }
            }

            // Don't know how to process
            else {
                throw new Error("Expected checkboxes to be string or array.  Instead got: " + JSON.stringify(stepYaml.checkboxes));
            }
        }

        // Check for warnings
        if (stepYaml.warning) {

            // Check for string
            if (typeof stepYaml.warning === "string") {
                this.warnings.push(stepYaml.warning);
            }

            // Check for array
            else if (Array.isArray(stepYaml.warning)) {
                for (var warningYaml of stepYaml.warning) {
                    this.warnings.push(warningYaml);
                }
            }

            // Don't know how to process
            else {
                throw new Error("Expected warnings to be string or array.  Instead got: " + JSON.stringify(stepYaml.warning));
            }
        }

        // Check for cautions
        if (stepYaml.caution) {

            // Check for string
            if (typeof stepYaml.caution === "string") {
                this.cautions.push(stepYaml.caution);
            }

            // Check for array
            else if (Array.isArray(stepYaml.caution)) {
                for (var cautionYaml of stepYaml.caution) {
                    this.cautions.push(cautionYaml);
                }
            }

            // Don't know how to process
            else {
                throw new Error("Expected cautions to be string or array.  Instead got: " + JSON.stringify(stepYaml.caution));
            }
        }

        // Check for comments
        if (stepYaml.comment) {

            // Check for string
            if (typeof stepYaml.comment === "string") {
                this.comments.push(stepYaml.comment);
            }

            // Check for array
            else if (Array.isArray(stepYaml.comment)) {
                for (var commentYaml of stepYaml.comment) {
                    this.comments.push(commentYaml);
                }
            }

            // Don't know how to process
            else {
                throw new Error("Expected comments to be string or array.  Instead got: " + JSON.stringify(stepYaml.comment));
            }
        }

        // Check for notes
        if (stepYaml.note) {

            // Check for string
            if (typeof stepYaml.note === "string") {
                this.notes.push(stepYaml.note);
            }

            // Check for array
            else if (Array.isArray(stepYaml.note)) {
                for (var noteYaml of stepYaml.note) {
                    this.notes.push(noteYaml);
                }
            }

            // Don't know how to process
            else {
                throw new Error("Expected notes to be string or array.  Instead got: " + JSON.stringify(stepYaml.note));
            }
        }

        // Check for substeps
        if (stepYaml.substeps) {

            // Check for string
            if (typeof stepYaml.substeps === "string") {
                this.substeps.push(new Step(stepYaml.substeps));
            }

            // Check for array
            else if (Array.isArray(stepYaml.substeps)) {
                for (var substepYaml of stepYaml.substeps) {
                    this.substeps.push(new Step(substepYaml));
                }
            }

            // Don't know how to process
            else {
                throw new Error("Expected substeps to be string or array.  Instead got: " + JSON.stringify(stepYaml.substeps));
            }
        }

    }

}