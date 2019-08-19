NASA EVA Task Generator YAML Definition
=======================================

Table of Contents
-----------------

[1 Overview](#overview)

[1.1 Purpose](#purpose)

[1.2 Scope](#scope)

[1.3 Goals and Objectives](#goals-and-objectives)

[1.5 Definitions](#definitions)

[2 JSON Schema Usage](#json-schema-usage)

[2.1 Manual Validation](#manual-validation)

[2.2 Programmatic Validation](#programmatic-validation)

[3 YAML File Usage](#yaml-file-usage)

[3.1 Procedure File Description](#procedure-file-description)

[3.1.1 JSON Schema](#json-schema)

[3.1.2 YAML Definitions](#yaml-definitions)

[3.2 Task File Description](#task-file-description)

[3.2.1 JSON Schema](#json-schema-1)

[3.2.2 YAML Definitions](#yaml-definitions-1)

[4 Formatting](#formatting)

[4.1 Markdown](#markdown)

[4.2 Unicode Characters](#unicode-characters)

[5 References](#references)

Overview
========

The purpose of the NASA EVA Task Generator project is to create a
software application to replace the manual process of creating
procedures for Extravehicular Activity (EVA), also known as spacewalks.
These procedures typically include two astronauts (known as EV1 and EV2)
working outside the space station, a robotics operator inside the space
station, and support from Mission Control on the ground. Care must be
taken when generating EVA tasks to deconflict parallel EVA activities.

Purpose
-------

This document outlines the schema definition for the YAML files that are
utilized as input into the NASA EVA Task Generator. This will provide a
reference for those implementing a YAML input file in order to ensure
that the data is input correctly.

Each file will have a JSON Schema which defines what valid YAML will
contain. This provides a reference that is both human and machine
readable, and can also be utilized to programmatically validate that the
YAML file is valid prior to attempting to parse it.

Scope
-----

The scope for this document is strictly the YAML files. This document
does not delve into the internal representation of the data once it is
parsed. The output format of the EVA Task Generator is only discussed
where there are direct implications of how the data is represented in
YAML to the final representation in the HTML output.

Goals and Objectives
--------------------

The primary goal of this document is to formally define the YAML input,
and thereby ensuring that newly generated YAML is correctly formatted in
order to be processed by the EVA Task Generator application.

Definitions
-----------

EVA -- Extravehicular Activity

NASA - National Aeronautics and Space Administration

HTML -- Hypertext Markup Language

JSON -- JavaScript Object Notation

SWEN 670 -- Software Engineering course number 670

UMUC -- University of Maryland University College

YAML -- YAML Ain\'t Markup Language

JSON Schema Usage
=================

According to JSON Schema Everywhere:

> "JSON Schema is a collaborative, specification-based effort to define
> schemas for JSON documents that has potential to become an Internet
> Standard. It has significant adoption and tooling support across
> implementation languages and environments.
>
> Users of similar technologies, such as YAML, have not yet achieved
> equivalent validation or tooling support. However, the strongly
> similar role of these technologies makes it possible to use the JSON
> Schema standard directly. Adopting JSON Schema avoids the need to
> develop a new standard and builds on existing developer mind-share."
> (Voss & Lucas, 2018)

As such, JSON Schema will be used to describe the YAML files that are
used as input for the EVA Task Generator.

JSON Schema is documented at <http://json-schema.org/> (Wright, et al.,
2019).

Manual Validation
-----------------

There are several tools that can be downloaded and run from the command
line that will validate YAML against JSON Schema. One such tool is
Polyglottal JSON Schema Validator (Poberezkin, et al., 2017). When the
tool is run, output is generated which either tells the user that the
YAML is valid, or it describes what portion of the YAML is invalid, and
why it is invalid. The tool can be used to validate the YAML
independently of running the EVA Task Generator.

Programmatic Validation
-----------------------

The YAML file can be validated programmatically prior to attempting to
parse it. This will ensure that the parsing does not fail, and that any
errors in the input file are identified prior to program execution.

YAML File Usage
===============

There are two different YAML file types that are used in this project,
the procedure file, and task files. Each task file represents a set of
potentially re-usable tasks that comprise a series of steps that are
rendered into an HTML table. The procedure file pulls together multiple
tasks into a single spacewalk procedure.

The YAML file that is passed into the EVA Task Generator is a Procedure
file, which contains references to one (or more) task files.

YAML is documented at <https://yaml.org/> (döt Net, et al., 2016).

Procedure File Description
--------------------------

The Procedure File represents all of the tasks that need to be completed
during an Extravehicular Activity (i.e. Spacewalk).

### JSON Schema

See [Procedure JSON Schema](../app/schema/procedureSchema.json) for the current JSON Schema definition.

### YAML Definitions


| Data Item | Type | Required | Description | Example |
| --------- | ---- | -------- | ----------- | ------- |
| procedure\_name | String | Yes | Name of the EVA/Spacewalk | STS-134 EVA 1 |
| actors | Array | Yes | Array of actors that will be participating in the spacewalk.  Actors are rendered as columns in the outputted table. Each entry in the array consists of a role, and an optional name. |   |
| role | String | Yes| The actor role.  The role is rendered as the column header. | EV1 |
| name | String | No | The actor’s name.  If present, the name is placed in parentheses and appended to the role as the column header. | Drew |
| tasks       | Array       | Yes         | An array of tasks that make up the EVA/spacewalk.  Each entry in the array is a file. |             |
| file        | String      | Conditional (At least one file or url is required) | Relative path from this file to a file which represents a tasks to be completed during the procedure.  Used for re-usability. | egress.yml  |
| url         | String      | Conditional (At least one file or url is required) | URL to a file which represents a task to be completed during the procedure.  Used for re-usability.  Can be used to reference files hosted in source control systems. | https://raw.githubusercontent.com/deltj/spacewalk/master/samples/sta-134-eva/egress.yml |
| css         | String      | No          | Relative path from this file to a file which represents css to be included in the HTML.  CSS included here is specific to the procedure. | custom.css  |

Task File Description
---------------------

### JSON Schema

See [Task JSON Schema](../app/schema/taskSchema.json) for the current JSON Schema definition.

###  YAML Definitions

| Data Item	| Type | Required | Description | Example |
| --- | --- | --- | --- | --- |
| title | String | Yes | The title of the task | EGRESS/SETUP |
| duration | String | Yes | The duration of the task in the format hh:mm. | 00:25 |
| steps | Array | Yes | An array of steps that make up the task.  Each step is either a single actor, or a "simo", which represents multiple actors which perform a step simultaneously.<br>Each entry in the array can be visualized as a row (consisting of multiple steps) in the output table. |   |
| simo | Array | No | An array of actors.  A simo represents multiple actors whom preform steps simultaneously.  This is rendered in the table as aligning the first step for each actor in the array of steps.  <br>This can be visualized in the table as a single row (consisting of multiple steps), with entries for each column associated with the actors identified in the array.  <br>Each simo consists of an array of actors that perform steps simultaneously.	
| {{actor-role}} | Array<br>-or-<br>String | No | Represents a single or series of steps for an actor to complete.  <br>In the JSON Schema, it is represented by the "additionalProperties" of the "items" and "simo" objects.  <br>{{actor-role}} will actually be represented in the YAML as one of the roles identified for the procedure.  <br>This can either be a string, which represents the step text (i.e. a numbered step), or an array of objects.  <br>If this is an array, it consists of one or more of the following: step, images, title, checkboxes, substeps, warning, caution, comment, note. | EV1: <br>-or- <br>IV: 'Start Hatch thermal cover clock PET (30 min) ____:____' |
| step | Array<br>-or-<br>String | No | This represents a numbered step in the task.  <br>If this is a string, it is a single step.  <br>If it is an array, it is a series of numbered tasks.  Each entry in the array is a String. | Start WVS Recorders |
images | Array<br>-or-<br>String | No | This represents an image (or multiple images) that are displayed in the table for a single step.<br>If this is a string, it is a relative path (from this file) to the image file that should be included in the table.<br>If this is an array, each entry in the array is a string which is a relative path (from this file) to the image that should be included in the table. | ./WVSRecorders.png |
title | String | No | This is a title for the step. | '\*\*Initial Configuration\*\*' |
checkboxes | Array <br>-or-<br>String | No | This represents a series of checkboxes that go underneath the numbered step.  Each checkbox has text associated with it.<br>The string may or may not have ‘{{CHECKMARK}}’ at the beginning of the string.  In either case, it is rendered the same (with a checkbox). <br>If this is a String, it is a single checkbox that goes underneath the step.<br>If this is an array, each entry is a string, which represents a checkbox that goes underneath the step. | Gate closed, hook locked, reels unlocked, release RET<br>-or-<br>'{{CHECKMARK}} R Waist Tether to EV2 Blank hook' |
substeps | Array<br>-or-<br>String | No | This represents a series of un-numbered substeps that need to occur as part of this step.<br>This can either be a string, which represents the step text (i.e. a numbered step), or an array of objects.<br>If this is an array, it consists of one or more of the following: step, images, title, checkboxes, substeps, warning, caution, comment, note. |   |
warning | Array<br>-or-<br>String | No | This represents one (or more) warning message(s) that get displayed above the step.<br>If this is a string, it represents a single warning.<br>If this is an array, each entry is a string, which represents a warning. | Do not touch the hinged side while closing the MISSE PECs (Pinch Point) |
caution | Array<br>-or-<br>String | No | This represents one (or more) caution message(s) that get displayed above the step.<br>If this is a string, it represents a single caution.<br>If this is an array, each entry is a string, which represents a caution. | Avoid inadverntent contat with the deployed MISSE PECs, which have shatterable materials, and the silver avionics boxes atop the ExPA |
comment | Array<br>-or-<br>String | No | This represents one (or more) comment message(s) that get displayed above the step.<br>If this is a string, it represents a single comment.<br>If this is an array, each entry is a string, which represents a comment. | This is a comment |
note | Array<br>-or-<br>String | No | This represents one (or more) note message(s) that get displayed above the step.<br>If this is a string, it represents a single note.<br>If this is an array, each entry is a string, which represents a note. | This is a note |

Formatting
==========

There are several features that are included within the YAML files that
allow for specific formatting in the output of the HTML. These features
allow for easy writeup in YAML that will produce properly marked HTML.

Markdown
--------

In order to provide some formatting for the output table, it has been
decided that Markdown language will be used to provide text decorations
for the HTML output table.

Unicode Characters
------------------

Unicode characters are not friendly displayed in YAML, and are not easy
to remember for input into the YAML files. In order to allow for some
frequently-used Unicode characters to be easily input into YAML, the
table below describes how some of the Unicode characters can be
represented.

NOTE: Because the characters '{' and '}' are reserved characters in
YAML, any text strings which contain these characters need to be
surrounded with single-quotes ('). This means the ENTIRE string needs to
be surrounded by the single quote, not just the character definition.

| YAML Syntax | Unicode Character | HTML Output |
| --- | --- | --- |
| {{CHECKMARK}}<br>{{CHECK MARK}} | &\#10063; | &#10063; |
| {{CHECK}} | &\#10003; | &#10003; |


References
==========

döt Net, I., Puzrin, V., flyx, Murphy, P. K., Tolnay, D., Ben-Kiki, O., . . . Zapparov, A. (2016, 12 19). *The Official YAML Web Site*. Retrieved 03 12, 2019, from The Official YAML Web Site: https://yaml.org/

Poberezkin, E., Voss, A., Collis, J., ehmicky, Fedorov, A., & Neculau, A. (2017, 08 18). *Polyglottal JSON Schema Validator*. Retrieved 03 12, 2019, from GitHub: https://github.com/json-schema-everywhere/pajv

Voss, A., & Lucas, T. (2018, 12 28). *JSON Schema Everywhere*. Retrieved 03 12, 2019, from JSON Schema Everywhere: https://json-schema-everywhere.github.io/

Wright, A., Laxalde, D., Poberezkin, E., Andrews, H., Berman, J., Viotti, J. C., . . . Hutton, B. (2019, 02 28). *The home of JSON Schema*. Retrieved 03 12, 2019, from JSON Schema: http://json-schema.org/
