/* Specify environment to include mocha globals */
/* eslint-env node, mocha */

"use strict";

const expect = require('chai').expect;
const sinon = require('sinon');
const _ = require('lodash');
const path = require('path');

const fs = require('fs');
const yj = require('yamljs');

const Actor = require('../app/model/actor');

/**
 * Positive testing for actor
 */
describe('Actor constructor - Positive Testing', function() {
	describe('Normal Input', () => {
		const yamlString = `
            role: EV1
            name: Drew
            `;
		var fakeYamlObj = yj.parse(yamlString);

		//  stub some things

		it('should return an actor for normal input', () => {

			const actor = new Actor(fakeYamlObj);

			expect(actor).to.exist;

			expect(actor.role).to.be.a('string');
			expect(actor.role).to.equal('EV1');

			expect(actor.name).to.be.a('string');
			expect(actor.name).to.equal('Drew');

		});
	});

	describe('No Name', () => {
		const yamlString = `
            role: EV1
            `;
		var fakeYamlObj = yj.parse(yamlString);

		//  stub some things

		it('should return an actor for no name', () => {

			const actor = new Actor(fakeYamlObj);

			expect(actor).to.exist;

			expect(actor.role).to.be.a('string');
			expect(actor.role).to.equal('EV1');

			expect(actor.name).to.be.a('string');
			expect(actor.name).to.equal('');

		});
	});
});

/**
 * Positive testing for actor
 */
describe('Actor constructor - Positive Testing', function() {
	describe('No Role', () => {
		const yamlString = `
            name: Drew
            `;
		var fakeYamlObj = yj.parse(yamlString);

		//  stub some things

		it('should throw an error for no name', () => {

			expect(() => new Actor(fakeYamlObj)).to.throw('Input YAML missing actor Role:');

		});
	});
});
