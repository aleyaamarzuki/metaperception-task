

import React from "react";
import DrawFix from "./DrawFix";
import * as DrawDots from "./DrawDots";
import DrawBox from "./DrawBox";
import * as DrawChoice from "./DrawChoice";
import style from "./style/perTaskStyle.module.css";
import * as utils from "./utils.js";
import withRouter from "./withRouter.js";
import * as staircase from "./PerStaircase.js";
import * as ConfSlider from "./DrawConfSlider.js";
import * as BlameSliderGlobal from "./DrawBlameSliderGlobal.js";
import * as BlameSlider from "./DrawBlameSlider.js";
import * as MotivationSlider from "./DrawMotivationSlider.js"
import * as ConfSliderGlobal from "./DrawConfSliderGlobal.js";
import astronaut from "./img/astronaut3.png";
import astronaut_green from "./img/astronaut3_green.png";
import astronaut_purple from "./img/astronaut3_purple.png"; 

import { DATABASE_URL } from "./config";





//////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////
// THIS CODES THE TASK SESSION
// 1) Pre task confidence ratings
// 2) Task with trial by trial conf ratings

class PerTask extends React.Component {
  //////////////////////////////////////////////////////////////////////////////////////////////
  // CONSTRUCTOR

 

  constructor(props) {
    super(props);

    var sectionTime = Math.round(performance.now());

    //when deug
     // const userID = 100; // Aleya uncommented this for debugging
    //  const date = 100;
    //  const startTime = 100;
    //

    var dateTime = new Date().toLocaleString();

    var currentDate = new Date(); // maybe change to local
    var date = currentDate.getDate();
    var month = currentDate.getMonth(); //Be careful! January is 0 not 1
    var year = currentDate.getFullYear();
    var dateString = date + "-" + (month + 1) + "-" + year;
    var timeString = currentDate.toTimeString();



    var userID = Math.floor(100000 + Math.random() * 900000);
    var condition = 2; // Aleya uncommented this because we're only doing perceptual task


    const queryParams = new URLSearchParams(window.location.search);
    const prolific_id = queryParams.get("PROLIFIC_PID");

    console.log("ID: " + prolific_id); //pizza


    //const memCorrectPer = this.props.state.memCorrectPer;
    //const perCorrectPer = this.props.state.perCorrectPer; //if perception task is done, it will be filled, else zero

    const memCorrectPer = this.props.state.memCorrectPer;
    const perCorrectPer = this.props.state.perCorrectPer; //if perception task is done, it will be filled, else zero
    


    var trialNumTotal = 150;
    var blockNumTotal = 2; //changed
    var trialNumPerBlock = Math.round(trialNumTotal / blockNumTotal);

    //the stim position
    var stimPos = Array(Math.round(trialNumTotal / 2))
      .fill(1)
      .concat(Array(Math.round(trialNumTotal / 2)).fill(2));
    utils.shuffle(stimPos);

    var lowProb = 0.2; 
    var highProb = 0.92; // removed medium prob

    var PlayerProbs = [[lowProb, highProb], [highProb, lowProb]]; // changed
    
    //var PlayerProbsOrder = PlayerProbs[Math.floor(Math.random() * 7)];
    var PlayerProbsOrder = PlayerProbs[Math.floor(Math.random() * 2)];
    
    var orderValue =  PlayerProbs.indexOf(PlayerProbsOrder);

    
    //////////////////////////////////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////////////////////
    // SET STATES
    this.state = {
      userID: userID,
      prolificID: prolific_id,
      condition: condition,
      date: dateString,
      dateTime: dateTime,
      startTime: timeString,
      section: "task",
      sectionTime: sectionTime,
      astronaut: astronaut,
      astronaut_green: astronaut_green,
      astronaut_purple: astronaut_purple,

      // trial timings in ms
      fixTimeLag: 1000, //1000
      stimTimeLag: 300, //300
      respFbTimeLag: 700,

      //trial parameters
      trialNumTotal: trialNumTotal,
      trialNumPerBlock: trialNumPerBlock,
      blockNumTotal: blockNumTotal,
      stimPosList: stimPos,
      respKeyCode: [87, 79], // for left and right choice keys, currently it is W and O

      //trial by trial paramters
      blockNum: 1,
      trialNum: 0,
      trialNumInBlock: 0,
      trialTime: 0,
      fixTime: 0,
      stimTime: 0,
      stimPos: 0,
      dotDiffLeft: 0,
      dotDiffRight: 0,
      dotDiffStim1: 0,
      dotDiffStim2: 0,
      responseKey: 0,
      respTime: 0,
      respFbTime: 0,
      blameTime: 0, 
      blameTimeInitial: 0,
      choice: null,
      confLevel: null,
      blameLevel: null,
      globalBlameLevel: null, 
      blameInitial: null, //Aleya: added to ensure blameInitial appears in backend
      confTimeInitial: null, //this is for the global conf time
      confTime: 0,
      confInitial: null,
      blame: null,
      motivationLevel: null,
      MotivationInitial: null,
      //    confMove: null, //can only move to next trial if conf was toggled
      correct: null,
      correctMat: [], //put correct in vector, to cal perf %
      correctPer: 0,

      PlayerProbsOrder: PlayerProbsOrder,
      orderValue: orderValue,

      results1: [],
      results2:[],
      //results3: [], //changed

      pointCounter: [0, 0], //changed

      //dot paramters
      dotRadius: 5,

      // staircase parameters
      responseMatrix: [true, true],
      reversals: 0,
      stairDir: ["up", "up"],
      dotStair: 4.25,
      //dotStair: dotStair, //in log space; this is about 104 dots which is 70 dots shown for the first one
      dotStairLeft: 0,
      dotStairRight: 0,

      //quiz
      quizState: "pre",

      // screen parameters
      instructScreen: true,
      instructNum: 1,
      quizScreen: false,
      taskScreen: false,
      taskSection: null,
      debug: false,
      memCorrectPer: memCorrectPer,
      perCorrectPer: perCorrectPer,
      perBonus: 0,
    };

    //////////////////////////////////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////////////////////

    /* prevents page from going down when space bar is hit .*/
    window.addEventListener("keyup", function (e) {
      if (e.keyCode === 32 && e.target === document.body) {
        e.preventDefault();
      }
    });

    //////////////////////////////////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////////////////////
    this.handleDebugKey = this.handleDebugKey.bind(this);
    this.handleInstruct = this.handleInstruct.bind(this);
    this.handleBegin = this.handleBegin.bind(this);
    this.handleResp = this.handleResp.bind(this);
    this.handleConfResp = this.handleConfResp.bind(this);
    this.handleBlame = this.handleBlame.bind(this);
    this.instructText = this.instructText.bind(this);
    this.quizText = this.quizText.bind(this);
    //////////////////////////////////////////////////////////////////////////////////////////////
    //End constructor props
  }




  
  handleDebugKey(pressed) {
    var whichButton = pressed;

    if (whichButton === 10) {
      document.removeEventListener("keyup", this._handleDebugKey);
      setTimeout(
        function () {
          this.redirectToTarget();
        }.bind(this),
        0
      );
    }
  }

