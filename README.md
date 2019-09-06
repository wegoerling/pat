# xOPS

[![Build Status](https://travis-ci.org/xoperations/xops.svg?branch=master)](https://travis-ci.org/xoperations/xops)

The purpose of xOPS is to replace the manual procedure creation process for Extravehicular Activities (EVAs, AKA "spacewalks") by NASA, Johnson Space Center personnel. The goal of the application is to be able to write EVA procedures as simple YAML files and run `xops build` to generate Word document(s) in the standard procedure format, similar to the Space Shuttle mission "STS-134" procedures found on page `FS 7-20` of [this document](https://www.nasa.gov/centers/johnson/pdf/539922main_EVA_134_F_A.pdf). More EVAs can be found at the [FOIA archive](https://www.nasa.gov/centers/johnson/news/flightdatafiles/foia_archive.html).

## Installation

The following are step by step instructions for how to get the NASA EVA Task Generator development environment installed and running. The software can be run on Window, Linux, and Mac OS.

1. Install [node LTS version](https://nodejs.org/en/download/).
2. Install [Visual Studio Code](https://code.visualstudio.com/download).
3. Clone this repository from GitHub
 ```git clone https://github.com/xOPERATIONS/xOPS.git```
4. Navigate into the project directory, using command `cd xOPS`
5. Use NPM to install the module, using command `npm install`
6. Setup the `xops` command by doing `npm link`
7. Check install works by running help menu `xops -h` or the version `xops --version`

## Videos

The following videos demostrate how to use the application features via the console command line.

*EVA Task Generator CSS- Customizable & scalable CSS template*
**docs/qna/images/CSS Demo.mp4**
[![CSS Demo](https://img.youtube.com/vi/l8NPJTH6QzU/0.jpg)](https://www.youtube.com/watch?v=l8NPJTH6QzU "Click to play CSS Demo on YouTube.com")

*EVA Task Generator Pandoc- HTML-to-Word Conversion*
**docs/qna/images/Pandoc Demo.mp4**
[![Pandoc Demo](https://img.youtube.com/vi/G60tPv9cM08/0.jpg)](https://www.youtube.com/watch?v=G60tPv9cM08 "Click to play Pandoc Demo on YouTube.com")

*EVA Task Generator URL- Externally Reference Files*
**docs/qna/images/URL Demo .mp4**
[![URL Demo](https://img.youtube.com/vi/uTopcel6VpA/0.jpg)](https://www.youtube.com/watch?v=uTopcel6VpA "Click to play URL Demo on YouTube.com")

## API Reference

Libraries used include nunjucks for HTML/CSS template customization, chai assertion for unit testing, and pandoc for HTML-to-Word file conversion.

See [YAML Definition](docs/yamlDefinition.md) for an overview of YAML file syntax. This link also provides details on how NASA JSC writes procedures in the YAML files format for EVA Tasks and how the EVA Task Generator uses the data dictionary to parse YAML files.

## Tests

### Unit Testing

This directory contains unit tests for the xOPS project. Unit tests are
automatically run by travis-ci after commits are made to this repo, and the
build status is reported by a badge in the README.md in the project root.

xOPS unit tests use the Chai Assertion Library for assertions in unit
tests. More information here: https://www.chaijs.com/api/bdd/

To manually execute unit tests (which you should do BEFORE committing changes):

```bash
npm test
```

Mocha will generate a nice test report for you.

* If any of the unit tests fail, you should fix them.
* If statement coverage is below 50%, you should add more tests.

### Integration Testing

Run the program with sample YAML files.
The following samples may be run from within the xOPS directory
- Sample using local files
`node index.js --input samples/sta-134-eva/main.yml --output sta-134-aqua.html’
- Sample with CSS on command line
`node index.js --input samples/sta-134-eva/main.yml --css samples/sta-134-eva/custom.css --output sta-134-aqua.html`
- Sample with CSS specified in input YAML file
`node index.js --input samples/sta-134-eva/maincss.yml --output sta-134-aqua.html`
- Sample with CSS on both command line and within input file
`node index.js --input samples/sta-134-eva/maincss.yml --css samples/sta-134-eva/custom.css --output sta-134-aqua.html`
- Sample with docx output
`node index.js --input samples/sta-134-eva/maincss.yml --css samples/sta-134-eva/custom.css --output sta-134-aqua.html -d`
Or
`node index.js --input samples/sta-134-eva/maincss.yml --css samples/sta-134-eva/custom.css --output sta-134-aqua.html -d *outputfile.docx*`

## Credits

### Project Sponsor

James Montalvo

### UMUC Phase III Development Team, Fall 2019

TBD

### UMUC Phase II Development Team, Spring 2019

- Akruthi Shetty
- Christopher Redding
- Ebony Christian
- Joe Bidinger
- Ted Deloggio

### UMUC Phase I Development Team, Fall 2018

- Jose De la Cruz
- Jason Foley
- Alexandra Kuntz
- Engedawork Befekadu
- Timothy Smith
- Christopher Drury
- Kevin Terry
- John-Carlo Babin
