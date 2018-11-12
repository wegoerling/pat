const _ = require('lodash');
const fs = require('fs');

let html = require('../app/helpers/htmlHelper').generators;
let doc = require('../app/helpers/genericEvaTask.js');
const actor = require('../app/helpers/actor');
var assert = require('chai').assert;
var expect = require('chai').expect;
var evaTaskList;
const createfileLocation = `${__dirname}/createdTestFiles/htmlHelper.html`;
//const fileLocation = `./pma3-shields-and-connections.yml`;
const mainYMLFileLocation = `./main.yml`;
console.log(mainYMLFileLocation);

//test htmlHelper
describe('htmlHelper', function() {
  before(function() {
    //build valid input
    const yml = doc.genericEvaTask(mainYMLFileLocation);

    const actors = actor.actors(yml);

    //TODO: loop thru tasks and build the output
    evaTaskList = {
        procudure_name: yml.procudure_name,
        actors: actors
    };
    _.forEach(_.get(yml, 'tasks'), (task) => {
        const fileStr = _.get(task, 'file');
        let taskFile = mainYMLFileLocation;
        console.log('serializing task', `${__dirname}/${taskFile}`);
        if (!!taskFile) {
            let fileTask = doc.genericEvaTask(`${__dirname}/${taskFile}`);

            if (fileTask !== null) {
                evaTaskList[_.split(fileStr, '.')[0]] = fileTask;
            }
        }
    });
  });

  describe('#proofOfEvaTaskList', function() {
    it('should equal object containing roles and names', function() {
      let roleOne = {role: 'EV1', name: 'Sam'};
      let roleTwo = {role: 'EV2', name: 'Alex'};
      let roleThree = {role: 'SSRMS/M1', name: 'Chris'};
      let testActors = {procudure_name: undefined, actors:[roleOne,roleTwo,roleThree]};

      expect(testActors).to.deep.equal(evaTaskList);
    });
  });

  //Function throws error for invalid input
  describe('#invalidParameters', function() {
    //test null and undefined for evaTask
    describe('#evaTask', function() {
      
      //test null
      it('should throw error when evaTask parameter is null', function() {
        expect(() => html.create(null,createfileLocation)).to.throw;
      });

      //test undefined
      it('should throw error when evaTask is undefined', function() {
        var testEvaTask;
        expect(() => html.create(testEvaTask,createfileLocation)).to.throw;
      });
    });

    //test null and undefined for output
    describe('#output', function() {
      //test null
      it('should throw error when output parameter is null', function() {
          expect(() => html.create(evaTaskList,null)).to.throw;
      });

      //test undefined
      it('should throw error when output is undefined', function() {
        var testOutput;
        expect(() => html.create(evaTaskList,testOutput)).to.throw;
      });
    })

    //test for variations of null and undefined for both parameters
    describe('#invalidBothPassedParameters', function() {
      //test null
      it('should throw error when evaTask and output parameter is null', function() {
        expect(() => html.create(null,null)).to.throw;
      });

      //test undefined
      it('should throw error when evaTask and output is undefined', function() {
        var testOutput, testOutput2;
        expect(() => html.create(testOutput2,testOutput)).to.throw;
      });

      //test null and undefined
      it('should throw error when evaTask is null & output parameter is undefined', function() {
        var testOutput;
        expect(() => html.create(null,testOutput)).to.throw;
      });

      //test null and undefined
      it('should throw error when evaTask is undefined & output parameter is null', function() {
        var testOutput;
        expect(() => html.create(testOutput, null)).to.throw;
      });
    });

    //Test valid inputs
    describe('#validParameterTesting', function() {
      //test output
      it('returns parsed yml which was passed into evaTask', function() {
        let result = html.create(evaTaskList, createfileLocation);
        expect(result).to.deep.equal(evaTaskList);
      });
    });

    describe('#testFileCreation', function() {
      //delete file
      before(function() {
        fs.unlink('./test/createdTestFiles/htmlHelper.html', (err) => {
          if (err) throw err;
          console.log('htmlHelper.html was deleted');
        });
      });

      //test file does not exist
      it('file should not exist', function() {
        expect(fs.existsSync(createfileLocation)).to.be.false;
      });

      //test file creation it to validate
      it('should have created the html file', function(done) {

        html.create(evaTaskList, createfileLocation);
        done();
        expect(fs.existsSync(createfileLocation)).to.be.true;
        

      },);
    });

  });
});
