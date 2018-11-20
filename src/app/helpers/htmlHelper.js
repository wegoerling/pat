#!/usr/bin/env node

'use strict';
const fs = require('fs');
const _ = require('lodash');

exports.generators = {
    create: createHtml
}

function createHtml(evaTask, output) {
    let html = '';
    _.forEach(evaTask.tasks, (checklist) => {
        html += `<h2>${checklist.title} (00:${checklist.duration})</h2>`
        html += '<table class="gridtable">';

        html += '<tr>';
        let actorTasks = [];
        _.forEach(evaTask.actors, (actor) => {
            html += `<td>${actor.role} (${actor.name})</td>`;
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
                html += `<li>${actorTask.step}`;
                if (actorTask.checkboxes) {
                    html += '<ul>';
                    if (typeof actorTask.checkboxes === 'string') {
                        html += `<li><input type="checkbox" /> ${actorTask.checkboxes}</li>`;
                    } else {
                        _.forEach(actorTask.checkboxes, (checkbox) => {
                            html += `<li><input type="checkbox" />${checkbox}</li>`;
                        });
                    }
                    html += '</ul>';
                }
                html += '</li>';
            });
            html += '</ol></td>';
        });
        html += '</tr>';

        html += '</table>';
    });

    writeHtmlToFile(output, evaTask.procedure_name, html);
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