/**
 * Unit tests for evaTask.js
 */
let evaTask = require('../app/models/evaTask'),
  expect = require('chai').expect,
  sinon = require('sinon'),
  _ = require('lodash'),
  path = require('path');

const YAML = require('yamljs');

/**
 * Negative testing for createFromYaml
 */
describe('createFromYaml - Negative Testing', function() {
    describe('Bad Input', () => {
        it('should return null if yaml is missing title', () => {
            let yamlString = `
                duration: 25
                steps:
                    - EV1:
                        - step: "Go Outside"
                `;

            let yamlObject = YAML.parse(yamlString);

            expect(yamlObject).to.exist;

            let et = evaTask.createFromYaml(yamlObject);

            expect(et).to.be.null;
        });

        it('should return null if yaml is missing duration', () => {
            let yamlString = `
                title: Foo Task
                steps:
                    - EV1:
                        - step: "Go Outside"
                `;

            let yamlObject = YAML.parse(yamlString);

            expect(yamlObject).to.exist;

            let et = evaTask.createFromYaml(yamlObject);

            expect(et).to.be.null;
        });

        it('should return null if yaml is missing steps', () => {
            let yamlString = `
                title: Foo Task
                duration: 25
                `;
            let yamlObject = YAML.parse(yamlString);

            expect(yamlObject).to.exist;

            let et = evaTask.createFromYaml(yamlObject);

            expect(et).to.be.null;
        });
    });
});

/**
 * Positive testing for createFromYaml
 */
describe('createFromYaml - Positive Testing', function() {
    describe('Normal Input', () => {
        it('should return an evaTask for normal input', () => {
            let yamlString = `
                title: Foo Task
                duration: 25
                steps:
                    - EV1:
                        - step: "Go Outside"
                `;

            let yamlObject = YAML.parse(yamlString);

            expect(yamlObject).to.exist;

            let et = evaTask.createFromYaml(yamlObject);

            expect(et).to.exist;

            expect(et.title).to.be.a('string');
            expect(et.title).to.equal('Foo Task');

            expect(et.duration).to.be.a('number');
            expect(et.duration).to.equal(25);

            //expect(ecl.actors[0].role).to.equal('IV/SSRMS');
            //expect(ecl.actors[1].role).to.equal('EV1');
            //expect(ecl.actors[2].role).to.equal('EV2');
        });
    });
});
