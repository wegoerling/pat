'use strict';
let actor = require('./actor');
let evaTask = require('./evaTask');

exports.generateEVATasks = readEVATaskMainYaml;
exports.create = taskListObject;

//////

function readEVATaskMainYaml(fileLocation, fs, yaml, _, path) {
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

    tasklist.evaTasks = [];
    _.forEach(tasklist.tasks, t => {
        let taskFile = `${path.dirname(fileLocation)}/${t.file}`;
        tasklist.evaTasks = tasklist.evaTasks.concat(evaTask.create(taskFile));
    });

    return tasklist;
}

function taskListObject(procedure_name, actors, tasks, evaTasks) {
    var vm = this;
    vm.procedure_name = procedure_name;
    vm.actors = actors;
    vm.tasks = tasks;
    vm.evaTasks = evaTasks;
}