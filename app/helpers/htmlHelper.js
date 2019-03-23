#!/usr/bin/env node

"use strict";
const fs = require("fs");
const _ = require("lodash");
const formatter = require("./markdownHelper");
const path = require('path');
let inputPath = '';
let outputPath = '';
let outputFilename = '';

exports.generators = {
    create: createHtml,
    params: {
        inputDir: setInputPath,
        outputDir: setOutputPath,
        htmlFile: setOutputFilename
    }
};

function setInputPath(input) {
    inputPath = input;
}

function setOutputPath(output) {
    outputPath = output;
}

function setOutputFilename(filename) {
    outputFilename = filename;
}

//TODO rework createHtml to use templates. file requires nunjucks statement

function createHtml(evaTask, htmlFileTemplate, callback) {//evaTask is evaTaskList. evaTaskList high level is procedure, actors, tasks
    let html = "";
    //evaTask.tasks is each eva mission. tasks high level is title, duration, steps.
    _.forEach(evaTask.tasks, checklist => {//create heading with title and duration

        // checklist title and duration to html
        html += `<h2>${checklist.title} (${checklist.duration})</h2>`;
        html += '<table class="gridtable">';//start task table for each evaTaskList tasks

        html += "<tr>";//new table row for each actor
        _.forEach(evaTask.actors, actor => {
            html += createActorHeading(actor);//creates theader for each actor
            actor.counter = 1;// what is this?
        });// end forEach(evaTask.actors, actor)
        html += "</tr>";//close header row

        //console.log(checklist.evaTasks);
        const tdTableWidth = 100 / evaTask.actors.length;//scale columns to equal size each
        _.forEach(checklist.steps, task => {// here evaTasks are the task file's steps: i.e. index 0 of steps is simo
            //console.log(task);
            let actor = Object.keys(task)[0]; //get the keys of step 
            if (actor.toLowerCase() !== "simo") {// non simo step
                html += `<tr>`;// new row
                let idx = _.findIndex(evaTask.actors, a => a.role === actor);
                if (idx > 0) {//find column for actor 
                    for (let $td = 0; $td < idx; $td++) {
                        html += `<td style="width: ${tdTableWidth}%;"></td>`;// create empty td in row until actor's col
                    }//end for let $td
                }//end if idx>0
                html += writeRowToHtml(task, actor, tdTableWidth, evaTask.actors);

                if (idx < evaTask.actors.length - 1) {
                    for (let $td = idx; $td < evaTask.actors.length - 1; $td++) {
                        html += `<td style="width: ${tdTableWidth}%;"></td>`;
                    } // end for (let $td ...)
                }// end if (idx < evaTask.acotors.length -1)

                html += "</tr>";// end new row
            } else {// end if (actor.toLowerCase() !== "simo")
                if (task[actor] !== null) {// simo step
                    html += '<tr>';
                    let simo = task[actor];
                    let simoActors = Object.keys(simo);// simo actors

                    let actorCols = new Array(evaTask.actors.length);
                    _.forEach(simoActors, simoActor => {// find the index of the simoActor for referencing
                        let idx = _.findIndex(evaTask.actors, a => a.role === simoActor);
                        if (idx < 0) {//cannot find actor
                            console.log(`Found invalid actor: ${simoActor}`);
                        } else {// if (idx < 0)
                            // write this actor's td and save the index in actorCols array
                            actorCols[idx] = writeRowToHtml(simo, simoActor, tdTableWidth, evaTask.actors);
                        }//end else if (idx < 0)
                    });// end forEach(simoActors, simoActor)

                    for (let $td = 0; $td < actorCols.length; $td++) {
                        if (actorCols[$td] === null || !actorCols[$td]) {
                            actorCols[$td] = `<td style="width: ${tdTableWidth}%;"></td>`;
                        }// end if (actorCols[$td]..)
                    }// end for (let $td..)

                    _.forEach(actorCols, aCol => {
                        html += aCol;//add the td column to the row
                    });// end forEach(actorCols, aCol)

                    html += '</tr>';
                }// end if (task[actor])
            }//end forEach else
        });// end forEach(checklist.evaTasks, task)

        html += "</table>";
    });

    writeHtmlToFile(evaTask.procedure_name, html, htmlFileTemplate, callback);
}

function createActorHeading(actor) {
    let html = `<th>${actor.role}`;
    if (actor.name) {
        html += `(${actor.name})`;
    }
    html += `</th>`;
    return html;
}

