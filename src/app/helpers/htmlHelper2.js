#!/usr/bin/env node

'use strict';
const fs = require('fs');
const _ = require('lodash');
const showdown = require('./markdownHelper');

exports.generators = {
    create: createHtml
};

function createHtml(evaTask, output) {
    let html = '';
    _.forEach(evaTask.tasks, checklist => {
        // draw the checklist title
        html += `<h2>${checklist.title} (00:${checklist.duration})</h2>`;
        html += '<table class="gridtable">';

        const rowWidth = 100 / (evaTask.actors.length);

        _.forEach(checklist.evaTasks, task => {
            let actor = Object.keys(task)[0];
            if (actor.toLowerCase() !== 'simo') {
                html += `<tr>`;
                let idx = _.findIndex(evaTask.actors, (a) => a.role === actor);
                if (idx > 0) {
                    for (let $td = 0; $td < idx; $td++) {
                        html += `<td style="width: ${rowWidth}%;"></td>`;
                    }
                }

                html += `<td style="width: ${rowWidth}%;"><ol>`;
                if (typeof task[actor] !== 'string') {
                    _.forEach(task[actor], steps => {
                        console.log('htmlHelper.createHtml', steps);
                        const stepData = !!steps.step ? steps.step : '';
                        const checkboxes = steps.checkboxes ? steps.checkboxes : null;
                        const substeps = steps.substeps ? steps.substeps : null;
                        const images = steps.images ? steps.images : null;

                        html += `${writeStepToHtml(
                        stepData, 
                        checkboxes, 
                        substeps, 
                        images)}`;
                    });
                }
                html += '</ol></td>';

                if (idx < (evaTask.actors.length - 1)) {
                    for (let $td = idx; $td < (evaTask.actors.length - 1); $td++) {
                        html += `<td style="width: ${rowWidth}%;"></td>`;
                    }
                }

                html += '</tr>'

            } else {
                console.log('is simo task');
            }
        });

        html += '</table>';
    });

    console.log(html);
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

function writeStepToHtml(step, checkboxes, substeps, images) {
    let html = `<li>${showdown.convert(step)}`;
    if (checkboxes) {
        html += '<ul>';
        if (typeof checkboxes === 'string') {
            html += `<li>${showdown.convert(checkboxes)}</li>`;
        } else {
            _.forEach(checkboxes, checkbox => {
                html += `<li>${showdown.convert(checkbox)}</li>`;
            });
        }
        html += '</ul>';
    }

    if (substeps) {
        html += '<ul>';
        if (typeof substeps === 'string') {
            html += writeStepToHtml(substeps);
        } else {
            _.forEach(substeps, substep => {
                html += writeStepToHtml(substep);
            });
        }
        html += '</ul>';
    }

    if (typeof images === 'string') {
        html += writeImageToHtml(images);
    } else if (images) {
        _.forEach(images, (img) => {
            html += writeImageToHtml(img);
        });
    }

    html += '</li>';

    return html;
}

function writeImageToHtml(image) {
    return `<img src="${image}" alt="image" />`
}

function writeHtmlToFile(output, $title, $content) {
    let htmlTemplate = fs.readFileSync(
        './templates/htmlHelper-template.html',
        'utf8'
    );
    htmlTemplate = _.replace(
        htmlTemplate,
        new RegExp('{{content}}', 'g'),
        $content
    );
    htmlTemplate = _.replace(htmlTemplate, new RegExp('{{title}}', 'g'), $title);

    fs.writeFile(output, htmlTemplate, err => {
        if (!!err) {
            console.log('Unable to save file:');
            console.log(err);
        }
    });
}