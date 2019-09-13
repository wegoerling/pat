'use strict';

const ContainerWriter = require('../writer/containerWriter.js');

module.exports = class Series {

	constructor(division, primeActor, procedure) {
		this.series = [];
		this.primeActor = primeActor;
		this.otherActors = [];

		const otherActorsHash = {};

		for (const actorKey in division) {

			// if this actor is to be put into this column/series, push the
			// actor's steps to the series
			if (procedure.getActorColumn(actorKey) === primeActor) {

				otherActorsHash[actorKey] = true;

				let i = 0;
				const moreSteps = division[actorKey];
				const c = moreSteps.length;
				for (; i < c; ++i) {
					if (!moreSteps[i].actor) {
						// if this step gets used in a column with multiple
						// actors, retain actor info in order to change display
						moreSteps[i].actor = actorKey;
					}
					this.series.push(moreSteps[i]);
				}

			}
		}

		for (const a in otherActorsHash) {
			this.otherActors.push(a);
		}
	}

	getSteps() {
		return this.series;
	}

	hasSteps() {
		if (this.series.length > 0) {
			return true;
		} else {
			return false;
		}
	}

	setContainer(container) {
		this.container = new ContainerWriter(container);
	}
};
