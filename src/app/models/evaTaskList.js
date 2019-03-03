'use strict';
let actor = require('./actor');
exports.generateEVATasks = readEVATaskMainYaml;
exports.create = taskListObject;

//////

function readEVATaskMainYaml(fileLocation, fs, YAML, _, path, evaTask) {
    if (!fs.existsSync(fileLocation)) {
        return null;
    }

    let yml = YAML.load(fileLocation);//load file into yml variable
    let actors = yml.actors;// load actors into actors variable
    let tasks = yml.tasks; // load tasks into tasks variable

    if (!actors || actors.length === 0) {
        throw 'no actors found in the file or incorrect yaml file';
    }

    let evaCheckList = new taskListObject(// create evaCheckList collection variable loaded from fn taskListObject()
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