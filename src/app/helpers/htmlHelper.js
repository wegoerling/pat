#!/usr/bin/env node

'use strict';
const fs = require('fs');
const _ = require('lodash');
const showdown = require('./markdownHelper');

exports.generators = {
    create: createHtml
}

function createHtml(evaTask, output) {
    let html = '';
    _.forEach(evaTask.tasks, (checklist) => {
        // draw the checklist title
        html += `<h2>${checklist.title} (00:${checklist.duration})</h2>`
        html += '<table class="gridtable">';

        html += '<tr>';
        let actorTasks = [];
        _.forEach(evaTask.actors, (actor) => {
            html += createActorHeading(actor);

            actorTasks = checklist.evaTasks.filter((task) => {
                return task.actor.role === actor.role;
            });

            actor.actorTasks = actorTasks;
        });
        html += '</tr>';

        html += '<tr>';
        _.forEach(evaTask.actors, (actor) => {
            html += '<td><ol>';
            _.forEach(actor.actorTasks, (actorTask) => {
                if (typeof actorTask.step === 'string') {
                    html += writeStepToHtml(actorTask.step, actorTask.checkboxes);
                } else {
                    _.forEach(actorTask.step, (step) => {
                        html += writeStepToHtml(step, actorTask.checkboxes);
                    });
                }
            });
            html += '</ol></td>';
        });
        html += '</tr>';

        html += '</table>';
    });

    writeHtmlToFile(output, evaTask.procedure_name, html);
}

function createActorHeading(actor) {
    let html = `<td>${actor.role}`;
    if (actor.name) {
        html += `(${actor.name})`;
    }
    html += `</td>`;
    return html;
}

function writeStepToHtml(step, checkboxes) {
    let html = `<li>${showdown.convert(step)}`;
    if (checkboxes) {
        html += '<ul>';
        if (typeof checkboxes === 'string') {
            html += `<li>${showdown.convert(checkboxes)}</li>`;
        } else {
            _.forEach(checkboxes, (checkbox) => {
                html += `<li>${showdown.convert(checkbox)}</li>`;
            });
        }
        html += '</ul>';
    }
    html += '</li>';

    return html;
}

function writeHtmlToFile(output, $title, $content) {
    let htmlTemplate = fs.readFileSync('./templates/htmlHelper-template.html', 'utf8');
    htmlTemplate =
        _.replace(htmlTemplate, new RegExp('{{content}}', 'g'), $content);
    htmlTemplate =
        _.replace(htmlTemplate, new RegExp('{{title}}', 'g'), $title);

    fs.writeFile(output, htmlTemplate, (err) => {
        if (!!err) {
            console.log("Unable to save file:");
            console.log(err);
        }
    });
}