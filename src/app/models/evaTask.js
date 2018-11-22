const lineReader = require('readline');
const fs = require('fs');
const YAML = require('yamljs');
const _ = require('lodash');

exports.create = DeserializeEvaTaskWithYaml;
exports.textToMarkdown = textToMarkdown;

const regx = {
    titleRx: /title/i,
    durationRx: /duration/i,
    stepsRx: /steps/i
};

function DeserializeEvaTaskWithYaml(taskFile, callback) {
    if (!fs.existsSync(taskFile)) {
        console.log("\n" + taskFile + "\nFile Does Not Exist\n");
        callback([]);
    }

    let yamlFile = YAML.load(taskFile);
    let output = [];

    // console.log(JSON.stringify(yamlFile));

    // _.forEach(yamlFile.steps, (step) => {
    //     _.forEach(Object.keys(step), (actor) => {
    //         let task = new evaTask();
    //         task.actor = {
    //             role: actor
    //         };
    //         if (typeof step[actor] !== 'object') {
    //             task.step.push(step[actor]);
    //         }

    //         _.forEach(step[actor], (prop) => {
    //             if (prop.warning) task.warning = prop.warning;
    //             if (prop.caution) task.caution = prop.caution;
    //             if (prop.checkboxes) task.checkboxes = prop.checkboxes;
    //             if (prop.step) {
    //                 if (typeof prop.step !== 'array') {
    //                     task.step.push(prop.step);
    //                 } else {
    //                     _.forEach(prop.step, (s) => {
    //                         task.step.push(s);
    //                     });
    //                 }
    //             }
    //         });
    //         output.push(task);
    //     });
    // });


    callback(yamlFile.steps, yamlFile.title, yamlFile.duration);
}

function DeserializeEvaTask(taskFile, callback) {
    let reader = lineReader.createInterface({
        input: fs.createReadStream(taskFile)
    });

    let output = [];
    let task = new evaTask();
    let stepsStart = false;;
    reader.on('line', function (line) {
        let str = line.trim();

        // Ignore comments
        if (str.indexOf('#') !== 0) {
            if (stepsStart) {

            }

            // is title
            if (new RegExp(regx.titleRx).test(str)) {
                stepsStart = false;
                task.title = str.replace(regx.titleRx, '');
            }

            // is duration
            if (new RegExp(regx.durationRx).test(str)) {
                stepsStart = false;
                task.duration = str.replace(regx.durationRx, '');
            }

            // has steps
            if (new RegExp(regx.stepsRx).test(str)) {
                stepsStart = true;
            }

        } else {
            console.log('ignored line', str);
        }
    }).on('close', () => {
        output.push(task);
        callback(output);
    });;
}

function evaTask(title, duration, actor, warning, caution, checkboxes, steps, step) {
    let vm = this;

    vm.title = title;
    vm.duration = duration;
    vm.actor = actor;
    vm.warning = warning;
    vm.caution = caution;
    vm.checkboxes = checkboxes;
    vm.steps = steps;
    vm.step = step || [];
}

function textToMarkdown(sourceText) {
    return sourceText;
}