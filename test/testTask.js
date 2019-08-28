/* Specify environment to include mocha globals */
/* eslint-env node, mocha */

'use strict';

const expect = require('chai').expect;
const yj = require('yamljs');

const Task = require('../app/model/task');

/**
 * Positive testing for task
 */
describe('Task constructor - Positive Testing', function() {
	describe('Normal Input', () => {
		const yamlString = `
        title: Egress
        duration: 00:25
        steps:
            - EV1:
                - step: "Go Outside"
        `;
		var fakeYamlObj = yj.parse(yamlString);

		it('should return a task for normal input', () => {

			const task = new Task(fakeYamlObj);

			expect(task.title).to.be.a('string');
			expect(task.title).to.equal('Egress');

			expect(task.duration).to.be.a('string');
			expect(task.duration).to.equal('00:25');

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

	describe('No Duration', () => {

		const yamlString = `
        title: Egress
        steps:
            - EV1:
                - step: "Go Outside"
        `;
		var fakeYamlObj = yj.parse(yamlString);

		it('should throw error if duration doesn\'t exist', () => {

			expect(() => new Task(fakeYamlObj)).to.throw('Input YAML task missing duration: ');

		});
	});

	describe('No Steps', () => {

		const yamlString = `
        title: Egress
        duration: 00:25
        `;
		var fakeYamlObj = yj.parse(yamlString);

		it('should throw error if steps don\'t exist', () => {

			expect(() => new Task(fakeYamlObj)).to.throw('Input YAML task missing steps: ');

		});
	});
});
