/**
 * Unit tests for evaTask.js
 */
let evaTask = require('../app/models/evaTask'),
  expect = require('chai').expect,
  sinon = require('sinon'),
  _ = require('lodash'),
  path = require('path');

fs = require('fs');
yj = require('yamljs');

/**
 * Negative testing for createFromYamlString
 */
describe('createFromYamlString - Negative Testing', function() {
    describe('Bad Input', () => {
        it('should return null if yaml is missing title', () => {
            let yamlString = `
                duration: 25
                steps:
                    - EV1:
                        - step: "Go Outside"
                `;

            let et = evaTask.createFromYamlString(yamlString);

            expect(et).to.be.null;
        });

        it('should return null if yaml is missing duration', () => {
            let yamlString = `
                title: Foo Task
                steps:
                    - EV1:
                        - step: "Go Outside"
                `;

            let et = evaTask.createFromYamlString(yamlString);

            expect(et).to.be.null;
        });

        it('should return null if yaml is missing steps', () => {
            let yamlString = `
                title: Foo Task
                duration: 25
                `;

            let et = evaTask.createFromYamlString(yamlString);

            expect(et).to.be.null;
        });

        it('should return null if file contains invalid YAML', () => {

            let badYaml = `
                THIS IS NOT YAML.
                `;

            let etl = evaTask.createFromYamlString(badYaml);

            expect(etl).to.be.null;
        });
    });
});

/**
 * Positive testing for createFromYamlString
 */
describe('createFromYamlString - Positive Testing', function() {
    describe('Normal Input', () => {
        it('should return an evaTask for normal input', () => {
            let yamlString = `
                title: Foo Task
                duration: 25
                steps:
                    - EV1:
                        - step: "Go Outside"
                `;

            let et = evaTask.createFromYamlString(yamlString);

            expect(et).to.exist;

            expect(et.title).to.be.a('string');
            expect(et.title).to.equal('Foo Task');

            expect(et.duration).to.be.a('number');
            expect(et.duration).to.equal(25);
        });
    });
});

/**
 * Positive testing for createFromFile
 */
describe('createFromFile - Positive Testing', function() {
    describe('Normal Input', () => {
        let yamlString = `
            title: Foo Task
            duration: 25
            steps:
                - EV1:
                    - step: "Go Outside"
            `;
        const filename = "foo.yml";
        var fakeYamlObj = yj.parse(yamlString);

        //  stub some things
        before(() => {
            sinon.stub(fs, 'existsSync').withArgs(filename).returns(true)
            sinon.stub(fs, 'readFileSync').withArgs(filename).returns(yamlString);
            sinon.stub(yj, 'load').withArgs(filename).returns(fakeYamlObj);
        });

        //  restore the stubs
        after(() => {
            sinon.restore();
        });

        it('should return an evaTask for normal input', () => {

            let et = evaTask.createFromFile(filename, fs, yj);

            expect(et).to.exist;

            expect(et.title).to.be.a('string');
            expect(et.title).to.equal('Foo Task');

            expect(et.duration).to.be.a('number');
            expect(et.duration).to.equal(25);
        });
    });
});

