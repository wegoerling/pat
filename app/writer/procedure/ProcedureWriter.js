'use strict';

const fs = require('fs');
const childProcess = require('child_process');

module.exports = class ProcedureWriter {

	constructor(program, procedure) {
		this.program = program;
		this.procedure = procedure;

		const abstractMethods = [
			'writeFile'
		];

		for (const fn of abstractMethods) {
			if (typeof this[fn] !== 'function') {
				throw new Error(`Abstract method "${fn}" not implemented in class ${this.constructor.name}`);
			}
		}
	}

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

	getTaskDurationDisplay(task) {
		const durationDisplays = [];
		let durationDisplay;

		for (const role of task.rolesArr) {
			durationDisplays.push(role.duration.format('H:M'));
		}

		// if all the duration displays are the same
		if (durationDisplays.every((val, i, arr) => val === arr[0])) {
			durationDisplay = durationDisplays[0];

		// not the same, concatenate them
		} else {
			durationDisplay = durationDisplays.join(' / ');
		}

		return durationDisplay;
	}

	getDocMeta() {
		const docMeta = {
			title: this.procedure.procedure_name,
			lastModifiedBy: this.getLastModifiedBy(),
			creator: this.program.fullName
		};
		if (this.procedure.description) {
			docMeta.description = this.procedure.description; // FIXME: not implemented
		}
		return docMeta;
	}

	renderTasks() {
		for (const task of this.procedure.tasks) {
			this.renderTask(task);
		}
	}

};
