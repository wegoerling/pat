'use strict';

const consoleHelper = require('../helpers/consoleHelper');

module.exports = class Duration {

	/**
	 * Constructor for Duration
	 * @param {Object} duration  Ex: { minutes: 60, offset: { minutes: 15 } }
	 * @param {bool} useOffset Whether or not to recurse and make a this.offset
	 *                        Duration object.
	 */
	constructor(duration, useOffset = true) {

		// allow creating a zero-time duration
		if (!duration) {
			duration = {};
		}

		const errors = [];
		for (const t of ['hours', 'minutes', 'seconds']) {
			if (duration[t] && !Number.isInteger(duration[t])) {
				errors.push(`duration ${t} must be an integer`);
			}

			// e.g. set this.hours to duration.hours or zero
			this[t] = duration[t] || 0;
		}
		if (errors.length > 0) {
			consoleHelper.error(errors, 'Duration validation');
		}

		// roll any overflow of seconds into minutes
		if (this.seconds > 59) {
			this.minutes += Math.floor(this.seconds / 60);
			this.seconds = this.seconds % 60;
		}

		// roll any overflow of minutes into hours
		if (this.minutes > 59) {
			this.hours += Math.floor(this.minutes / 60);
			this.minutes = this.minutes % 60;
		}

		// don't set an offset of an offset because (a) that makes no sense and
		// (b) infinite recursion.
		if (useOffset) {
			this.offset = new Duration(duration.offset, false);
		}
	}

	getTotalHours() {
		return this.hours + (this.minutes / 60) + (this.seconds / 3600);
	}

	getTotalMinutes() {
		return (this.hours * 60) + this.minutes + (this.seconds / 60);
	}

	getTotalSeconds() {
		return (this.hours * 3600) + (this.minutes * 60) + this.seconds;
	}

	toString() {
		return this.format('H:M:S');
	}

	format(format) {
		// String.padStart requires ES2017 but has a very simple polyfill if we
		// ever want to run this in non-modern browsers
		/* eslint-disable no-restricted-properties */
		return format
			.replace('H', this.hours.toString().padStart(2, '0'))
			.replace('M', this.minutes.toString().padStart(2, '0'))
			.replace('S', this.seconds.toString().padStart(2, '0'));
		/* eslint-enable no-restricted-properties */
	}
};
