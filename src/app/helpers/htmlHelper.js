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
    console.log('TODO: build HTML page here');

    htmlTemplate = fs.readFileSync('./templates/template.html', 'utf8');
    return processHtml();

    function processHtml() {
        htmlTemplate = _.replace(htmlTemplate, new RegExp(wildCards.title, 'g'), evaTask.procudure_name || '');
        const actorsTable = buildColumns(evaTask.actors);
        htmlTemplate =
            _.replace(htmlTemplate, new RegExp(wildCards.content, 'g'), actorsTable);

        fs.writeFile(output, htmlTemplate, (err) => {
            if (!!err) {
                console.log(err);
            }
        });

        return evaTask;
    }
}

function buildColumns(cols) {
    const startTable = '<table class="gridtable">';
    const endTable = '</table>';
    const startRow = '<tr>';
    const endRow = '</tr>';

    let output = '';
    _.forEach(cols, (col) => {
        output = `${output} <td>${col.role || ''}${col.name ? '(' +col.name + ')' : ''}</td>`;
    });

    return `${startTable}${startRow}${output}${endRow}${endTable}`;
}