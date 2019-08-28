/* Specify environment to include mocha globals */
/* eslint-env node, mocha */

/**
 * Unit tests for markdownHelper.js
 */
const markdownHelper = require('../app/helpers/markdownHelper.js'),
	expect = require('chai').expect;

/**
 * Negative testing for the markdownHelper.convert function
 */
describe('markdownHelper.convert - Negative Testing', function() {
	describe('Bad Input', () => {
		//  Test empty string
		it('should return an empty string if input is emtpy', () => {
			//  Fake markdown
			var fakemarkdown = "";

			//  Expected HTML
			var expectedhtml = "";

			var actualhtml = markdownHelper.convert(fakemarkdown);
			expect(actualhtml).to.equal(expectedhtml);
		});

		//  Test input not a string
		it('should return an empty string if input is not a string', () => {
			//  Fake markdown
			var fakemarkdown = 500;

			//  Expected HTML
			var expectedhtml = "";

			var actualhtml = markdownHelper.convert(fakemarkdown);
			expect(actualhtml).to.equal(expectedhtml);
		});
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
			var fakemarkdown = "{{CHECKMARK}}";

			//  Expected HTML
			var expectedhtml = "<p>&#10063;</p>";

			var actualhtml = markdownHelper.convert(fakemarkdown);
			expect(actualhtml).to.equal(expectedhtml);
		});

		//  Test {{CHECK MARK}}
		it('should turn {{CHECK MARK}} into unicode #10003', () => {
			//  Fake HTML
			var fakemarkdown = "{{CHECK MARK}}";

			//  Expected HTML
			var expectedhtml = "<p>&#10063;</p>";

			var actualhtml = markdownHelper.convert(fakemarkdown);
			expect(actualhtml).to.equal(expectedhtml);
		});

		//  Test {{CHECK}}
		it('should turn {{CHECK}} into unicode #10003', () => {
			//  Fake HTML
			var fakemarkdown = "{{CHECK}}";

			//  Expected HTML
			var expectedhtml = "<p>&#10003;</p>";

			var actualhtml = markdownHelper.convert(fakemarkdown);
			expect(actualhtml).to.equal(expectedhtml);
		});
	});

	//  Test checkbox converters
	describe('Checkboxes', () => {
		//  Test {{CHECKBOX}}
		it('should turn {{CHECKBOX}} into unicode #10063', () => {
			//  Fake HTML
			var fakemarkdown = "{{CHECKBOX}}";

			//  Expected HTML
			var expectedhtml = "<p>&#10063;</p>";

			var actualhtml = markdownHelper.convert(fakemarkdown);
			expect(actualhtml).to.equal(expectedhtml);
		});

		//  Test {{CHECK BOX}}
		it('should turn {{CHECK BOX}} into unicode #10063', () => {
			//  Fake HTML
			var fakemarkdown = "{{CHECK BOX}}";

			//  Expected HTML
			var expectedhtml = "<p>&#10063;</p>";

			var actualhtml = markdownHelper.convert(fakemarkdown);
			expect(actualhtml).to.equal(expectedhtml);
		});
	});

	//  Test emphasis converters
	describe('Emphasis', () => {
		//  Test '''
		it('should turn \'\'\' into *', () => {
			//  Fake HTML
			var fakemarkdown = "asdf'''jkl";

			//  Expected HTML
			var expectedhtml = "<p>asdf*jkl</p>";

			var actualhtml = markdownHelper.convert(fakemarkdown);
			expect(actualhtml).to.equal(expectedhtml);
		});

		//  Test **
		it('should turn ** into *', () => {
			//  Fake HTML
			var fakemarkdown = "abcd**efgh";

			//  Expected HTML
			var expectedhtml = "<p>abcd*efgh</p>";

			var actualhtml = markdownHelper.convert(fakemarkdown);
			expect(actualhtml).to.equal(expectedhtml);
		});


	});
});
