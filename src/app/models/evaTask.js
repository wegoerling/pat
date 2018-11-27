const fs = require('fs');
const YAML = require('yamljs');
const _ = require('lodash');

exports.create = DeserializeEvaTaskWithYaml;

function DeserializeEvaTaskWithYaml(taskFile, callback) {
    if (!fs.existsSync(taskFile)) {
        console.log("\n" + taskFile + "\nFile Does Not Exist\n");
        callback([]);
    }

    let yamlFile = YAML.load(taskFile);
    callback(yamlFile.steps, yamlFile.title, yamlFile.duration);
}