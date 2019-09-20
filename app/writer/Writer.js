'use strict';

const fs = require('fs');
const childProcess = require('child_process');

module.exports = class Writer {

	constructor(program, procedure) {
		this.program = program;
		this.procedure = procedure;
	}

	/*
	If you want step numbers like 3.5.2
	function getLongStepString (levelIndex) {
		let output = '';
		for (let i = 0; i <= levelIndex; i++) {
			let levelValue = i + 1;
			output += `%${levelValue}.`;
		}
		return output;
	}
	*/

	/**
	 * MOVE TO: Program (currently there is no Program.js; "Program" is really
	 * NPM Commander package. Perhaps should have Project.js since procedures
	 * are really documents within a project.)
	 *
	 * FIXME: Instead of using child_process, dig into .git directory. Or use
	 * an npm package for dealing with git\
	 *
	 * FIXME: This does not currently account for changes to working directory.
	 *
	 * ADD FEATURE: Consider `git describe --tags` if tags are available. That
	 * will be easier for people to understand if a version they are looking at
	 * is significantly different. Something like semver. If version is = X.Y.Z,
	 * then maybe version changes could be:
	 *
	 *    Changes to X = Adding/removing significant tasks from a procedure
	 *    Changes to Y = ??? Adding/removing/modifying steps or adding/removing
	 *                   insignificant tasks.
	 *    Changes to Z = Fixes and minor clarifications. Changes should not
	 *                   affect what crew actually do.
	 *
	 * @return {string} First 8 characters of git hash for project
	 */
	getGitHash() {

		if (this.gitHash) {
			return this.gitHash;
		}

		if (fs.existsSync(this.program.gitPath)) {
			try {
				this.gitHash = childProcess
					.execSync(`cd ${this.program.projectPath} && git rev-parse HEAD`)
					.toString().trim().slice(0, 8);
			} catch (err) {
				console.error(err);
			}
			return this.gitHash;
		} else {
			return 'NO VERSION (NOT CONFIG MANAGED)';
		}

	}

	/**
	 * Get the date of the HEAD commit
	 *
	 * @return {string} Date in iso8601 format
	 */
	getGitDate() {

		if (this.gitDate) {
			return this.gitDate;
		}

		if (fs.existsSync(this.program.gitPath)) {
			try {
				this.gitDate = childProcess
					.execSync(`cd ${this.program.projectPath} && git log -1 --format=%cd --date=iso8601`)
					.toString().trim();
			} catch (err) {
				console.error(err);
			}
			return this.gitDate;
		} else {
			return 'NO DATE (NOT CONFIG MANAGED)';
		}

	}

	getLastModifiedBy() {
		return ''; // FIXME: get this from git repo if available
	}

	writeFile() {
		throw new Error('Abstract function not implemented');
	}

	getPageSize() {
		throw new Error('Abstract function not implemented');
	}

	getPageMargins() {
		throw new Error('Abstract function not implemented');
	}

	getRightTabPosition() {
		throw new Error('Abstract function not implemented');
	}

};
