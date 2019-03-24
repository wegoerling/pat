startup = require('../startup').startup,
    expect = require('chai').expect,
    sinon = require('sinon');

program = require('commander');
fs = require('fs');

describe('startup.js', () => {

    describe('buildProgramArguments - Positive Testing', () => {
        it('should process normal arguments normally', () => {

            let args = [ "foo", "bar", "-i", "foo.yml", "-o", "foo.html" ];

            startup.buildProgramArguments(program, args);

            expect(program.input).to.equal("foo.yml");
            expect(program.output).to.equal("foo.html");
        });
    });

    describe('buildProgramArguments - Negative Testing', () => {

        beforeEach(() => {
            helpStub = sinon.stub(program, 'help').callsFake(function () {});
            exitStub = sinon.stub(process, 'exit').callsFake(function () {});
        });

        afterEach(() => {
            sinon.restore();
        });

        it('should display help if input an unknown argument is provided', () => {
            let args = [ "foo", "bar", "-z" ];

            startup.buildProgramArguments(program, args);

            sinon.assert.calledOnce(helpStub);
        });

        it('should exit if the -i argument has no parameter', () => {
            let args = [ "foo", "bar", "-i" ];

            startup.buildProgramArguments(program, args);

            sinon.assert.calledOnce(helpStub);
        });

        it('should exit if the -o argument has no parameter', () => {
            let args = [ "foo", "bar", "-o" ];

            startup.buildProgramArguments(program, args);

            sinon.assert.calledOnce(helpStub);
        });
    });

    describe('validateArguments - Positive Testing', () => {
        
        beforeEach(() => {
            helpStub = sinon.stub(program, 'help').callsFake(function () {});
            exitStub = sinon.stub(process, 'exit').callsFake(function () {});
        });

        afterEach(() => {
            sinon.restore();
        });

        it('should process normal arguments normally', () => {

            let args = [ "foo", "bar", "-i", "foo.yml", "-o", "foo.html" ];

            startup.buildProgramArguments(program, args);

            startup.validateArguments(program);

            sinon.assert.notCalled(helpStub);
        });
    });

    describe('validateArguments - Negative Testing', () => {
        
        beforeEach(() => {
            helpStub = sinon.stub(program, 'help').callsFake(function () {});
            exitStub = sinon.stub(process, 'exit').callsFake(function () {});
        });

        afterEach(() => {
            sinon.restore();
        });

        it('should display help if input doesn\t end in .yml', () => {

            let args = [ "foo", "bar", "-i", "foo.txt", "-o", "foo.html" ];

            startup.buildProgramArguments(program, args);

            startup.validateArguments(program);

            sinon.assert.calledOnce(helpStub);
        });

        it('should display help if output doesn\t end in .html', () => {

            let args = [ "foo", "bar", "-i", "foo.yml", "-o", "foo.txt" ];

            startup.buildProgramArguments(program, args);

            startup.validateArguments(program);

            sinon.assert.calledOnce(helpStub);
        });
    });

    describe('getFileExtension', () => {

        it('should return file extension', () => {
            // arrange
            const file = './sample.yml';

            // act
            const actual = startup.getFileExtension(file);

            // assert
            expect(actual).to.equals('yml');
        });

        it('should return file extension', () => {
            // arrange
            const file = './noextension';

            // act
            const actual = startup.getFileExtension(file);

            // assert
            expect(actual.length).to.equals(0);
        });
    });

    describe('postHtmlFileToConsole', () => {
        
        beforeEach(() => {
            exitStub = sinon.stub(process, 'exit').callsFake(function () {});
        });

        afterEach(() => {
            sinon.restore();
        });

        it('should display a success message if file exists', () => {
            var existsSyncStub = sinon.stub(fs, 'existsSync').returns(true);

            startup.postHtmlFileToConsole(fs, 'foo.html');

            sinon.assert.calledOnce(existsSyncStub);
            sinon.assert.notCalled(exitStub);
        });

        it('should display a failure message if file doesn\'t exist', () => {
            var existsSyncStub = sinon.stub(fs, 'existsSync').returns(false);

            startup.postHtmlFileToConsole(fs, 'foo.html');

            sinon.assert.calledOnce(existsSyncStub);
            sinon.assert.calledOnce(exitStub);
        });
    });
});
