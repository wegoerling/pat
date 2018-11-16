#!/usr/bin/env node

'use strict';
const fs = require('fs');
const _ = require('lodash');

exports.generators = {
    create: createHtml
}

const wildCards = {
    title: '{{title}}',
    content: '{{content}}'
};

function createHtml(evaTask, output) {
    let htmlTemplate = "";
    htmlTemplate = fs.readFileSync('./templates/template.html', 'utf8');
    return processHtml();

    function processHtml() {
        htmlTemplate = _.replace(htmlTemplate, new RegExp(wildCards.title, 'g'), evaTask.procudure_name || '');


        let $content = "";
        _.forEach(evaTask.tasks, (t) => {
            let $hgroup = `
            <h2>${t.title}</h2>
            <h4>Duration: ${t.duration}</h4>
            `;
            $content += $hgroup;

            const actorsTable = buildColumns(evaTask, t);
            $content += actorsTable;
        });

        htmlTemplate =
            _.replace(htmlTemplate, new RegExp(wildCards.content, 'g'), $content);

        fs.writeFile(output, htmlTemplate, (err) => {
            if (!!err) {
                console.log("Unable to save file:");
                console.log(err);
            }
        });

        return evaTask;
    }
}



function buildColumns(taskList, task) {
    const startTable = '<table class="gridtable">';
    const endTable = '</table>';
    const startRow = '<tr>';
    const endRow = '</tr>';

    let output = startRow;
    let colStr = '';
    let ols = [];
    _.forEach(taskList.actors, (col) => {
        output = `${output} <td>${col.role || ''}${col.name ? '(' +col.name + ')' : ''}</td>`;
        colStr += `<td><ol>[[colStr${col.role}]]</ol></td>`;
        ols.push({
            wildcard: `[[colStr${col.role}]]`
        });
    });
    output += endRow;


    _.forEach(task.evaTasks, (eva) => {
        if (eva.step && eva.step.length > 0) {
            let wildcard = `[[colStr${eva.actor.role}]]`;
            let stepStr = ''
            _.forEach(eva.step, (step) => {
                stepStr += `<li>${step}</li>`
            });

            let exists = _.findIndex(ols, (wc) => wc.wildcard === wildcard);
            if (exists >= 0) {
                ols[exists].rows += stepStr;
            }
        }
    });

    let colHtml = startRow;
    _.forEach(ols, (li) => {
        colHtml += colStr.replace(li.wildcard, li.rows);
    });
    colHtml += endRow;
    console.log(colHtml, ols.length);
    //output += colHtml;

    // let evatasks = taskList.evaTasks.select(eva => eva.title === t.title && eva.steps.length > 0);
    // let currentActor;
    // _.forEach(evatasks, (eva) => {
    //     let steps = eva.steps.join('<br />');
    //     output = `${output}<td>${steps}</td>`;

    //     //
    //     if (currentActor !== eva.actor.role) {
    //         currentActor = eva.actor.role;
    //         output = `${output}${endRow}`;
    //     }
    // });

    return `${startTable}${output}${endTable}`;
}