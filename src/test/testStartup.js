const sut = require('../startup').startup,
    expect = require('chai').expect,
    sinon = require('sinon');

describe('startup.js', () => {
    before(() => {
        sinon.spy(process, "exit");
    });

    describe('additionalHelpArgument', () => {
        it('should show samples on help', () => {
            // arrange
            let spy = sinon.spy(console, 'log');

            // act
            sut.additionalHelpArgument();

            // assert 
            expect(spy.calledOnce).to.equals(true);
        });
    });

    describe('getFileExtension', () => {
        it('should return file extension', () => {
            // arrange
            const file = './sample.yml';

            // act
            const actual = sut.getFileExtension(file);

            // assert
            expect(actual).to.equals('yml');
        });

        it('should return file extension', () => {
            // arrange
            const file = './noextension';

            // act
            const actual = sut.getFileExtension(file);

            // assert
            expect(actual.length).to.equals(0);
        });
    });
});