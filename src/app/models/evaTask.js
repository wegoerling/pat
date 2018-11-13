exports.create = evaTask;
exports.textToMarkdown = textToMarkdown;

function evaTask(title, duration, actor, warning, caution, checkboxes, steps, step) {
    var vm = this;

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