  _handleDebugKey = (event) => {
    var pressed;

    switch (event.keyCode) {
      case 32:
        //    this is SPACEBAR
        pressed = 10;
        this.handleDebugKey(pressed);
        break;
      default:
    }
  };

// OLD VERSION 
  /*handleInstruct(keyPressed) {
    var curInstructNum = this.state.instructNum;
    var whichButton = keyPressed;

    if ((whichButton === 1 && curInstructNum === 2) || (whichButton === 1 && curInstructNum === 3) || (whichButton === 1 && curInstructNum === 4)) {
      // from page 2 , I can move back a page
      this.setState({ instructNum: curInstructNum - 1 });
    } else if ((whichButton === 2 && curInstructNum === 1) || (whichButton === 2 && curInstructNum === 2) || (whichButton === 2 && curInstructNum === 3)) {
      // from page 1 , I can move forward a page
      this.setState({ instructNum: curInstructNum + 1 });
    }
  }*/

    // This handles instruction screen within the component USING KEYBOARD
    handleInstruct(keyPressed) {
      var curInstructNum = this.state.instructNum;
      var whichButton = keyPressed;
  
      const results1 = [];
      const results2 = [];
      const results3 = [];
      
      const trialNumPerBlock = this.state.trialNumPerBlock;
  
      function generateResults(prob, numTrials) {
        const numCorrect = Math.round(prob * numTrials);
        const results = new Array(numTrials).fill(0);
        
        // Fill with correct responses
        for (let i = 0; i < numCorrect; i++) {
          results[i] = 1;
        }
        
        // Shuffle the array to randomize the order of correct responses
        for (let i = results.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [results[i], results[j]] = [results[j], results[i]];
        }
        
        return results;
      }
  
      results1.push(...generateResults(this.state.PlayerProbsOrder[0], trialNumPerBlock));
      results2.push(...generateResults(this.state.PlayerProbsOrder[1], trialNumPerBlock));
      results3.push(...generateResults(this.state.PlayerProbsOrder[2], trialNumPerBlock));
      // end of change to code
  
      if ((whichButton === 1 && curInstructNum === 2) || (whichButton === 1 && curInstructNum === 3) || (whichButton === 1 && curInstructNum === 4)) {
        // from page 2 , I can move back a page
        this.setState({ 
          instructNum: curInstructNum - 1,
          results1: results1,
          results2: results2,
          results3: results3
        });
      } else if ((whichButton === 2 && curInstructNum === 1) || (whichButton === 2 && curInstructNum === 2) || (whichButton === 2 && curInstructNum === 3)) {
        // from page 1 , I can move forward a page
        this.setState({ 
          instructNum: curInstructNum + 1,
          results1: results1,
          results2: results2,
          results3: results3
        });
      }
    }

  handleBegin(keyPressed) {
    // start of change to code to make probabilities constant across participants 
    var curInstructNum = this.state.instructNum;
      var whichButton = keyPressed;

  if (whichButton === 3 && curInstructNum === 4) {
    const results1 = [];
    const results2 = [];
    //const results3 = []; // changed
    
    const trialNumPerBlock = this.state.trialNumPerBlock;

    function generateResults(prob, numTrials) {
      const numCorrect = Math.round(prob * numTrials);
      const results = new Array(numTrials).fill(0);
      
      // Fill with correct responses
      for (let i = 0; i < numCorrect; i++) {
        results[i] = 1;
      }
      
      // Shuffle the array to randomize the order of correct responses
      for (let i = results.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [results[i], results[j]] = [results[j], results[i]];
      }
      
      return results;
    }

    results1.push(...generateResults(this.state.PlayerProbsOrder[0], trialNumPerBlock));
    results2.push(...generateResults(this.state.PlayerProbsOrder[1], trialNumPerBlock));
    //results3.push(...generateResults(this.state.PlayerProbsOrder[2], trialNumPerBlock)); //changed
    // end of change to code

    // changed this to fix looping during Block 1 global rating
    this.setState({
        results1: results1,
        results2: results2,
        //results3: results3, //changed
        instructScreen: true,
        taskScreen: false,
        quizScreen: false,
        taskSection: "break",
    });

      setTimeout(
        function () {
          this.quizBegin();
        }.bind(this),
        10
      );
    } else if (whichButton === 3 && curInstructNum === 5) { //4
      // continue after a block break

      this.setState({
        //instructNum: 6, //5
        instructScreen: true,
        taskScreen: false,
        quizScreen: false,
        taskScreen: false,
        taskSection: "break",
      });

      
      setTimeout(
        function () {
          this.renderGlobalBlame();
        }.bind(this),
        10
      );

    } else if (whichButton === 3 && curInstructNum === 6) { //5
      // continue after a block break
      var blockNum = this.state.blockNum + 1;
 
      this.setState({
        instructScreen: true,
        taskScreen: false,
        quizScreen: false,
        taskSection: "break",
        trialNumInBlock: 0,
        blockNum: blockNum,
      });


      setTimeout(
        function () {
          this.taskBegin();
        }.bind(this),
        10
      );
    } else if (whichButton === 3 && curInstructNum === 7) { //6
      this.setState({
        instructScreen: true,
        taskScreen: false,
        quizScreen: false,
        taskScreen: false,
      });

      setTimeout(
        function() {
          this.renderGlobalBlame();
          }.bind(this),
          10
      );

      /*
      setTimeout(
        function () {
          this.quizBegin();
        }.bind(this),
        10
      );*/
    } else if (whichButton === 3 && curInstructNum === 8) { //7
      setTimeout(
        function () {
          this.redirectToNextTask();
        }.bind(this),
        0
      );
    }
  }

  handleGlobalConf(keyPressed, timePressed) {
    var whichButton = keyPressed;
    if (
      whichButton === 3 &&
      this.state.quizScreen === true &&
      this.state.confLevel !== null
    ) {
      var confTime = timePressed - this.state.confTimeInitial;

      this.setState({
        confTime: confTime,
      });

      setTimeout(
        function () {
          this.renderQuizSave();
        }.bind(this),
        0
      );
    }
  }

