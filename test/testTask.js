/* Specify environment to include mocha globals */
/* eslint-env node, mocha */

'use strict';

const expect = require('chai').expect;
const yj = require('yamljs');

const Task = require('../app/model/task');

const proceduresTaskInstance = {
	file: 'some-task.yml',
	roles: { crewA: 'EV1', crewB: 'EV2' },
	color: '#7FB3D5'
};

const procedureColumnKeys = ['IV', 'EV1', 'EV2'];

/**
 * Positive testing for task
 */
describe('Task constructor - Positive Testing', function() {
	describe('Normal Input', () => {
		const yamlString = `
        title: Egress

        roles:
          - name: crewA
            duration:
              minutes: 25
          - name: crewB
            duration:
              minutes: 25

        steps:
            - EV1:
                - step: "Go Outside"
        `;
		var taskDefinition = yj.parse(yamlString);

		it('should return a task for normal input', () => {

			const task = new Task(taskDefinition, proceduresTaskInstance, procedureColumnKeys);

			expect(task.title).to.be.a('string');
			expect(task.title).to.equal('Egress');

			expect(task.concurrentSteps).to.be.an('array');
			expect(task.concurrentSteps).to.have.all.keys(0);

			// eslint-disable-next-line no-unused-expressions
			expect(task.concurrentSteps[0].EV1).to.exist;
			expect(task.concurrentSteps[0].EV1).to.be.an('array');
			expect(task.concurrentSteps[0].EV1).to.have.all.keys(0);

			expect(task.concurrentSteps[0].EV1[0].text).to.be.a('string');
			expect(task.concurrentSteps[0].EV1[0].text).to.equal('Go Outside');
		});
	});
});

/**
 * Negative testing for Task
 */
describe('Task constructor - Negative Testing', function() {
	describe('No Title', () => {

		const yamlString = `
        duration: 00:25
        steps:
            - EV1:
                - step: "Go Outside"
        `;
		var fakeYamlObj = yj.parse(yamlString);

		it('should throw error if title doesn\'t exist', () => {

			expect(() => new Task(fakeYamlObj)).to.throw('Input YAML task missing title: ');

		});
	});

	describe('No Steps', () => {

		const yamlString = `
        title: Egress
        duration: 00:25
        `;
		var taskDefinition = yj.parse(yamlString);

		it('should throw error if steps don\'t exist', () => {

			expect(() => new Task(taskDefinition, proceduresTaskInstance, procedureColumnKeys))
				.to.throw('Input YAML task missing steps: ');

		});
	});
});
