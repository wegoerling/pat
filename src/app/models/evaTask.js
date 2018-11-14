const lineReader = require('readline');
const fs = require('fs');

exports.create = DeserializeEvaTask;
exports.textToMarkdown = textToMarkdown;

const regx = {
    titleRx: /title/i
};

function DeserializeEvaTask(taskFile) {
    let reader = lineReader.createInterface({
        input: fs.createReadStream(taskFile)
    });

    let output = [];
    reader.on('line', function (line) {

        if (new RegExp(regx.titleRx).test(line)) {
            let evaSteps = {};
            evaSteps.title = line.replace(regx.titleRx, '');
            output.push(new evaTask(
                evaSteps.title,
                evaSteps.duration,
                evaSteps.actor,
                evaSteps.warning,
                evaSteps.caution,
                evaSteps.checkboxes,
                evaSteps.steps,
                evaSteps.step
            ));
        }
    });

    return output;

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
    vm.step = step;
}

function textToMarkdown(sourceText) {
    return sourceText;
}