  handleGlobalBlame(keyPressed, timePressed) {
    var whichButton = keyPressed;
    if (
      whichButton === 3 &&
      this.state.instructScreen === true &&
      this.state.globalBlameLevel !== null &&      
      this.state.motivationLevel !== null
    ) {
      var globalBlameTime = timePressed - this.state.blameTimeInitial;

      this.setState({
        globalBlameTime: globalBlameTime,
      });

      setTimeout(
        function () {
          this.renderBreakSave();
        }.bind(this),
        0
      );
    }
  }  

  handleResp(keyPressed, timePressed) {
    //Check first whether it is a valid press
    var respTime =
      timePressed -
      (this.state.trialTime + this.state.fixTime + this.state.stimTime);

    var choice;
    if (keyPressed === 1) {
      choice = "left";
    } else if (keyPressed === 2) {
      choice = "right";
    } else {
      choice = null;
      //  console.log("No response made!");
    }

    var correct;
    var response;
    if (this.state.dotDiffLeft > this.state.dotDiffRight && choice === "left") {
      response = true;
      correct = 1;
    } else if (
      this.state.dotDiffLeft < this.state.dotDiffRight &&
      choice === "right"
    ) {
      response = true;
      correct = 1;
    } else {
      response = false;
      correct = 0;
    }

    //  console.log("response: " + response);
    var correctMat = this.state.correctMat.concat(correct);
    var responseMatrix = this.state.responseMatrix.concat(response);
    var correctPer =
      Math.round((utils.getAvg(correctMat) + Number.EPSILON) * 100) / 100; //2 dec pl

    var perBonus = Math.round((3 * correctPer + Number.EPSILON) * 100) / 100;


    console.log("correctper "+ correctPer)
    console.log("bonus " + perBonus)




  var results; //change this
  if (this.state.blockNum === 1) {
    results = this.state.results1;
  } else if (this.state.blockNum === 2) {
    results = this.state.results2;
  } //else if (this.state.blockNum === 3) { //changed
    //results = this.state.results3;
  //}
  //console.log(this.state.results1);
  //console.log(this.state.results2);
  //console.log(this.state.results3);
  //console.log(results);

    var blame; //change this
    if (correct === 1 && results[this.state.trialNumInBlock-1] === 1) {
      blame = 1;
      if (this.state.blockNum == 1) {
        this.state.pointCounter[0] += 1;
      } else if (this.state.blockNum == 2) {
        this.state.pointCounter[1] += 1;
      } //else if (this.state.blockNum == 3) {
        //this.state.pointCounter[2] += 1;
      //} //changed
      
    } else if (correct === 0 && results[this.state.trialNumInBlock-1] === 0) {
      blame = 2; 
      if (this.state.blockNum == 1) {
        this.state.pointCounter[0] -= 1;
      } else if (this.state.blockNum == 2) {
        this.state.pointCounter[1] -= 1;
      } //else if (this.state.blockNum == 3) {
        //this.state.pointCounter[2] -= 1;
      //} //changed
    } else if ((correct === 0 && results[this.state.trialNumInBlock-1] === 1) || (correct === 1 && results[this.state.trialNumInBlock-1] === 0)) { 
      blame = 3;
    };

    console.log(blame);


    this.setState({
      responseKey: keyPressed,
      choice: choice,
      respTime: respTime,
      correct: correct,
      responseMatrix: responseMatrix,
      correctMat: correctMat,
      correctPer: correctPer,
      blame: blame,
      perBonus: perBonus,
    });

    setTimeout(
      function () {
        this.renderChoiceFb();
      }.bind(this),
      0
    );
  }

  handleConfResp(keyPressed, timePressed) {
    var whichButton = keyPressed;
    if (whichButton === 3 && this.state.confLevel !== null) {
      //  console.log("conf level: " + this.state.confLevel);
      var confTime =
        timePressed -
        [
          this.state.trialTime +
            this.state.fixTime +
            this.state.stimTime +
            this.state.respTime +
            this.state.respFbTime,
        ];


    
      this.setState({
        confTime: confTime,

      });

      setTimeout(
        function () {
          this.renderBlame();
        }.bind(this),
        0
      );
    }
  }

  handleBlame(keyPressed, timePressed) {
    var whichButton = keyPressed; 

    if  (whichButton === 3 && this.state.blameLevel !== null) {
      var blameTime = timePressed - [
        this.state.trialTime +
            this.state.fixTime +
            this.state.stimTime +
            this.state.respTime +
            this.state.respFbTime +
            this.state.blameTime,
        ];

        this.setState({
          blameTime: blameTime,


        });
  
        setTimeout(
          function () {
            this.renderTaskSave();
          }.bind(this),
          10
        );
    }
  }




  // handle key keyPressed
  _handleInstructKey = (event) => {
    var keyPressed;

    switch (event.keyCode) {
      case 37:
        //    this is left arrow
        keyPressed = 1;
        this.handleInstruct(keyPressed);
        break;
      case 39:
        //    this is right arrow
        keyPressed = 2;
        this.handleInstruct(keyPressed);
        break;
      default:
    }
  };

  // handle key keyPressed
  _handleBeginKey = (event) => {
    var keyPressed;

    switch (event.keyCode) {
      case 32:
        //    this is spacebar
        keyPressed = 3;
        this.handleBegin(keyPressed);
        break;
      default:
    }
  };

  // handle key keyPressed
  _handleGlobalConfKey = (event) => {
    var keyPressed;
    var timePressed;

    switch (event.keyCode) {
      case 32:
        //    this is spacebar
        keyPressed = 3;
        timePressed = Math.round(performance.now());
        this.handleGlobalConf(keyPressed, timePressed);
        break;
      default:
    }
  };

  _handleGlobalBlameKey = (event) => {
    var keyPressed;
    var timePressed;

    switch (event.keyCode) {
      case 32:
        //    this is spacebar
        keyPressed = 3;
        timePressed = Math.round(performance.now());
        this.handleGlobalBlame(keyPressed, timePressed);
        break;
      default:
    }
  };

  // handle key keyPressed
  _handleRespKey = (event) => {
    var keyPressed;
    var timePressed;
    var leftKey = this.state.respKeyCode[0];
    var rightKey = this.state.respKeyCode[1];

    switch (event.keyCode) {
      case leftKey:
        //    this is left choice
        keyPressed = 1;
        timePressed = Math.round(performance.now());
        this.handleResp(keyPressed, timePressed);
        break;
      case rightKey:
        //    this is right choice
        keyPressed = 2;
        timePressed = Math.round(performance.now());
        this.handleResp(keyPressed, timePressed);
        break;
      default:
    }
  };

  // handle key keyPressed
  _handleConfRespKey = (event) => {
    var keyPressed;
    var timePressed;

    //    console.log("Confidence: " + this.state.confLevel);

    switch (event.keyCode) {
      case 32:
        //    this is enter
        keyPressed = 3;
        timePressed = Math.round(performance.now());
        this.handleConfResp(keyPressed, timePressed);
        break;
      default:
    }
  };

