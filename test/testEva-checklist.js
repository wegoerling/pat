/**
 * Unit tests for eva-checklist.js
 */
'use strict';

const et = require('../eva-tasklist.js');
const expect = require('chai').expect;
const sinon = require('sinon');

const program = require('commander');
const fs = require('fs');

describe('eva-tasklist.js', () => {

    describe('buildProgramArguments - Positive Testing', () => {
        it('should process normal arguments normally', () => {

            let args = [ "foo", "bar", "-i", "foo.yml", "-o", "foo.html" ];

            et.buildProgramArguments(program, args);

            expect(program.input).to.equal("foo.yml");
            expect(program.output).to.equal("foo.html");
        });
    });

    describe('buildProgramArguments - Negative Testing', () => {

        let helpStub, exitStub;

        beforeEach(() => {
            helpStub = sinon.stub(program, 'help').callsFake(function () {});
            exitStub = sinon.stub(process, 'exit').callsFake(function () {});
        });

        afterEach(() => {
            sinon.restore();
        });

        it('should display help if input an unknown argument is provided', () => {
            let args = [ "foo", "bar", "-z" ];

            et.buildProgramArguments(program, args);

            sinon.assert.calledOnce(helpStub);
        });

        it('should exit if the -i argument has no parameter', () => {
            let args = [ "foo", "bar", "-i" ];

            et.buildProgramArguments(program, args);

            sinon.assert.calledOnce(helpStub);
        });

        it('should exit if the -o argument has no parameter', () => {
            let args = [ "foo", "bar", "-o" ];

            et.buildProgramArguments(program, args);

            sinon.assert.calledOnce(helpStub);
        });
    });

});
