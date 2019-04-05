"use strict";

const expect = require('chai').expect;
const sinon = require('sinon');
const _ = require('lodash');
const path = require('path');

const fs = require('fs');
const yj = require('yamljs');

const Procedure = require('../app/model/procedure');

/**
 * Positive testing for procedure
 */
describe('Procedure constructor - Positive Testing', function() {
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
            `;
        const filename = "foo.yml";
        var fakeYamlObj = yj.parse(yamlString);

        let egressYamlString = `
            title: Egress
            duration: 00:25
            steps:
                - EV1:
                    - step: "Go Outside"
            `;
        var fakeEgressYamlObj = yj.parse(egressYamlString);

        //  stub some things
        before(() => {
            let existsSync = sinon.stub(fs, 'existsSync');
            let load = sinon.stub(yj, 'load');

            existsSync.withArgs(filename).returns(true)
            sinon.stub(fs, 'readFileSync').withArgs(filename).returns(yamlString);
            load.withArgs(filename).returns(fakeYamlObj);

            sinon.stub(path, 'dirname').withArgs(filename).returns('');
            sinon.stub(path, 'join').withArgs('', 'egress.yml').returns('egress.yml');
            existsSync.withArgs('egress.yml').returns(true);
            load.withArgs('egress.yml').returns(fakeEgressYamlObj);
        });

        //  restore the stubs
        after(() => {
            sinon.restore();
        });

        it('should return a procedure for normal input', () => {

            let procedure = new Procedure(filename);

            expect(procedure).to.exist;

            expect(procedure.name).to.be.a('string');
            expect(procedure.name).to.equal('Foo Procedure 1');

            expect(procedure.actors).to.be.an('array');
            expect(procedure.actors).to.have.all.keys(0, 1, 2);

            expect(procedure.actors[0].role).to.equal('IV/SSRMS');
            expect(procedure.actors[1].role).to.equal('EV1');
            expect(procedure.actors[2].role).to.equal('EV2');

            expect(procedure.actors[1].name).to.equal('Drew');
            expect(procedure.actors[2].name).to.equal('Taz');
 
            expect(procedure.tasks).to.be.an('array');
            expect(procedure.tasks).to.have.all.keys(0);

            expect(procedure.tasks[0].title).to.be.a('string');
            expect(procedure.tasks[0].title).to.equal('Egress');

            expect(procedure.tasks[0].duration).to.be.a('string');
            expect(procedure.tasks[0].duration).to.equal('00:25');


            expect(procedure.tasks[0].concurrentSteps).to.be.an('array');
            expect(procedure.tasks[0].concurrentSteps).to.have.all.keys(0);

            expect(procedure.tasks[0].concurrentSteps[0].EV1).to.exist;
            expect(procedure.tasks[0].concurrentSteps[0].EV1).to.be.an('array');
            expect(procedure.tasks[0].concurrentSteps[0].EV1).to.have.all.keys(0);

            expect(procedure.tasks[0].concurrentSteps[0].EV1[0].text).to.be.a('string');
            expect(procedure.tasks[0].concurrentSteps[0].EV1[0].text).to.equal('Go Outside');
        });
    });
});

/**
 * Negative testing for createFromFile
 */
describe('Procedure constructor - Negative Testing', function() {
    describe('Bad Input', () => {

        it('should throw error if file doesn\'t exist', () => {

            expect(() => new Procedure('wrong.txt')).to.throw('Could not find file '); 

        });

        it('should throw error if file contains invalid YAML', () => {

            const filename = "foo.yml";
            let badYaml = `
                THIS IS NOT YAML.
                `;

            sinon.stub(fs, 'existsSync').withArgs(filename).returns(true)
            sinon.stub(fs, 'readFileSync').returns(badYaml);

            expect(() => new Procedure(filename)).to.throw();

            sinon.restore();
        });

        it('should throw error if yaml is missing procedure_name', () => {

            const filename = "foo.yml";
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

            sinon.stub(fs, 'existsSync').withArgs(filename).returns(true)
            sinon.stub(fs, 'readFileSync').returns(yamlString);
            
            expect(() => new Procedure(filename)).to.throw('Input YAML missing procedure_name');

            sinon.restore();
        });

        it('should throw error if yaml is missing actors', () => {
            const filename = "foo.yml";
            let yamlString = `
                procedure_name: Foo Procedure 1

                tasks:
                    - file: egress.yml
                    - file: misse7.yml
                `;

            sinon.stub(fs, 'existsSync').withArgs(filename).returns(true)
            sinon.stub(fs, 'readFileSync').returns(yamlString);
            
            expect(() => new Procedure(filename)).to.throw('Input YAML missing actors');

            sinon.restore();

        });

        it('should throw error if yaml is missing tasks', () => {
            const filename = "foo.yml";
            let yamlString = `
                procedure_name: Foo Procedure 1

                actors:
                    - role: IV/SSRMS
                    - role: EV1
                      name: Drew
                    - role: EV2
                      name: Taz

                `;

            sinon.stub(fs, 'existsSync').withArgs(filename).returns(true)
            sinon.stub(fs, 'readFileSync').returns(yamlString);
            
            expect(() => new Procedure(filename)).to.throw('Input YAML missing tasks');

            sinon.restore();    
        });
    });
});