  _handleBlameKey = (event) => {
    var keyPressed;
    var timePressed;


    switch (event.keyCode) {
      case 32:
        //    this is enter
        keyPressed = 3;
        timePressed = Math.round(performance.now());
        this.handleBlame(keyPressed, timePressed);
        break;
      default:
    }
  };


  handleCallbackConf(callBackValue) {
    this.setState({ confLevel: callBackValue });

  }

  handleCallbackBlame(callBackValue) {
    this.setState({ blameLevel: callBackValue });
  }

  handleCallbackGlobalBlame(callBackValue) {
    this.setState({ globalBlameLevel: callBackValue });
  }

  handleCallbackMotivation(callBackValue) {
    this.setState({ motivationLevel: callBackValue });
  }

  // To ask them for the valence rating of the noises
  // before we start the task
  instructText(instructNum) {

    let points; 
    if (this.state.blockNum == 1) {
      points = this.state.pointCounter[0]
      } else if (this.state.blockNum == 2) {
        points = this.state.pointCounter[1]
      } //else if (this.state.blockNum == 3) {
        //points = this.state.pointCounter[2]
      //}; //changed

      let prolific;
      prolific = Math.floor(Math.random() * 10000).toString().padStart(4, '0');


    


    
    let instruct_text1 = (
      <div>
        <span>
          The spaceship&apos;s power is dropping low - we need your help to sort
          the battery cards quickly!
          <br /> <br />
          You will have {this.state.trialNumTotal} set pairs of battery cards to
          make your decisions. This will be split over{" "}
          {this.state.blockNumTotal} sections with {this.state.trialNumPerBlock}{" "}
          sets of batteries each so that you can take breaks in between.
          <br /> <br />
          If the battery on the <strong>left</strong> has higher charge (more
          dots), <strong>press W</strong>.
          <br /> <br />
          If the battery on the <strong>right</strong> has higher charge (more
          dots), <strong> press O</strong>.
          <br /> <br />
          Please respond quickly and to the best of your ability. 
          <br /> <br />
          <center>
            Use the ← and → keys to navigate the pages.
            <br />
            <br />[<strong>→</strong>]
          </center>
        </span>
      </div>
    );

    let instruct_text2 = (
      <div>
        <span>
        Also, remember that we will be pairing your performance with other players. There will be 2 sections in this task, and <strong> in each section we will pair your performance with a different player</strong>. 
        After you rate your confidence, you will be shown the following feedback:
      <center>
          <br/>
          <br/>
          <strong>Whether you’re both correct (+1)</strong>
          <br/>
          <br/>
          <strong>Whether you’re both wrong (-1)</strong>
          <br/>
          <br/>
          <strong>Whether only one person got it wrong (0)</strong>
          <br/> 
          <br/>
      </center>
        If only one person got it wrong, you will have to rate the probability that you or the other player got it wrong. 
        Please do your best to select your rating accurately and do take advantage of the whole length of the rating scale.
        You will not be allowed to move on to the next set of batteries if you do not adjust the rating scale.
          <br /> 
          <br />
          <center>
            Use the ← and → keys to navigate the pages.
            <br />
            <br />[<strong>←</strong>][<strong>→</strong>]
          </center>
          
         
        </span>
      </div>
    );


    let instruct_text3 = (
      <div>
        <span>
          After making your choice, you will then rate your confidence in your
          judgement on the rating scale.
          <br /> <br />
          Please do your best to rate your confidence accurately and do take
          advantage of the <strong>whole length</strong> of the rating scale.
          <br /> <br />
          You will not be allowed to move on to the next set of batteries if you
          do not adjust the rating scale.
          <br /> <br />
          <center>
            Use the ← and → keys to navigate the pages.
            <br />
            <br />[<strong>←</strong>][<strong>→</strong>]
          </center>
        </span>
      </div>
    );

    let instruct_text4 = (
      <div>
        You are now starting to play against Player 1 whose Prolific ID ends with the following 4 digits: <strong>{prolific}</strong>
        <br/>
        <br/>
        <br/>
        <center>
        <img src={this.state.astronaut_green} width={180} alt="astronaut 1" />
        </center>
        <br/>
        <br/>
        Player 1 will be informed of the shared points and bonus won after you finish the task.
        <br/>
        <br/>
        <center>
            Press the [<strong>SPACEBAR</strong>] when you are ready to
            start.
          </center>
      </div>

    );


    let instruct_text5 = (
      <div>
        <span>
          You have completed {this.state.blockNum} out of{" "}
          {this.state.blockNumTotal} blocks!
          Well done!
          <br/>
          <br/>
          You will now be taken to a page where you can take a break through pressing <strong>SPACEBAR</strong>. But first answer the following questions:
          <br/>
          <br/>
          After going through the previous {this.state.trialNumInBlock} pairs of battery cards how often do you think you chose correctly compared to the <strong>last</strong> player?<br />
          <br />
          <br />
          <center>
          <BlameSliderGlobal.BlameSliderGlobal
          callBackValue={this.handleCallbackGlobalBlame.bind(this)} //callBackValue={this.handleCallbackBlame.bind(this)}
          initialValue={this.state.blameInitial} //                  initialValue={this.state.blameInitial}
        />
          <br />
          <br />
        </center>
        How motivated were you to win points for yourself vs the other player?
        <br />
        <br/>
        <center>
          <MotivationSlider.MotivationSlider
          callBackValue={this.handleCallbackMotivation.bind(this)} 
          initialValue={this.state.MotivationInitial} //                 
        />
          </center>
        </span>
      </div>
    );


let astronautImage; 
//if (this.state.blockNum === 1) {
  astronautImage = this.state.astronaut_purple;
//} else if (this.state.blockNum === 2) {
//  astronautImage = this.state.astronaut;
//}

let instruct_text6 = (
  <div>
    <span>
      You have completed {this.state.blockNum} out of{" "}
      {this.state.blockNumTotal} blocks!
      <br />
      <br />
      You can now pause for a break. In the next block you will be paired with a <strong>different</strong> player whose Prolific ID ends with the following 4 digits: <strong>{prolific}</strong>
      <br />
      <br />
      <center>
        <img src={astronautImage} width={180} alt="astronaut" />
      </center>
      <br/>
      <br/>
      Player 2 will be informed of the shared points and bonus won after you finish the task.
      <br/>
      <br/>
      <br/>
      <center>
        Press the [<strong>SPACEBAR</strong>] when you are ready to
        continue.
      </center>
    </span>
  </div>
);

    let instruct_text7 = (
      <div>
        <span>
          Amazing!
          <br />
          <br />
          You have completed sorting through all of the battery cards!
          <br />
          <br />
          After going through the last {this.state.trialNumInBlock} pairs of battery cards how often do you think you chose correctly compared to the <strong>last</strong> player?
          <br />
          <br />
          <center>
          <BlameSliderGlobal.BlameSliderGlobal
          callBackValue={this.handleCallbackGlobalBlame.bind(this)} //callBackValue={this.handleCallbackBlame.bind(this)}
          initialValue={this.state.blameInitial} //                  initialValue={this.state.blameInitial}
        />
        </center>
        <br />
        <br/>
        How motivated were you to win points for yourself vs the other player??
        <br />
        <br/>
        <center>
          <MotivationSlider.MotivationSlider
          callBackValue={this.handleCallbackMotivation.bind(this)} 
          initialValue={this.state.MotivationInitial} //                 
        />
        </center>
          <br />
          <br />
          <center>
            Press the [<strong>SPACEBAR</strong>] to continue.
          </center>
        </span>
      </div>
    );

    let instruct_text8 = (
      <div>
        <span>
          Whew! Our spaceship power is now back to a good level, thanks to the
          high charge battery cards that you have selected. 
            <br/>
            You and other players have earned a bonus of £{this.state.perBonus} each!
          <br />
          <br />
          <center>
            Press the [<strong>SPACEBAR</strong>] to continue.
          </center>
        </span>
      </div>
    );

    switch (instructNum) {
      case 1:
        return <div>{instruct_text1}</div>;
      case 2:
        return <div>{instruct_text2}</div>;
      case 3:
        return <div>{instruct_text3}</div>;
      case 4:
        return <div>{instruct_text4}</div>;
      case 5:
        return <div>{instruct_text5}</div>;
      case 6:
        return <div>{instruct_text6}</div>;
      case 7:
        return <div>{instruct_text7}</div>;
      case 8:
        return <div>{instruct_text8}</div>;
    }
  }

