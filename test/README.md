Spacewalk Testing
=================

# Unit Testing

This directory contains unit tests for the spacewalk project. Unit tests are
automatically run by travis-ci after commits are made to this repo, and the
build status is reported by a badge in the README.md in the project root.

Spacewalk unit tests use the Chai Assertion Library for assertions in unit
tests. More information here: https://www.chaijs.com/api/bdd/

To manually execute unit tests (which you should do BEFORE committing changes):

```bash
npm test
```

Mocha will generate a nice test report for you.

* If any of the unit tests fail, you should fix them.
* If statement coverage is below 50%, you should add more tests.

# Integration Testing

Run the program with sample YAML files.
