'use strict';
let actor = require('./actor');
exports.generateEVATasks = readEVATaskMainYaml;
exports.create = taskListObject;

//////

function readEVATaskMainYaml(fileLocation, fs, yaml, _, path, evaTask, callBack) {
    if (!fs.existsSync(fileLocation)) {
        return null;
    }

    let file = fs.readFileSync(fileLocation, 'utf8');
    let yml = yaml.safeLoad(file);
    let actors = _.get(yml, 'actors');
    let tasks = _.get(yml, 'tasks');

    if (!actors || actors.length === 0) {
        throw 'no actors found in the file or incorrect yaml file';
    }

    let tasklist = new taskListObject(
        yml.procedure_name,
        actors.map(a => {
            let obj = new actor.create(a.role, a.name);
            return obj;
        }),
        tasks
    );

    let counter = 0;
    _.forEach(tasklist.tasks, function (t) {
        let taskFile = `${path.dirname(fileLocation)}/${t.file}`;
        evaTask.create(taskFile, (evaTasks, title, duration) => {
            counter++;

            if (evaTasks && evaTasks.length > 0) {
                t.title = title;
                t.duration = duration;
                t.evaTasks = evaTasks;
            }

            if (counter === tasklist.tasks.length) {
                callBack(tasklist);
            }
        });
    });


}

function taskListObject(procedure_name, actors, tasks, evaTasks) {
    var vm = this;
    vm.procedure_name = procedure_name;
    vm.actors = actors;
    vm.tasks = tasks;
    vm.evaTasks = evaTasks;
}