  quizText(quizState) {
    let quiz_text1 = (
      <div>
        <center>
          Before we begin, out of {this.state.trialNumTotal} set pairs of
          battery cards, how many times do you think you will choose the higher
          charge battery card correctly?
        </center>
        <br />
        <br />
        <br />
        <br />
        <center>
          <ConfSliderGlobal.ConfSliderGlobal
            callBackValue={this.handleCallbackConf.bind(this)}
            initialValue={this.state.confInitial}
          />
        </center>
        <br />
        <br />
        <br />
        <br />
        <center>
          Click or drag the indicator anywhere on the scale.
          <br />
          <br />
          Press [SPACEBAR] to submit your answer and start sorting the battery
          cards.
          <br />
          <br />
          You will not be allowed to move on unless you have adjusted the scale.
        </center>
      </div>
    );

    let quiz_text2 = (
      <div>
        <center>
          After going through all the {this.state.trialNumTotal} set pairs of
          battery cards, how many times do you think you selected all the higher
          charge battery cards correctly?
        </center>
        <br />
        <br />
        <br />
        <br />
        <center>
          <ConfSliderGlobal.ConfSliderGlobal
            callBackValue={this.handleCallbackConf.bind(this)}
            initialValue={this.state.confInitial}
          />
        </center>
        <br />
        <br />
        <br />
        <br />
        <center>
          Press [SPACEBAR] to continue.
          <br />
          <br />
          You will not be allowed to move on unless you have adjusted the scale.
        </center>
      </div>
    );

    switch (quizState) {
      case "pre":
        return <div>{quiz_text1}</div>;
      case "post":
        return <div>{quiz_text2}</div>;
      default:
    }
  }

  quizBegin() {
    document.removeEventListener("keyup", this._handleInstructKey);
    document.removeEventListener("keyup", this._handleBeginKey);
    document.removeEventListener("keyup", this._handleGlobalBlameKey);
    document.addEventListener("keyup", this._handleGlobalConfKey);

    //randomise the pre-post initial conf value - this has changed to a scale of 0 to 150
    var initialValue = utils.randomInt(60, 90);
    var confTimeInitial = Math.round(performance.now());

    //  console.log("Begining quiz");
    //  console.log("initialValue: " + initialValue);

    this.setState({
      confInitial: initialValue,
      confLevel: null,
      confTimeInitial: confTimeInitial,
      confTime: null,
      //  confMove: null,
      quizScreen: true,
      instructScreen: false,
      taskScreen: false,
      taskSection: "rating",
    });
  }


  renderGlobalBlame() {
    document.removeEventListener("keyup", this._handleGlobalConfKey);
    document.removeEventListener("keyup", this.handleResp);
    document.removeEventListener("keyup", this.handleConfResp);
    document.removeEventListener("keyup", this._handleBlameKey);
    document.addEventListener("keyup", this._handleGlobalBlameKey);


    //randomise the pre-post initial conf value - this has changed to a scale of 0 to 150
    var initialValue = utils.randomInt(60, 90);
    var blameTimeInitial = Math.round(performance.now());

    this.setState({
      blameInitial: initialValue,
      MotivationInitial: initialValue,
      motivationLevel: null,
      globalBlameLevel: null,
      blameTimeInitial: blameTimeInitial,
      blameTime: null,
      globalBlameTime: null,
      //  confMove: null,
      quizScreen: false,
      instructScreen: true,
      taskScreen: false,
    });

  }

  taskBegin() {
    // remove access to left/right/space keys for the instructions
    document.removeEventListener("keyup", this._handleInstructKey);
    document.removeEventListener("keyup", this._handleBeginKey);
    // push to render fixation for the first trial
            
    setTimeout(
      function () {
        this.trialReset();
      }.bind(this),
      0
    );
  }

  taskEnd() {
    this.setState({
      instructScreen: true,
      taskScreen: false,
      quizScreen: false,
      instructNum: 7, //6
      taskSection: null,
    });
  }

