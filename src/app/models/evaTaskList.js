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

    let evaCheckList = new taskListObject(// create evaCheckList collection (of tasks) variable loaded from fn taskListObject() 
        yml.procedure_name,
        actors.map(a => {
            let obj = new actor.create(a.role, a.name);
            return obj;
        }),//end actors.map
        tasks//tasks are dictionary objects in the first fileLocation that contain the EVA mission yml file
        // for example main.yml has task with items of key value paired file: filename.yml
    );//end taskListObject()


    _.forEach(evaCheckList.tasks, function (t) {// take evaCheckList collection and iterate through tasks (file: fileName.yml)
                                                // which are additional yml files
        let taskFile = `${path.dirname(fileLocation)}/${t.file}`;//creates tasks file path
        if (fs.existsSync(taskFile)) {
            evaTask.create(taskFile, (evaTasks, title, duration) => {// evaTask.create == evaTask.js fn DeserializeEvaTaskWithYaml()
                    //
                if (evaTasks && evaTasks.length > 0) {// builds the task construct of the Checklist task property
                    t.title = title; //set evaCheckList task property's title duration and evaTasks
                    t.duration = duration;
                    t.evaTasks = evaTasks;// these are the task yml file step value i.e. egress.yml step: -simo: etc.
                }//end if evaTask && evaTask.length
            });// end if fs.existsSync end evaTask.create
        } else {
            console.log(`file not found or no file task provided: ${taskFile}`);
        }// end else
    });//end forEach

    return evaCheckList;
}// end readEVATaskMainYaml

function taskListObject(procedure_name, actors, tasks, evaTasks) {
    var vm = this;
    vm.procedure_name = procedure_name;
    vm.actors = actors;
    vm.tasks = tasks;
    vm.evaTasks = evaTasks;
}