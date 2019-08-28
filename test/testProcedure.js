/* Specify environment to include mocha globals */
/* eslint-env node, mocha */

"use strict";

const expect = require('chai').expect;
const sinon = require('sinon');
const path = require('path');

const fs = require('fs');
const yj = require('yamljs');


const Procedure = require('../app/model/procedure');

/**
 * Positive testing for procedure
 */
describe('Procedure constructor - Positive Testing', function() {
	describe('Normal Input', () => {
		const yamlString = `
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

		// not used anywhere, but keeping to make sure yamlString is valid
		yj.parse(yamlString);

		const egressYamlString = `
            title: Egress
            duration: 00:25
            steps:
                - EV1:
                    - step: "Go Outside"
            `;

		// not used anywhere, but keeping to make sure egressYamlString is valid
		yj.parse(egressYamlString);


		// Read some files in for schema checking prior to stubbing the readFileSync method
		const procedureFile = path.join(__dirname, "../app/schema/procedureSchema.json");
		const taskFile = path.join(__dirname, "../app/schema/taskSchema.json");
		const procedureSchema = fs.readFileSync(procedureFile, 'utf-8');
		const taskSchema = fs.readFileSync(taskFile);

		//  stub some things
		before(() => {
			const existsSync = sinon.stub(fs, 'existsSync');
			const readFileSync = sinon.stub(fs, 'readFileSync');

			existsSync.withArgs(filename).returns(true);
			readFileSync.withArgs(filename).returns(yamlString);

			existsSync.withArgs(sinon.match('egress.yml')).returns(true);
			readFileSync.withArgs(sinon.match('egress.yml')).returns(egressYamlString);

			readFileSync.withArgs(sinon.match('procedureSchema.json')).returns(procedureSchema);
			readFileSync.withArgs(sinon.match('taskSchema.json')).returns(taskSchema);

		});

		//  restore the stubs
		after(() => {
			sinon.restore();
		});

		it('should return a procedure for normal input', async () => {

			const procedure = new Procedure();

			const err = await procedure.populateFromFile(filename);

			expect(err).to.not.exist;

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

		afterEach(() => {
			sinon.restore();
		})

		// Read some files in for schema checking prior to stubbing the readFileSync method
		const procedureFile = path.join(__dirname, "../app/schema/procedureSchema.json");
		const taskFile = path.join(__dirname, "../app/schema/taskSchema.json");
		const procedureSchema = fs.readFileSync(procedureFile, 'utf-8');
		const taskSchema = fs.readFileSync(taskFile);


		it('should throw error if file doesn\'t exist', async () => {

			const procedure = new Procedure();
			const err = await procedure.populateFromFile('wrong.txt');
			expect(err).to.exist;

		});

		it('should throw error if file contains invalid YAML', async () => {

			const filename = "foo.yml";
			const badYaml = `
                THIS IS NOT YAML.
                `;

			sinon.stub(fs, 'existsSync').withArgs(filename).returns(true)
			const readFileSync = sinon.stub(fs, 'readFileSync');
			readFileSync.withArgs(sinon.match(filename)).returns(badYaml);
			readFileSync.withArgs(sinon.match('procedureSchema.json')).returns(procedureSchema);
			readFileSync.withArgs(sinon.match('taskSchema.json')).returns(taskSchema);


			const procedure = new Procedure();
			const err = await procedure.populateFromFile(filename);
			expect(err).to.exist;

		});

		it('should throw error if yaml is missing procedure_name', async () => {

			const filename = "foo.yml";
			const yamlString = `

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
			const readFileSync = sinon.stub(fs, 'readFileSync');
			readFileSync.withArgs(sinon.match(filename)).returns(yamlString);
			readFileSync.withArgs(sinon.match('procedureSchema.json')).returns(procedureSchema);
			readFileSync.withArgs(sinon.match('taskSchema.json')).returns(taskSchema);

			const procedure = new Procedure();
			const err = await procedure.populateFromFile(filename);
			expect(err).to.exist;
			expect(err.validationErrors).to.exist;
			expect(err.validationErrors).to.not.be.empty;


		});

		it('should throw error if yaml is missing actors', async () => {
			const filename = "foo.yml";
			const yamlString = `
                procedure_name: Foo Procedure 1

                tasks:
                    - file: egress.yml
                    - file: misse7.yml
                `;

			sinon.stub(fs, 'existsSync').withArgs(filename).returns(true)
			const readFileSync = sinon.stub(fs, 'readFileSync');
			readFileSync.withArgs(sinon.match(filename)).returns(yamlString);
			readFileSync.withArgs(sinon.match('procedureSchema.json')).returns(procedureSchema);
			readFileSync.withArgs(sinon.match('taskSchema.json')).returns(taskSchema);

			const procedure = new Procedure();
			const err = await procedure.populateFromFile(filename);
			expect(err).to.exist;
			expect(err.validationErrors).to.exist;
			expect(err.validationErrors).to.not.be.empty;


		});

		it('should throw error if yaml is missing tasks', async () => {
			const filename = "foo.yml";
			const yamlString = `
                procedure_name: Foo Procedure 1

                actors:
                    - role: IV/SSRMS
                    - role: EV1
                      name: Drew
                    - role: EV2
                      name: Taz

                `;

			sinon.stub(fs, 'existsSync').withArgs(filename).returns(true)
			const readFileSync = sinon.stub(fs, 'readFileSync');
			readFileSync.withArgs(sinon.match(filename)).returns(yamlString);
			readFileSync.withArgs(sinon.match('procedureSchema.json')).returns(procedureSchema);
			readFileSync.withArgs(sinon.match('taskSchema.json')).returns(taskSchema);

			const procedure = new Procedure();
			const err = await procedure.populateFromFile(filename);
			expect(err).to.exist;
			expect(err.validationErrors).to.exist;
			expect(err.validationErrors).to.not.be.empty;

		});
	});
});
