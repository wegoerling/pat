/**
 * Unit tests for eva-tasklist.js
 */
'use strict';

const expect = require('chai').expect;
const sinon = require('sinon');
const program = require('commander');
const fs = require('fs');
const path = require('path');

const et = require('../eva-tasklist.js');
const procedure = require('../app/model/procedure.js');

describe('eva-tasklist.js', () => {

    describe('run', () => {

        let procedureSchemaFile;
        let taskSchemaFile;
        let baseNjkFile;
        let macroNjkFile;
        let taskTableNjkFile;
        let cssNjkFile;
        let spacewalkNjkFile;
        let outputFile;

        let procedureSchema;
        let taskSchema;
        let baseNjk;
        let macroNjk;
        let taskTableNjk;
        let cssNjk;
        let spacewalkNjk;

        let existsSyncStub;
        let readFileSyncStub;
        let exitStub;

        before(() => {
            procedureSchemaFile = path.join(__dirname, "../app/schema/procedureSchema.json");
            taskSchemaFile = path.join(__dirname, "../app/schema/taskSchema.json");
            baseNjkFile = path.join(__dirname, '../templates/base.njk');
            macroNjkFile = path.join(__dirname, '../templates/macro.njk');
            taskTableNjkFile = path.join(__dirname, '../templates/taskTable.njk');
            cssNjkFile = path.join(__dirname, '../templates/css.njk');
            spacewalkNjkFile = path.join(__dirname, '../templates/spacewalk.njk');

            //  Save schema contents
            procedureSchema = fs.readFileSync(procedureSchemaFile, 'utf-8');
            taskSchema = fs.readFileSync(taskSchemaFile, 'utf-8');

            //  Save nunchucks template contents
            baseNjk = fs.readFileSync(baseNjkFile, 'utf8');
            macroNjk = fs.readFileSync(macroNjkFile, 'utf8');
            taskTableNjk = fs.readFileSync(taskTableNjkFile, 'utf8');
            cssNjk = fs.readFileSync(cssNjkFile, 'utf8');
            spacewalkNjk = fs.readFileSync(spacewalkNjkFile, 'utf8');
        });

        beforeEach(() => {
            existsSyncStub = sinon.stub(fs, 'existsSync');
            readFileSyncStub = sinon.stub(fs, 'readFileSync');
            exitStub = sinon.stub(process, 'exit');

            //  Fake out schema reads
            existsSyncStub.withArgs(procedureSchemaFile).returns(true);
            existsSyncStub.withArgs(taskSchemaFile).returns(true);
            readFileSyncStub.withArgs(procedureSchemaFile).returns(procedureSchema);
            readFileSyncStub.withArgs(taskSchemaFile).returns(taskSchema);

            //  Fake out template reads
            existsSyncStub.withArgs(baseNjkFile).returns(true);
            existsSyncStub.withArgs(macroNjkFile).returns(true);
            existsSyncStub.withArgs(taskTableNjkFile).returns(true);
            existsSyncStub.withArgs(cssNjkFile).returns(true);
            existsSyncStub.withArgs(spacewalkNjkFile).returns(true);
            readFileSyncStub.withArgs(baseNjkFile).returns(baseNjk);
            readFileSyncStub.withArgs(macroNjkFile).returns(macroNjk);
            readFileSyncStub.withArgs(taskTableNjkFile).returns(taskTableNjk);
            readFileSyncStub.withArgs(cssNjkFile).returns(cssNjk);
            readFileSyncStub.withArgs(spacewalkNjkFile).returns(spacewalkNjk);

            //  Don't let tests kill the process
            exitStub.callsFake(function () {});
        });

        afterEach(() => {
            sinon.restore();
        });

        it('should work with normal input', () => {
            const mainYamlString = `
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

            const egressYamlString = `
                title: EGRESS/SETUP
                duration: 00:25

                steps:
                  - simo:
                      IV:
                        - step: Record PET start time ____:____ (Pwr to Batt)
                        - step: Start WVS Recorders
                          images: ./WVSRecorders.png
                      EV1:
                        - step: '{{CHECK}} All gates closed & hooks locked'
                          title: '**Initial Configuration**'
                          checkboxes:
                            - '{{CHECKMARK}} R Waist Tether to EV2 Blank hook'
                            - '{{CHECKMARK}} Red hook on L D-ring ext'
                            - '{{CHECKMARK}} Yellow hook on Green ERCM'
                            - '{{CHECKMARK}} Green hook on Red ERCM'
                            - '{{CHECKMARK}} Blank hook on MWS'
                      EV2:
                        - step: '{{CHECK}} All gates closed & hooks locked'
                          title: '*Initial Configuration*'
                          checkboxes:
                            - '{{CHECKMARK}} All gates closed & hooks locked'
                            - '{{CHECKMARK}} R Waist Tether to A/L D-ring ext'
                            - '{{CHECKMARK}} Red hook on L D-ring ext'
                            - '{{CHECKMARK}} Yellow hook on Green ERCM'
                            - '{{CHECKMARK}} Green hook on Red ERCM'
                            - '{{CHECKMARK}} Blank hook to EV1 R Waist Tether'
                `;


            //  Fake main and task YAML reads
            existsSyncStub.withArgs('foo.yml').returns(true);
            readFileSyncStub.withArgs('foo.yml').returns(mainYamlString);

            existsSyncStub.withArgs('egress.yml').returns(true);
            readFileSyncStub.withArgs('egress.yml').returns(egressYamlString);

            //  Fake out html read
            outputFile = path.join(__dirname, 'foo.html');
            existsSyncStub.withArgs(outputFile).returns(true);
            readFileSyncStub.withArgs(outputFile).returns('test');

            const fakeArgs = ['node', 'index.js', '-i', 'foo.yml'];
            process.argv = fakeArgs;

            et.run(fakeArgs);

            sinon.assert.notCalled(exitStub);
        });

        it('should exit if missing input argument', () => {

            const fakeArgs = ['node', 'index.js'];
            process.argv = fakeArgs;

            et.run(fakeArgs);

            sinon.assert.called(exitStub);
        });

        it('should exit if input yaml doesn\'t exist', () => {

            existsSyncStub.withArgs('foo.yml').returns(false);

            const fakeArgs = ['node', 'index.js', '-i', 'foo.yml'];
            process.argv = fakeArgs;

            et.run(fakeArgs);

            sinon.assert.called(exitStub);
        });
    });

    describe('buildProgramArguments - Positive Testing', () => {
        it('should process normal arguments normally', () => {

            const args = [ "foo", "bar", "-i", "foo.yml", "-o", "foo.html" ];

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
            const args = [ "foo", "bar", "-z" ];

            et.buildProgramArguments(program, args);

            sinon.assert.calledOnce(helpStub);
        });

        it('should exit if the -i argument has no parameter', () => {
            const args = [ "foo", "bar", "-i" ];

            et.buildProgramArguments(program, args);

            sinon.assert.calledOnce(exitStub);
        });

        it('should exit if the -o argument has no parameter', () => {
            const args = [ "foo", "bar", "-o" ];

            et.buildProgramArguments(program, args);

            sinon.assert.calledOnce(helpStub);
        });
    });

});
