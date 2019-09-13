'use strict';

module.exports = class Series {

	constructor (division, primeActor, procedure) {
		this.series = [];
		this.primeActor = primeActor;
		this.otherActors = [];

		let otherActorsHash = {};

		for (let actorKey in division) {

			// if this actor is to be put into this column/series, push the
			// actor's steps to the series
			if (procedure.getActorColumn(actorKey) === seriesActorOrColumn) {

				otherActorsHash[actorKey] = true;

				let i = 0;
				let moreSteps = division[actorKey];
				let c = moreSteps.length;
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

		for (let a in otherActorsHash) {
			this.otherActors.push(a);
		}
	}

	hasSteps () {
		if (this.series.length > 0) {
			return true;
		} else {
			return false;
		}
	}

	setContainer (container) {
		this.container = new ContainerWriter(container);
	}
};
