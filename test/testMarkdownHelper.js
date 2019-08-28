/**
 * Unit tests for markdownHelper.js
 */
const markdownHelper = require('../app/helpers/markdownHelper.js'),
  expect = require('chai').expect,
  sinon = require('sinon'),
  _ = require('lodash'),
  path = require('path');

/**
 * Negative testing for the markdownHelper.convert function
 */
describe('markdownHelper.convert - Negative Testing', function() {
  describe('Bad Input', () => {
    //  Test empty string
    it('should return an empty string if input is emtpy', () => {
      //  Fake markdown 
      fakemarkdown = "";

      //  Expected HTML
      expectedhtml = "";

      actualhtml = markdownHelper.convert(fakemarkdown);
      expect(actualhtml).to.equal(expectedhtml);
    })

    //  Test input not a string
    it('should return an empty string if input is not a string', () => {
      //  Fake markdown 
      fakemarkdown = 500;

      //  Expected HTML
      expectedhtml = "";

      actualhtml = markdownHelper.convert(fakemarkdown);
      expect(actualhtml).to.equal(expectedhtml);
    })
  });
});

/**
 * Positive testing for the markdownHelper.convert function
 */
describe('markdownHelper.convert - Positive Testing', function() {
  //  Test checkmark converters
  describe('Checkmarks', () => {
    it('should turn CHECKMARK into unicode #10003', () => {
      //  Fake HTML
      fakemarkdown = "{{CHECKMARK}}";

      //  Expected HTML
      expectedhtml = "<p>&#10063;</p>";

      actualhtml = markdownHelper.convert(fakemarkdown);
      expect(actualhtml).to.equal(expectedhtml);
    })

    //  Test {{CHECK MARK}}
    it('should turn {{CHECK MARK}} into unicode #10003', () => {
      //  Fake HTML
      fakemarkdown = "{{CHECK MARK}}";

      //  Expected HTML
      expectedhtml = "<p>&#10063;</p>";

      actualhtml = markdownHelper.convert(fakemarkdown);
      expect(actualhtml).to.equal(expectedhtml);
    })

    //  Test {{CHECK}}
    it('should turn {{CHECK}} into unicode #10003', () => {
      //  Fake HTML
      fakemarkdown = "{{CHECK}}";

      //  Expected HTML
      expectedhtml = "<p>&#10003;</p>";

      actualhtml = markdownHelper.convert(fakemarkdown);
      expect(actualhtml).to.equal(expectedhtml);
    })
  });

  //  Test checkbox converters
  describe('Checkboxes', () => {
    //  Test {{CHECKBOX}}
    it('should turn {{CHECKBOX}} into unicode #10063', () => {
      //  Fake HTML
      fakemarkdown = "{{CHECKBOX}}";

      //  Expected HTML
      expectedhtml = "<p>&#10063;</p>";

      actualhtml = markdownHelper.convert(fakemarkdown);
      expect(actualhtml).to.equal(expectedhtml);
    })

    //  Test {{CHECK BOX}}
    it('should turn {{CHECK BOX}} into unicode #10063', () => {
      //  Fake HTML
      fakemarkdown = "{{CHECK BOX}}";

      //  Expected HTML
      expectedhtml = "<p>&#10063;</p>";

      actualhtml = markdownHelper.convert(fakemarkdown);
      expect(actualhtml).to.equal(expectedhtml);
    })
  });

  //  Test emphasis converters
  describe('Emphasis', () => {
    //  Test '''
    it('should turn \'\'\' into *', () => {
      //  Fake HTML
      fakemarkdown = "asdf\'\'\'jkl";

      //  Expected HTML
      expectedhtml = "<p>asdf*jkl</p>";

      actualhtml = markdownHelper.convert(fakemarkdown);
      expect(actualhtml).to.equal(expectedhtml);
    })

    //  Test **
    it('should turn ** into *', () => {
      //  Fake HTML
      fakemarkdown = "abcd**efgh";

      //  Expected HTML
      expectedhtml = "<p>abcd*efgh</p>";

      actualhtml = markdownHelper.convert(fakemarkdown);
      expect(actualhtml).to.equal(expectedhtml);
    })


  });
});
