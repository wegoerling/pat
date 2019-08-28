/* Specify environment to include mocha globals */
/* eslint-env node, mocha */

"use strict";

const expect = require('chai').expect;
const sinon = require('sinon');
const _ = require('lodash');
const path = require('path');

const fs = require('fs');
const yj = require('yamljs');

const ConcurrentStep = require('../app/model/concurrentStep');

/**
 * Positive testing for concurrentStep
 */
describe('ConcurrentStep constructor - Positive Testing', function() {
    describe('Normal Input - non-simo', () => {
        const yamlString = `
            EV1:
                - step: "Go Outside"
        `;
        var fakeYamlObj = yj.parse(yamlString);

        it('should return a task for normal input', () => {

            const concurrentStep = new ConcurrentStep(fakeYamlObj);

            expect(concurrentStep.EV1).to.exist;
            expect(concurrentStep.EV1).to.be.an('array');
            expect(concurrentStep.EV1).to.have.all.keys(0);

            expect(concurrentStep.EV1[0].text).to.be.a('string');
            expect(concurrentStep.EV1[0].text).to.equal('Go Outside');
        });
    });

    describe('Normal Input - simo', () => {
        const yamlString = `
            simo:
                EV1: "Go Outside"
                EV2:
                    - step: "Stay Inside"
                    - step: "Watch EV1"
        `;
        var fakeYamlObj = yj.parse(yamlString);

        it('should return a task for normal input', () => {

            const concurrentStep = new ConcurrentStep(fakeYamlObj);

            expect(concurrentStep.EV1).to.exist;
            expect(concurrentStep.EV1).to.be.an('array');
            expect(concurrentStep.EV1).to.have.all.keys(0);
            expect(concurrentStep.EV1[0].text).to.be.a('string');
            expect(concurrentStep.EV1[0].text).to.equal('Go Outside');

            expect(concurrentStep.EV2).to.exist;
            expect(concurrentStep.EV2).to.be.an('array');
            expect(concurrentStep.EV2).to.have.all.keys(0, 1);
            expect(concurrentStep.EV2[0].text).to.be.a('string');
            expect(concurrentStep.EV2[0].text).to.equal('Stay Inside');
            expect(concurrentStep.EV2[1].text).to.be.a('string');
            expect(concurrentStep.EV2[1].text).to.equal('Watch EV1');
        });
    });
});
