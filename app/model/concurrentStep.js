"use strict";

const Step = require("./step.js");

module.exports = class ConcurrentStep {

    constructor(concurrentStepYaml) {
        
        // First, check if this is a simo
        if(concurrentStepYaml.simo) {

            // Iterate over they keys (which are actor roles)
            for (var actorRole in concurrentStepYaml.simo) {
                
                // Get the actor steps array
                var actorSteps = getActorSteps(concurrentStepYaml.simo[actorRole]);

                // Set the actor and steps in the object
                this[actorRole] = actorSteps;

            }

            return;
        } 
        
        // Not a simo, so just an actor role

        // Get the actor role
        if (Object.keys(concurrentStepYaml).length !== 1) {
            throw new Error("Expected a single actor role, but instead got " + JSON.stringify(concurrentStepYaml));
        }
        var actorRole = Object.keys(concurrentStepYaml)[0];

        // get the actor steps
        var actorSteps = getActorSteps(concurrentStepYaml[actorRole]);

        // Set the actor and steps in the object
        this[actorRole] = actorSteps;

    }

}

function getActorSteps(actorStepsYaml) {

    // Initiate the array of steps for the actor
    const actorSteps = [];

    // Check if actorStepsYaml is a string
    if (typeof actorStepsYaml === "string") {
        var step = new Step();
        step.populateFromYaml(actorStepsYaml);
        actorSteps.push(step);
    }

    // Check if actorStepsYaml is an array
    else if (Array.isArray(actorStepsYaml)) {

        // This gets the values of each step in the array  
        for (var stepYaml of actorStepsYaml) {

            // Create the step, and add it to the array
            var step = new Step();
            step.populateFromYaml(stepYaml);
            actorSteps.push(step);
        }

    }

    // Don't know how to process this
    else {
        throw new Error("Was expecting either steps or string for actor.  Instead found: " + JSON.stringify(actorStepsYaml));
    }

    return actorSteps;

}