  //////////////////////////////////////////////////////////////////////////////////
  // FOUR COMPONENTS OF THE TASK, Fixation, Stimulus/Response, Feedback and Confidence
  trialReset() {
    var trialNum = this.state.trialNum + 1; //trialNum is 0, so it starts from 1
    var trialNumInBlock = this.state.trialNumInBlock + 1;

    var stimPos = this.state.stimPosList[trialNum - 1]; //shuffle the order for the dotDiffLeft

    //  console.log("NEW TRIAL");
    // run staircase
    var s2 = staircase.staircase(
      this.state.dotStair,
      this.state.responseMatrix,
      this.state.stairDir,
      trialNum
    );

    var dotStair = s2.diff;
    var stairDir = s2.direction;
    var responseMatrix = s2.stepcount;

    //  console.log("dotsStair: " + dotStair);
    //  console.log("stairDir: " + stairDir);
    //  console.log("responseMat: " + responseMatrix);

    var reversals;
    if (s2.reversal) {
      // Check for reversal. If true, add one to reversals variable
      reversals = 1;
    } else {
      reversals = 0;
    }

    var dotDiffLeft;
    var dotDiffRight;
    var dotStairLeft;
    var dotStairRight;

    if (stimPos === 1) {
      dotStairLeft = dotStair;
      dotStairRight = 0;
      dotDiffLeft = Math.round(Math.exp(dotStairLeft));
      dotDiffRight = dotStairRight; //should be 0
    } else {
      dotStairLeft = 0;
      dotStairRight = dotStair;
      dotDiffLeft = dotStairLeft; //should be 0
      dotDiffRight = Math.round(Math.exp(dotStairRight));
    }

    //Reset all parameters
    this.setState({
      instructScreen: false,
      taskScreen: true,
      quizScreen: false,
      trialNum: trialNum,
      trialNumInBlock: trialNumInBlock,
      taskSection: "iti",
      fixTime: 0,
      stimTime: 0,
      responseKey: 0,
      respTime: 0,
      respFbTime: 0,
      confInitial: null,
      blameInitial: null,
      confLevel: null,
      blameLevel: null,
      confTime: 0,
      blameTime: 0,
      //  confMove: false,
      choice: null,
      correct: null,
      correctPer: null,
      stimPos: stimPos,
      reversals: reversals,
      stairDir: stairDir,
      responseMatrix: responseMatrix,
      //Calculate the for the paramters for the stim
      dotDiffStim1: Math.round(Math.exp(dotStair)),
      dotDiffStim2: 0,
      dotStair: dotStair,

      dotStairLeft: dotStairLeft,
      dotStairRight: dotStairRight,
      dotDiffLeft: dotDiffLeft,
      dotDiffRight: dotDiffRight,
    });

    setTimeout(
      function () {
        this.renderFix();
      }.bind(this),
      0
    );
  }

  renderFix() {
    //console.log("trialNumInBlock Fix: " + this.state.trialNumInBlock);

    var trialTime = Math.round(performance.now());
    //  console.log("render fix");
    //Show fixation
    this.setState({
      //  instructScreen: false,
      //  taskScreen: true,
      taskSection: "fixation",
      trialTime: trialTime,
    });

    setTimeout(
      function () {
        this.renderStim();
      }.bind(this),
      this.state.fixTimeLag
    );
  }

  //////////////////////////////////////////////////////////////////////////////////////////////
  renderStim() {
    var fixTime = Math.round(performance.now()) - this.state.trialTime;
    //  console.log("render stim");
    this.setState({
      instructScreen: false,
      taskScreen: true,
      taskSection: "stimulus",
      fixTime: fixTime,
    });

    setTimeout(
      function () {
        this.renderChoice();
      }.bind(this),
      this.state.stimTimeLag
    );
  }

  //////////////////////////////////////////////////////////////////////////////////////////////
  renderChoice() {
    document.addEventListener("keyup", this._handleRespKey);
    var stimTime =
      Math.round(performance.now()) -
      [this.state.trialTime + this.state.fixTime];

    this.setState({
      //  instructScreen: false,
      //  taskScreen: true,
      taskSection: "choice",
      stimTime: stimTime,
    });
  }

  //////////////////////////////////////////////////////////////////////////////////////////////
  renderChoiceFb() {
    document.removeEventListener("keyup", this._handleRespKey);

    this.setState({
      //    instructScreen: false,
      //    taskScreen: true,
      taskSection: "choiceFeedback",
    });

    setTimeout(
      function () {
        this.renderConfScale();
      }.bind(this),
      this.state.respFbTimeLag
    );
  }

  //////////////////////////////////////////////////////////////////////////////////////////////
  renderConfScale() {
    document.addEventListener("keyup", this._handleConfRespKey);

    var initialValue = utils.randomInt(70, 80);

    var respFbTime =
      Math.round(performance.now()) -
      [
        this.state.trialTime +
          this.state.fixTime +
          this.state.stimTime +
          this.state.respTime,
      ];

    this.setState({
      //      instructScreen: false,
      //      taskScreen: true,
      taskSection: "confidence",
      confInitial: initialValue,
      respFbTime: respFbTime,
    });

   

    // it will deploy the next trial with spacebar keypress
  }

  renderBlame() {
    document.addEventListener("keyup", this._handleBlameKey);

    var initialValue = utils.randomInt(40, 80);

    var blameTime = 
      Math.round(performance.now()) -
      [
        this.state.trialTime +
          this.state.fixTime +
          this.state.stimTime +
          this.state.respTime +
          this.state.respFbTime,
      ];

      this.setState({
        taskSection: "blame",
        blameInitial: initialValue,
        blameTime: blameTime,
      });

  }

  

  renderTaskSave() {
    document.removeEventListener("keyup", this._handleBlameKey); //_handleConfRespKey

    //  console.log("trialNumInBlock Save: " + this.state.trialNumInBlock);

    var prolificID = this.state.prolificID;

    let saveString = {
      prolificID: this.state.prolificID,
      condition: this.state.condition,
      userID: this.state.userID,
      date: this.state.date,
      startTime: this.state.startTime,
      section: this.state.section,
      sectionTime: this.state.sectionTime,
      trialNum: this.state.trialNum,
      blockNum: this.state.blockNum,
      trialNumInBlock: this.state.trialNumInBlock,
      trialTime: this.state.trialTime,
      fixTime: this.state.fixTime,
      stimTime: this.state.stimTime,
      stimPos: this.state.stimPos,
      dotDiffLeft: this.state.dotDiffLeft,
      dotDiffRight: this.state.dotDiffRight,
      dotDiffStim1: this.state.dotDiffStim1,
      dotDiffStim2: this.state.dotDiffStim2,
      responseKey: this.state.responseKey,
      respTime: this.state.respTime,
      respFbTime: this.state.respFbTime,
      blameTime: this.state.blameTime,
      choice: this.state.choice,
      confInitial: this.state.confInitial,
      confLevel: this.state.confLevel,
      blameLevel: this.state.blameLevel, 
      blameInitial: this.state.blameInitial, //Aleya: added to make it save to backend
      confTime: this.state.confTime,
      correct: this.state.correct,
      correctMat: this.state.correctMat,
      correctPer: this.state.correctPer,
      orderValue: this.state.orderValue,
      perBonus: this.state.perBonus,

      // staircase parameters
      responseMatrix: this.state.responseMatrix,
      reversals: this.state.reversals,
      stairDir: this.state.stairDir,
      dotStair: this.state.dotStair,

      dotStairLeft: this.state.dotStairLeft,
      dotStairRight: this.state.dotStairRight,
    };

    try {
      fetch(`${DATABASE_URL}/per_task_data/` + prolificID, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(saveString),
      });
    } catch (e) {
      console.log("Cant post?");
    }

