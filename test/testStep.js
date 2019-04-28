"use strict";

const expect = require('chai').expect;
const sinon = require('sinon');
const _ = require('lodash');
const path = require('path');

const fs = require('fs');
const yj = require('yamljs');

const Step = require('../app/model/step');

/**
 * Positive testing for step
 */
describe('Step constructor - Positive Testing', function() {
    describe('Normal Input without arrays', () => {

        let yamlString = `
            step: '{{CHECK}} All gates closed & hooks locked'
            title: '**Initial Configuration**'
            checkboxes: '{{CHECKMARK}} R Waist Tether to EV2 Blank hook'
            images: ./WVSRecorders.png
            substeps: select page - RF camera.
            warning: Do not touch the hinged side while closing the MISSE PECs (Pinch Point)
            caution: Avoid inadverntent contat with the deployed MISSE PECs, which have shatterable materials, and the silver avionics boxes atop the ExPA
            comment: this is a comment
            note: this is a note
        `;

        let yamlObject = yj.parse(yamlString);

        it('should return a procedure for normal input', () => {

            let step = new Step();
            step.populateFromYaml(yamlObject);

            expect(step).to.exist;

            expect(step.title).to.be.a('string');
            expect(step.title).to.equal('**Initial Configuration**');

            expect(step.text).to.be.a('string');
            expect(step.text).to.equal('{{CHECK}} All gates closed & hooks locked');

            expect(step.images).to.be.a('array');
            expect(step.images).to.have.all.keys(0);
            expect(step.images[0]).to.be.a('string');
            expect(step.images[0]).to.equal('./WVSRecorders.png');

            expect(step.checkboxes).to.be.a('array');
            expect(step.checkboxes).to.have.all.keys(0);
            expect(step.checkboxes[0]).to.be.a('string');
            expect(step.checkboxes[0]).to.equal('{{CHECKMARK}} R Waist Tether to EV2 Blank hook');

            expect(step.warnings).to.be.a('array');
            expect(step.warnings).to.have.all.keys(0);
            expect(step.warnings[0]).to.be.a('string');
            expect(step.warnings[0]).to.equal('Do not touch the hinged side while closing the MISSE PECs (Pinch Point)');

            expect(step.cautions).to.be.a('array');
            expect(step.cautions).to.have.all.keys(0);
            expect(step.cautions[0]).to.be.a('string');
            expect(step.cautions[0]).to.equal('Avoid inadverntent contat with the deployed MISSE PECs, which have shatterable materials, and the silver avionics boxes atop the ExPA');

            expect(step.comments).to.be.a('array');
            expect(step.comments).to.have.all.keys(0);
            expect(step.comments[0]).to.be.a('string');
            expect(step.comments[0]).to.equal('this is a comment');

            expect(step.notes).to.be.a('array');
            expect(step.notes).to.have.all.keys(0);
            expect(step.notes[0]).to.be.a('string');
            expect(step.notes[0]).to.equal('this is a note');

            expect(step.substeps).to.be.a('array');
            expect(step.substeps).to.have.all.keys(0);
            expect(step.substeps[0]).to.be.a('Object');
            expect(step.substeps[0].text).to.be.a('string');
            expect(step.substeps[0].text).to.equal('select page - RF camera.');

        });
    });

    describe('Normal Input with arrays', () => {

        let yamlString = `
            step: '{{CHECK}} All gates closed & hooks locked'
            title: '**Initial Configuration**'
            checkboxes: 
                - '{{CHECKMARK}} R Waist Tether to EV2 Blank hook'
                - second checkbox
            images: 
                - ./WVSRecorders.png
                - ./secondImage.png
            substeps: 
                - select page - RF camera.
                - step: second substep
            warning: 
                - Do not touch the hinged side while closing the MISSE PECs (Pinch Point)
                - second warning
            caution: 
                - Avoid inadverntent contat with the deployed MISSE PECs, which have shatterable materials, and the silver avionics boxes atop the ExPA
                - second caution
            comment: 
                - this is a comment
                - second comment
            note: 
                - this is a note
                - second note
        `;

        let yamlObject = yj.parse(yamlString);

        it('should return a procedure for normal input', () => {

            let step = new Step();
            step.populateFromYaml(yamlObject);

            expect(step).to.exist;

            expect(step.title).to.be.a('string');
            expect(step.title).to.equal('**Initial Configuration**');

            expect(step.text).to.be.a('string');
            expect(step.text).to.equal('{{CHECK}} All gates closed & hooks locked');

            expect(step.images).to.be.a('array');
            expect(step.images).to.have.all.keys(0, 1);
            expect(step.images[0]).to.be.a('string');
            expect(step.images[0]).to.equal('./WVSRecorders.png');
            expect(step.images[1]).to.be.a('string');
            expect(step.images[1]).to.equal('./secondImage.png');

            expect(step.checkboxes).to.be.a('array');
            expect(step.checkboxes).to.have.all.keys(0, 1);
            expect(step.checkboxes[0]).to.be.a('string');
            expect(step.checkboxes[0]).to.equal('{{CHECKMARK}} R Waist Tether to EV2 Blank hook');
            expect(step.checkboxes[1]).to.be.a('string');
            expect(step.checkboxes[1]).to.equal('second checkbox');

            expect(step.warnings).to.be.a('array');
            expect(step.warnings).to.have.all.keys(0, 1);
            expect(step.warnings[0]).to.be.a('string');
            expect(step.warnings[0]).to.equal('Do not touch the hinged side while closing the MISSE PECs (Pinch Point)');
            expect(step.warnings[1]).to.be.a('string');
            expect(step.warnings[1]).to.equal('second warning');

            expect(step.cautions).to.be.a('array');
            expect(step.cautions).to.have.all.keys(0, 1);
            expect(step.cautions[0]).to.be.a('string');
            expect(step.cautions[0]).to.equal('Avoid inadverntent contat with the deployed MISSE PECs, which have shatterable materials, and the silver avionics boxes atop the ExPA');
            expect(step.cautions[1]).to.be.a('string');
            expect(step.cautions[1]).to.equal('second caution');

            expect(step.comments).to.be.a('array');
            expect(step.comments).to.have.all.keys(0, 1);
            expect(step.comments[0]).to.be.a('string');
            expect(step.comments[0]).to.equal('this is a comment');
            expect(step.comments[1]).to.be.a('string');
            expect(step.comments[1]).to.equal('second comment');

            expect(step.notes).to.be.a('array');
            expect(step.notes).to.have.all.keys(0, 1);
            expect(step.notes[0]).to.be.a('string');
            expect(step.notes[0]).to.equal('this is a note');
            expect(step.notes[1]).to.be.a('string');
            expect(step.notes[1]).to.equal('second note');

            expect(step.substeps).to.be.a('array');
            expect(step.substeps).to.have.all.keys(0, 1);
            expect(step.substeps[0]).to.be.a('Object');
            expect(step.substeps[0].text).to.be.a('string');
            expect(step.substeps[0].text).to.equal('select page - RF camera.');
            expect(step.substeps[1]).to.be.a('Object');
            expect(step.substeps[1].text).to.be.a('string');
            expect(step.substeps[1].text).to.equal('second substep');

        });
    });
});