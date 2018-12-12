'use strict';
let actor = require('./actor');
exports.generateEVATasks = readEVATaskMainYaml;
exports.create = taskListObject;

//////

function readEVATaskMainYaml(fileLocation, fs, YAML, _, path, evaTask) {
    if (!fs.existsSync(fileLocation)) {
        return null;
    }

    let yml = YAML.load(fileLocation);
    let actors = yml.actors;
    let tasks = yml.tasks;

    if (!actors || actors.length === 0) {
        throw 'no actors found in the file or incorrect yaml file';
    }

    let evaCheckList = new taskListObject(
        yml.procedure_name,
        actors.map(a => {
            let obj = new actor.create(a.role, a.name);
            return obj;
        }),
        tasks
    );


    _.forEach(evaCheckList.tasks, function (t) {
        let taskFile = `${path.dirname(fileLocation)}/${t.file}`;
        if (fs.existsSync(taskFile)) {
            evaTask.create(taskFile, (evaTasks, title, duration) => {

                if (evaTasks && evaTasks.length > 0) {
                    t.title = title;
                    t.duration = duration;
                    t.evaTasks = evaTasks;
                }
            });
        } else {
            console.log(`file not found or no file task provided: ${taskFile}`);
        }
    });

    return evaCheckList;
}

function taskListObject(procedure_name, actors, tasks, evaTasks) {
    var vm = this;
    vm.procedure_name = procedure_name;
    vm.actors = actors;
    vm.tasks = tasks;
    vm.evaTasks = evaTasks;
}