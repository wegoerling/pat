'use strict';

const Step = require('./step.js');

function getRealActorId(taskRoles, actorIdGuess) {

	// "actorIdGuess" may be a proper actor ID like "EV1" or it may be a
	// placeholder "role" like "crewA". Procedures will then have to
	// pass in crewA === EV1 into the task, and it is the job of the
	// Task/ConcurrentStep/Step to
	// attribute those steps to EV1 instead of "crewA". Additionally
	// steps may include text like {{role:crewA}}. This is replaced
	// within Step.
	//
	// if taskRoles[actorIdGuess] found, then it means actorIdGuess isn't a
	// real actor and must be replaced with whomever the procedure
	// is passing in as an actor for the role.
	if (taskRoles[actorIdGuess]) {
		// console.log(taskRoles);
		// console.log(`actorRole ${actorIdGuess} is in taskRoles`);
		return taskRoles[actorIdGuess].actor;
	} else {
		return actorIdGuess;
	}
}

function getActorSteps(actorStepsYaml, taskRoles) {
	var step;

	// Initiate the array of steps for the actor
	const actorSteps = [];

	// Check if actorStepsYaml is a string
	if (typeof actorStepsYaml === 'string') {
		step = new Step();
		step.mapTaskRolesToActor(taskRoles);
		step.populateFromYaml(actorStepsYaml);
		actorSteps.push(step);

	// Check if actorStepsYaml is an array
	} else if (Array.isArray(actorStepsYaml)) {

		// This gets the values of each step in the array
		for (var stepYaml of actorStepsYaml) {

			// Create the step, and add it to the array
			step = new Step();
			step.mapTaskRolesToActor(taskRoles);
			step.populateFromYaml(stepYaml);
			actorSteps.push(step);
		}

	// Don't know how to process this
	} else {
		throw new Error(`Was expecting either steps or string for actor.  Instead found: ${JSON.stringify(actorStepsYaml)}`);
	}

	return actorSteps;

}

module.exports = class ConcurrentStep {

	/**
	 * Create new ConcurrentStep
	 *
	 * @param  {Object} concurrentStepYaml An object representing a set of steps
	 *
	 *                  Example:
	 *                    concurrentStepYaml === {
	 *                      simo: {
	 *                        IV: [ Step, Step, Step ],
	 *                        EV1: [ Step ],
	 *                        EV2: [ Step, Step ]
	 *                      }
	 *                    }
	 * @param  {Object} taskRoles object of TaskRole objects. Example:
	 *                    taskRoles === {
	 *                      crewA: TaskRole{
	 *                        name: 'crewA',
	 *                        description: 'Crewmember exiting A/L first',
	 *                        actor: 'EV1'
	 *                      },
	 *                      crewB: TaskRole{
	 *                        name: 'crewB',
	 *                        description: 'Crewmember exiting A/L second',
	 *                        actor: 'EV2'
	 *                      }
	 *                    }
	 * @return {Object} ConcurrentStep instance
	 */
	constructor(concurrentStepYaml, taskRoles) {

		var actorIdGuess,
			actorSteps;

		// First, check if this is a simo
		if (concurrentStepYaml.simo) {

			// Iterate over they keys (which are actor roles)
			for (actorIdGuess in concurrentStepYaml.simo) {

				// Get the actor steps array
				actorSteps = getActorSteps(concurrentStepYaml.simo[actorIdGuess], taskRoles);

				// Set the actor and steps in the object
				this[getRealActorId(taskRoles, actorIdGuess)] = actorSteps;

			}

			return;
		}

		// Not a simo, so just an actor role

		// Get the actor role
		if (Object.keys(concurrentStepYaml).length !== 1) {
			throw new Error(`Expected a single actor role, but instead got ${JSON.stringify(concurrentStepYaml)}`);
		}
		actorIdGuess = Object.keys(concurrentStepYaml)[0];

		// get the actor steps
		actorSteps = getActorSteps(concurrentStepYaml[actorIdGuess], taskRoles);

		// Set the actor and steps in the object
		this[getRealActorId(taskRoles, actorIdGuess)] = actorSteps;

	}

};
