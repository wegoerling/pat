let _ = require('lodash');
let path = require('path');
let evaTaskList = require('../app/models/evaTaskList'),
  assert = require('chai').assert,
  expect = require('chai').expect,
  sinon = require('sinon');


//test genericEVATask
describe('evaTaskList', function () {
  let sut; //system under test
  let fsStub,
    yamlStub;

  before(() => {
    sinon.spy(_, 'get');
    sinon.spy(path, 'dirname');
  });

  beforeEach(() => {
    fsStub = {
      readFileSync: sinon.spy()
    };
  });

  beforeEach(() => {
    yamlStub = {
      safeLoad: sinon.stub().returns({
        procedure_name: 'fakeProcName',
        actors: ['fakeActor1', 'fakeActor2'],
        tasks: ['fakeFile1', 'fakeFile2', 'fakeFile3'],
        evaTasks: []
      })
    };
  });

  describe('generateEVATasks', () => {
    it('should return null when yaml path does not exists', () => {
      // arrange
      fsStub.existsSync = sinon.stub().returns(false);

      // act
      sut = evaTaskList.generateEVATasks('fakeLocation', fsStub, yamlStub, _, path);

      // assert
      expect(sut).to.equal(null);
    });

    it('should open the file content if the file exists', () => {
      // arrange
      fsStub.existsSync = sinon.stub().returns(true);

      // act
      sut = evaTaskList.generateEVATasks('fakeLocation', fsStub, yamlStub, _, path);

      // assert
      expect(fsStub.readFileSync.called).to.equal(true);
    });

    it('should use the YAML library to deserialize the file content', () => {
      // arrange
      fsStub.existsSync = sinon.stub().returns(true);

      // act
      sut = evaTaskList.generateEVATasks('fakeLocation', fsStub, yamlStub, _, path);

      // assert
      expect(yamlStub.safeLoad.called).to.equal(true);
    });

    it('should generate the evaTasks from the task files', () => {
      // arrange
      fsStub.existsSync = sinon.stub().returns(true);

      // act
      sut = evaTaskList.generateEVATasks('fakeLocation', fsStub, yamlStub, _, path);

      // assert
      expect(sut.evaTasks.length).to.equal(3);
    });

  });

  /*


    //Function returns null for invalid file locations
    describe('#invalidFileLocation', function() {
      it('should return null when a file does not exist', function() {
        assert.equal(null, doc.genericEvaTask(`./fileDoesNotExist.yml`));
      });
    });

    //Function should load a file
    describe('#validFileLocation', function() { 
      //Test if the file exists
      it('should return that target exists', function() {
        let testyml = doc.genericEvaTask(fileLocation);
        assert.exists({testyml});
      });

      //Test file is not null
      it('should pass that target is not null', function() {
        let testyml = doc.genericEvaTask(fileLocation);
        expect(testyml).to.not.be.null;
        expect(testyml).to.not.be.undefined;
      });

      //Test empty yml with only ---
      it('should not return a null object', function() {
        let testyml = doc.genericEvaTask(`./test/createdTestFiles/ymlDashEmptyFile.yml`);
        expect(testyml).to.not.be.null;
        expect(testyml).to.not.be.undefined;
      });

      //Test empty yml file with no characters
      it('should not return an empty object', function() {
        let testyml = doc.genericEvaTask(`./test/createdTestFiles/ymlEmptyFile.yml`);
        console.log(testyml);
        expect(testyml).to.not.be.undefined;
        expect(testyml).to.not.be.null;
      });

      //Test yml with only name:
      it('should return a non null object for valid name:', function() {
        var testyml = doc.genericEvaTask(`./test/createdTestFiles/ymlOneBlankName.yml`);
        expect(testyml).to.not.be.null;
        expect(testyml).to.not.be.undefined;
      });

      //Test empty yml file with no characters
      it('should return a non null object for name and text', function() {
        var testyml = doc.genericEvaTask(`./test/createdTestFiles/ymlOneName.yml`);
        expect(testyml).to.not.be.null;
      });
    });

    //Function should return parsed YML file test its contents
    describe('#validFileComparison', function() {
      //Test that contents are valid based on expected contents
      it('should compare deeply pma3-shields-and-connections to equal contents', function() {
        var testyml = doc.genericEvaTask(fileLocation);
    
        //create document as completely retrieved from genericEvaTask
        var textObj1 = {IV: [ { step: "Start (EV1) PMA3 CUMMERBUNDS PET (expect 00:30) ____:____" },
            { step: "Start (EV2) PMA3 CUMMERBUNDS PET (expect 00:30) ____:____" }] };
        var textObj2 = {EV1: [ { checks: ["Up CETA Spur to Face 1",
          "Nadir to LAB on port/outboard LAB strut",
          "Drop GREEN hook on inboard port LAB strut HR 1002 or Lab 0246 near base of port LAB strut" ],
            step: "Translate to PMA3 port/aft via Lab Struts, EV1 follows" } ] };
        var textObj3 = {EV2: [ { checks: [ "Around edge of ESP-2 to gap spanner",
          "Zenith across stbd Fluid Tray",
          "Drop GREEN hook on stbd LAB HR 0247 (near base of stbd LAB strut)" ],
            step: "Translate to PMA3 stbd/aft via ESP2 starboard route, EV2 leads" },
          {comment: "this is dumb",
            step: "Stow Cummerbund ORU Bag on PMA3 HR 1609 and 1605 (zenith stanchion) w/ hinge Nadir" },
          {step: "Open bag lid and restrain open using lid straps to HRs 1606 and 1605 (nadir stanchion)" } ] };
        var textObj4 = {"EV1 + EV2": [ { step: "Verify safety tethers not crossing" } ] };
        var textObj5 = {IV: [ {image: "pma3-large-oru-bag-location.jpg" } ] };
        var textObj6 = {"EV1 + EV2": [ { image: "pma3-translation.jpg"} ] };
            
        //insert document into object as if it was the yml file retrieved
        const initialyml = [ { title: 'PMA 3 cummerbunds install', 
          duration: 45, steps: [ textObj1, textObj2, textObj3, textObj4, textObj5, textObj6 ] } ];
    
        //test
        expect(initialyml).to.deep.equal(testyml);
      });
    });

    //Function should return parsed YML file test its contents
    describe('#invalidFileComparison', function() {
      //Contents should not be equal since file loaded is different
      it('should compare deeply pma3-shields-and-connections to not equal main', function() {
        var testyml = doc.genericEvaTask(mainYMLFileLocation);
    
        //create document of pma3-shields-and-connections as completely retrieved from genericEvaTask
        var textObj1 = {IV: [ { step: "Start (EV1) PMA3 CUMMERBUNDS PET (expect 00:30) ____:____" },
            { step: "Start (EV2) PMA3 CUMMERBUNDS PET (expect 00:30) ____:____" }] };
        var textObj2 = {EV1: [ { checks: ["Up CETA Spur to Face 1",
          "Nadir to LAB on port/outboard LAB strut",
          "Drop GREEN hook on inboard port LAB strut HR 1002 or Lab 0246 near base of port LAB strut" ],
            step: "Translate to PMA3 port/aft via Lab Struts, EV1 follows" } ] };
        var textObj3 = {EV2: [ { checks: [ "Around edge of ESP-2 to gap spanner",
          "Zenith across stbd Fluid Tray",
          "Drop GREEN hook on stbd LAB HR 0247 (near base of stbd LAB strut)" ],
            step: "Translate to PMA3 stbd/aft via ESP2 starboard route, EV2 leads" },
          {comment: "this is dumb",
            step: "Stow Cummerbund ORU Bag on PMA3 HR 1609 and 1605 (zenith stanchion) w/ hinge Nadir" },
          {step: "Open bag lid and restrain open using lid straps to HRs 1606 and 1605 (nadir stanchion)" } ] };
        var textObj4 = {"EV1 + EV2": [ { step: "Verify safety tethers not crossing" } ] };
        var textObj5 = {IV: [ {image: "pma3-large-oru-bag-location.jpg" } ] };
        var textObj6 = {"EV1 + EV2": [ { image: "pma3-translation.jpg"} ] };
            
        //insert document into object as if it was the yml file retrieved
        const initialyml = [ { title: 'PMA 3 cummerbunds install', 
          duration: 45, steps: [ textObj1, textObj2, textObj3, textObj4, textObj5, textObj6 ] } ];
    
        //test
        expect(initialyml).to.not.deep.equal(testyml);
      });
    });
    */
});