    //  console.log("trialNum: " + this.state.trialNum);
    //  console.log("trialNumPerBlock: " + this.state.trialNumPerBlock);
    //  console.log("trialNumInBlock: " + this.state.trialNumInBlock);
    //  console.log("trialNumTotal: " + this.state.trialNumTotal);

    if (this.state.trialNumInBlock === this.state.trialNumPerBlock) {
      //and not the last trial, because that will be sent to trialReset to end the task
      //  console.log("TIME FOR A BREAK");
      if (this.state.trialNum !== this.state.trialNumTotal) {
        //      console.log("REST TIME");
        setTimeout(
          function () {
            this.restBlock();
          }.bind(this),
          10
        );
      } else if (this.state.trialNum === this.state.trialNumTotal) {
        // have reached the end of the task
        //    console.log("END TASK");
        setTimeout(
          function () {
            this.taskEnd();
          }.bind(this),
          10
        );
      }
    } else if (this.state.trialNumInBlock !== this.state.trialNumPerBlock) {
      //  console.log("CONTINUE TIME");
      setTimeout(
        function () {
          this.trialReset();
        }.bind(this),
        10
      );
    } else {
      console.log("ERROR I HAVENT ACCOUNTED FOR");
    }
  }

  renderQuizSave() {
    document.removeEventListener("keyup", this._handleGlobalConfKey);
    var prolificID = this.state.prolificID;
    var task = "perception";

    let saveString = {
      prolificID: this.state.prolificID,
      condition: this.state.condition,
      task: task,
      userID: this.state.userID,
      date: this.state.date,
      orderValue: this.state.orderValue,
      startTime: this.state.startTime,
      section: this.state.section,
      sectionTime: this.state.sectionTime,
      quizState: this.state.quizState,
      //  confTimeInitial: this.state.confTimeInitial,
      //  confTime: this.state.confTime,
      confInitial: this.state.confInitial,
      confLevel: this.state.confLevel,
    };

    console.log(saveString);

    try {
      fetch(`${DATABASE_URL}/pre_post_conf/` + prolificID, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(saveString),
      });
    } catch (e) {
      console.log("Cant post?");
    }

    if (this.state.quizState === "pre") {
      // begin the task
      //  console.log("BEGIN");
      setTimeout(
        function () {
          this.taskBegin();
        }.bind(this),
        10
      );
    } else if (this.state.quizState === "post") {
      //return to instructions
      this.setState({
        instructScreen: true,
        taskScreen: false,
        quizScreen: false,
        instructNum: 8, //7
        taskSection: null,
      });
    }
  }


renderBreakSave() {
  document.removeEventListener("keyup", this._handleGlobalBlameKey);
  var prolificID = this.state.prolificID;
  var task = "perception";

  let saveString = {
    prolificID: this.state.prolificID,
    condition: this.state.condition,
    task: task,
    userID: this.state.userID,
    date: this.state.date,
   // orderValue: this.state.orderValue,
    startTime: this.state.startTime,
    section: this.state.section,
    sectionTime: this.state.sectionTime,
    blockNum: this.state.blockNum,
    //  confTimeInitial: this.state.confTimeInitial,
    //  confTime: this.state.confTime,
    blameInitial: this.state.blameInitial,
    globalBlameLevel: this.state.globalBlameLevel,
    MotivationInitial: this.state.MotivationInitial,
    motivationLevel: this.state.motivationLevel,
  };

  console.log(saveString);

  try {
    fetch(`${DATABASE_URL}/global_blame/` + prolificID, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(saveString),
    });
  } catch (e) {
    console.log("Cant post?");
  }

  /*
  setTimeout(
      function () {
        this.taskBegin();
      }.bind(this),
      10
    ); */

    
    if (this.state.trialNumInBlock === this.state.trialNumPerBlock) {
      //and not the last trial, because that will be sent to trialReset to end the task
      //  console.log("TIME FOR A BREAK");
      if (this.state.trialNum !== this.state.trialNumTotal) {
        //      console.log("REST TIME");
        /*setTimeout(
          function () {
            this.restBlock();
          }.bind(this),
          10
        );*/
        //return to instructions
        console.log("test works");

        this.setState({
          instructNum: 6, 
      });



      setTimeout(
        function() {
          this.handleBegin();
          }.bind(this),
          10
      );

      } else if (this.state.trialNum === this.state.trialNumTotal) {
      //(this.state.trialNum === this.state.trialNumTotal) {
        // have reached the end of the task
        //    console.log("END TASK");
        console.log("test works 2");

        this.setState({

        quizState: "post",
        })


        setTimeout(
          function () {
            this.quizBegin();
          }.bind(this),
          10
        );

        /*
        setTimeout(
          function () {
            this.taskEnd();
          }.bind(this),
          10
        );*/
      }
    } 
    /*else if (this.state.trialNumInBlock !== this.state.trialNumPerBlock) {
      //  console.log("CONTINUE TIME");
      setTimeout(
        function () {
          this.trialReset();
        }.bind(this),
        10
      );
    } */ else {
      console.log("ERROR I HAVENT ACCOUNTED FOR");
    }
    

}