function writeRowToHtml(task, actor, rowWidth, allActors) {
    let actorIdx = _.findIndex(allActors, (a) => a.role === actor);
    if (actorIdx < 0) {
        console.log(`Found invalid actor: ${actor}`);
    } else {
        let html = `<td style="width: ${rowWidth}%;">`;
        if (typeof task[actor] !== "string") {
            let isFirst = true;
            _.forEach(task[actor], steps => {
                const stepData = !!steps.step ? steps.step : "";
                const checkboxes = steps.checkboxes ? steps.checkboxes : null;
                const substeps = steps.substeps ? steps.substeps : null;
                const images = steps.images ? steps.images : null;
                const title = steps.title ? steps.title : null;
                const warning = steps.warning ? steps.warning : undefined;
                const caution = steps.caution ? steps.caution : undefined;
                const comment = steps.comment ? steps.comment : undefined;
                const note = steps.note ? steps.note : undefined;

                if (title !== null) {
                    html += `${formatter.convert(title)}`;
                }

                if (warning || caution || note) {
                    const css = warning ? "warning" : caution ? "caution" : "note";
                    html += `<div class="ncw ncw-${css}">
                        <div class="ncw-head">${css}</div>
                        <div class="ncw-body">${warning || caution || note}</div>
                    </div>`;
                } else {
                    if (isFirst) {
                        html += `<ol start=${allActors[actorIdx].counter}>`;
                        isFirst = false;
                    }
                    html += `${writeStepToHtml(stepData, checkboxes, substeps, images, comment)}`;
                    allActors[actorIdx].counter += 1;
                }


            });
        } else {
            html += `<ol start=${allActors[actorIdx].counter}>`;
            html += `${writeStepToHtml(task[actor])}`;
            allActors[actorIdx].counter += 1;
        }
        html += "</ol></td>";
        return html;
    }

    return '';
}

function writeStepToHtml(step, checkboxes, substeps, images, comment) {
    let html = `<li>${formatter.convert(step)}`;
    if (checkboxes) {
        html += "<ul>";
        if (typeof checkboxes === "string") {
            if (checkboxes.indexOf('{{CHECKMARK}}') < 0) {
                checkboxes = `{{CHECKMARK}} ${checkboxes}`;
            }
            html += `<li>${formatter.convert(checkboxes)}</li>`;
        } else {
            _.forEach(checkboxes, checkbox => {
                if (checkbox.indexOf('{{CHECKMARK}}') < 0) {
                    checkbox = `{{CHECKMARK}} ${checkbox}`;
                }

                html += `<li>${formatter.convert(checkbox)}</li>`;
            });
        }
        html += "</ul>";
    }

    if (substeps) {
        html += "<ul>";
        if (typeof substeps === "string") {
            html += writeStepToHtml(substeps);
        } else {
            _.forEach(substeps, substep => {
                html += writeStepToHtml(substep.step);
            });
        }
        html += "</ul>";
    }

    if (typeof images === "string") {
        html += writeImageToHtml(images);
    } else if (images) {
        _.forEach(images, img => {
            html += writeImageToHtml(img);
        });
    }

    if (comment !== null) {
        if (typeof comment === 'string') {
            html += `<p>${formatter.convert(comment)}</p>`;
        } else {
            _.forEach(comment, (cm) => {
                if (cm !== null) {
                    html += `<div style="text-align: center;border-style: solid;border: 1">${formatter.convert(cm)}</div>`;
                }
            });
        }
    }

    html += "</li>";

    return html;
}

function writeImageToHtml(image) {
    const dir = path.dirname(outputPath);
    let imageName = path.basename(image);
    fs.copyFile(`${inputPath}/${imageName}`, `${dir}/${imageName}`, (err) => {
        if (err) {
            console.log('could not move an image from the source YAML file', err);
        }
    });

    return `<img class="img-fluid" src="${dir}/${imageName}" alt="image" />`;
}

function writeHtmlToFile($title, $content, htmlFileTemplate, callback) {
    console.log(`opening template ${htmlFileTemplate}`);
    let htmlTemplate = fs.readFileSync(
        htmlFileTemplate,
        "utf8"
    );

    htmlTemplate = _.replace(
        htmlTemplate,
        new RegExp("{{content}}", "g"),
        $content
    );
    htmlTemplate = _.replace(htmlTemplate, new RegExp("{{title}}", "g"), $title);

    fs.writeFile(outputFilename, htmlTemplate, err => {
        if (!!err) {
            console.log("Unable to save file:");
            console.log(err);
        } else {
            callback();
        }
    });
}
