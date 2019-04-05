/**
 * Unit tests for evaTaskList.js
 */
let evaTaskList = require('../app/models/evaTaskList'),
  expect = require('chai').expect,
  sinon = require('sinon'),
  _ = require('lodash'),
  path = require('path');

fs = require('fs');
yj = require('yamljs');

const YAML = require('yamljs');

/**
 * Negative testing for createFromYamlString
 */
describe('createFromYamlString - Negative Testing', function() {
    describe('Bad Input', () => {
        it('should return null if yaml is missing procedure_name', () => {
            let yamlString = `

                actors:
                    - role: IV/SSRMS
                    - role: EV1
                      name: Drew
                    - role: EV2
                      name: Taz

                tasks:
                    - file: egress.yml
                    - file: misse7.yml
                `;


            let etl = evaTaskList.createFromYamlString(yamlString);

            expect(etl).to.be.null;
        });

        it('should return null if yaml is missing actors', () => {
            let yamlString = `
                procedure_name: Foo Procedure 1

                tasks:
                    - file: egress.yml
                    - file: misse7.yml
                `;

            let etl = evaTaskList.createFromYamlString(yamlString);

            expect(etl).to.be.null;
        });

        it('should return null if yaml is missing tasks', () => {
            let yamlString = `
                procedure_name: Foo Procedure 1

                actors:
                    - role: IV/SSRMS
                    - role: EV1
                      name: Drew
                    - role: EV2
                      name: Taz

                `;

            let etl = evaTaskList.createFromYamlString(yamlString);

            expect(etl).to.be.null;
        });

        it('should return null if file contains invalid YAML', () => {

            let badYaml = `
                THIS IS NOT YAML.
                `;

            let etl = evaTaskList.createFromYamlString(badYaml);

            expect(etl).to.be.null;
        });
    });
});

/**
 * Positive testing for createFromFile
 */
describe('createFromFile - Positive Testing', function() {
    describe('Normal Input', () => {
        let yamlString = `
            procedure_name: Foo Procedure 1

            actors:
                - role: IV/SSRMS
                - role: EV1
                  name: Drew
                - role: EV2
                  name: Taz

            tasks:
                - file: egress.yml
                - file: misse7.yml
            `;
        let taskString = `
            title: EGRESS/SETUP                                                             
            duration: 00:25                                                                 
            steps:                                                                          
                IV:                                                                       
                    - step: foo
            `;
        const filename = "foo.yml";
        var fakeYamlObj = yj.parse(yamlString);

        //  stub some things
        beforeEach(() => {
            sinon.stub(fs, 'existsSync').withArgs(filename).returns(true)
            sinon.stub(fs, 'readFileSync').withArgs(filename).returns(yamlString);
            sinon.stub(yj, 'load').withArgs(filename).returns(fakeYamlObj);
        });

        //  restore the stubs
        after(() => {
            sinon.restore();
        });

        it('should return an evaChecklist for normal input', () => {

            /*
            evaTaskList.createFromFile(filename, fs, yj, function(err, etl) {
                expect(etl).to.exist;

                expect(etl.procedure_name).to.be.a('string');
                expect(etl.procedure_name).to.equal('Foo Procedure 1');

                expect(etl.actors).to.be.an('array');
                expect(etl.actors).to.have.all.keys(0, 1, 2);

                expect(etl.actors[0].role).to.equal('IV/SSRMS');
                expect(etl.actors[1].role).to.equal('EV1');
                expect(etl.actors[2].role).to.equal('EV2');

                expect(etl.actors[1].name).to.equal('Drew');
                expect(etl.actors[2].name).to.equal('Taz');
            });
            */
        });
    });
});

/**
 * Negative testing for createFromFile
 */
describe('createFromFile - Negative Testing', function() {
    describe('', () => {

        it('should return an error if file doesn\'t exist', () => {

            evaTaskList.createFromFile('wrong.txt', fs, yj, function(err, etl) {

                expect(err).to.exist;
                expect(etl).to.be.null;
            });
        });

        it('should return null if file contains invalid YAML', () => {

            const filename = "foo.yml";
            let badYaml = `
                THIS IS NOT YAML.
                `;

            sinon.stub(fs, 'existsSync').withArgs(filename).returns(true)
            sinon.stub(fs, 'readFileSync').returns(badYaml);

            let etl = evaTaskList.createFromFile(filename, fs, yj, function(err, etl) {

                expect(err).to.exist;
                expect(etl).to.be.null;
            });

            sinon.restore();
        });
    });
});