restBreak() {
  this.setState({
    instructScreen: true,
    taskScreen: false,
    instructNum: 6, 
    taskSection: "break",
});
}


  restBlock() {
    
    this.setState({
      instructNum: 5,
      instructScreen: true,
      taskScreen: false,
      quizScreen: false,
      taskScreen: false,
      taskSection: "break",
    });

    
    setTimeout(
      function () {
        this.renderGlobalBlame();
      }.bind(this),
      10
    );

  }

  redirectToNextTask() {
    document.removeEventListener("keyup", this._handleInstructKey);
    document.removeEventListener("keyup", this._handleBeginKey);
    document.removeEventListener("keyup", this._handleBlameKey );
    document.removeEventListener("keyup", this._handleGlobalBlameKey );
    document.removeEventListener("keyup", this._handleGlobalConfKey );


    var condition = this.state.condition;
    var perCorrectPer = this.state.correctPer;
    var memCorrectPer = this.state.memCorrectPer;
    var perBonus = this.state.perBonus;

    var condUrl;
    if (condition === 1) {
      //Sent to memory task for part 2
      condUrl = "/MemPreTut?PROLIFIC_PID=";
    } else {
      //Sent to insight page
      condUrl = "/End?PROLIFIC_PID=";
    }

    this.props.navigate(condUrl + this.state.prolificID, {
      state: {
        prolificID: this.state.prolificID,
        userID: this.state.userID,
        condition: this.state.condition,
        date: this.state.date,
        orderValue: this.state.orderValue,
        startTime: this.state.startTime,
        perCorrectPer: perCorrectPer,
        memCorrectPer: memCorrectPer,
        perBonus: perBonus,
      },
    });
  }

  componentDidMount() {
    window.scrollTo(0, 0);
    document.body.style.overflow = "hidden";
  }

  ///////////////////////////////////////////////////////////////
  render() {
    let text;
    if (this.state.debug === false) {
      if (
        this.state.instructScreen === true &&
        this.state.taskScreen === false &&
        this.state.quizScreen === false
      ) {
        document.addEventListener("keyup", this._handleInstructKey);
        document.addEventListener("keyup", this._handleBeginKey);
        text = <div> {this.instructText(this.state.instructNum)}</div>;
        //    console.log("Page: " + this.state.instructNum);
      } else if (
        this.state.instructScreen === false &&
        this.state.taskScreen === false &&
        this.state.quizScreen === true &&
        this.state.taskSection === "rating"
      ) {
        text = <div> {this.quizText(this.state.quizState)}</div>;
        //    console.log("Quiz state: " + this.state.quizState);
      } else if (
        this.state.instructScreen === false &&
        this.state.quizScreen === false &&
        this.state.taskScreen === true &&
        this.state.taskSection === "iti"
      ) {
        text = <div className={style.boxStyle}></div>;
      } else if (
        this.state.instructScreen === false &&
        this.state.quizScreen === false &&
        this.state.taskScreen === true &&
        this.state.taskSection === "fixation"
      ) {
        text = (
          <div className={style.boxStyle}>
            <DrawFix />
          </div>
        );
      } else if (
        this.state.instructScreen === false &&
        this.state.quizScreen === false &&
        this.state.taskScreen === true &&
        this.state.taskSection === "stimulus"
      ) {
        text = (
          <div className={style.boxStyle}>
            <DrawDots.DrawDots
              dotRadius={this.state.dotRadius}
              dotDiffLeft={this.state.dotDiffLeft}
              dotDiffRight={this.state.dotDiffRight}
            />
          </div>
        );
      } else if (
        this.state.instructScreen === false &&
        this.state.quizScreen === false &&
        this.state.taskScreen === true &&
        this.state.taskSection === "choice"
      ) {
        text = (
          <div className={style.boxStyle}>
            <DrawBox />
          </div>
        );
      } else if (
        this.state.instructScreen === false &&
        this.state.quizScreen === false &&
        this.state.taskScreen === true &&
        this.state.taskSection === "choiceFeedback"
      ) {
        text = (
          <div className={style.boxStyle}>
            <DrawChoice.DrawChoice choice={this.state.choice} />
          </div>
        );
      } else if (
        this.state.instructScreen === false &&
        this.state.quizScreen === false &&
        this.state.taskScreen === true &&
        this.state.taskSection === "confidence"
      ) {
        text = (
          <div>
            <center>
              Rate your confidence on the probability that your choice was
              correct. 
            </center>
            <br />
            <br />
            <br />
            <br />
            <center>
              <ConfSlider.ConfSlider
                callBackValue={this.handleCallbackConf.bind(this)}
                initialValue={this.state.confInitial}
              />
            </center>
            <br />
            <br />
            <br />
            <br />
            <center>
              Press [SPACEBAR] to continue.
              <br />
              <br />
              You will not allowed to move on unless you have adjusted the
              scale.
            </center>
          </div>
        );
      } else if (
        this.state.instructScreen === false &&
        this.state.quizScreen === false &&
        this.state.taskScreen === true &&
        this.state.taskSection === "blame"
      )
      {
        if (this.state.blame === 1) {
          //console.log("here 1");
          this.state.blameLevel = 200;
          let points;
          if (this.state.blockNum == 1) {
            points = this.state.pointCounter[0] 
            } else if (this.state.blockNum == 2) {
              points = this.state.pointCounter[1]
            } //else if (this.state.blockNum == 3) {
              //points = this.state.pointCounter[2]
            //} //changed

          text = (<div>
            <center>
            You both made the correct choice. 
            <br />
           <strong> + 1 Point </strong>
            <br/>
            <br/>
            </center>
              <br />
              <br />
              <br />
              <center>
                Press [SPACEBAR] to continue.
                <br />
              </center>
              </div> 
          );

        } else if (this.state.blame === 2) {
          //console.log("here 2");
          this.state.blameLevel = 200;
          let points;
          if (this.state.blockNum == 1) {
            points = this.state.pointCounter[0] //change this
            } else if (this.state.blockNum == 2) {
              points = this.state.pointCounter[1]
            } //else if (this.state.blockNum == 3) {
              //points = this.state.pointCounter[2]
            //} //changed
          text = (<div>
            <center>
            You both made the wrong choice. 
            <br />
            <strong> - 1 Point </strong>
            <br/>
            <br/>
            </center>
              <br />
              <br />
              <br />
              <center>
                Press [SPACEBAR] to continue.
                <br />
              </center>
              </div> 
          );

        } else if (this.state.blame === 3) {
          //console.log("here 3");
          let points;
          if (this.state.blockNum == 1) {
            points = this.state.pointCounter[0] //change this
            } else if (this.state.blockNum == 2) {
              points = this.state.pointCounter[1]
            } //else if (this.state.blockNum == 3) {
              //points = this.state.pointCounter[2]
            //} //changed
          text = (
            <div>
              <center>
              One of you has chosen the wrong battery card. 
              <br/>
            <br/>
            <br/>
            <br/>
              Rate how likely it is that the other player chose wrongly.  
              <br />
              <br />
              </center>
              <br />
              <br />
              <br />
              <center>
                <BlameSlider.BlameSlider
                  callBackValue={this.handleCallbackBlame.bind(this)} //callBackValue={this.handleCallbackBlame.bind(this)}
                  initialValue={this.state.blameInitial} //                  initialValue={this.state.blameInitial}
                />
              </center>
              <br />
              <br />
              <center>
                When you are ready, please press the [<strong>SPACEBAR</strong>] to continue.
            <br />
          </center>
            </div>
          );         

        }
        
    } else if (this.state.debug === true) {
      document.addEventListener("keyup", this._handleDebugKey);
      text = (
        <div>
          <p>
            <span>DEBUG MODE</span>
            <br />
            <span>
              Press [<strong>SPACEBAR</strong>] to skip to next section.
            </span>
          </p>
        </div>
      );
    } else {
      console.log("ERROR CAN'T FIND THE RIGHT PAGE");
      return null;
    }

    return (
      <div className={style.bg}>
        <div className={style.textFrame}>
          <div className={style.fontStyle}>{text}</div>
        </div>
      </div>
    );
  }
}
}

export default withRouter(PerTask);
