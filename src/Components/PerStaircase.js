// two down one up staircase to reach about 70%

// Note that we only call check_reversal when there was a step up or step down
function checkReversal(dir) {
  if (dir[0] !== dir[1])
    // If the direction two trials ago is NOT the same direction as the last trial, then there was a reversal
    return true;
  // If the direction two trials ago and the last trial are the same direction, no reversal
  else return false;
}

var curInstructNum = this.state.instructNum;
    var whichButton = keyPressed;

    if (whichButton === 3 && curInstructNum === 4) {
      const results1 = [];
      const results2 = [];
      const results3 = [];


    for (let i = 0; i < this.state.trialNumPerBlock; i++) {
        
        const randomValue = Math.random();

        if (randomValue < this.state.PlayerProbsOrder[0]) {
            results1.push(1);
        } else {
            results1.push(0);
        }
    }
    for (let i = 0; i < this.state.trialNumPerBlock; i++) {
        
      const randomValue = Math.random();

      if (randomValue < this.state.PlayerProbsOrder[1]) {
          results2.push(1);
      } else {
          results2.push(0);
      }
  }
  for (let i = 0; i < this.state.trialNumPerBlock; i++) {
        
    const randomValue = Math.random();

    if (randomValue < this.state.PlayerProbsOrder[2]) {
        results3.push(1);
    } else {
        results3.push(0);
    }
}

export function staircase(dotDiff, prevTrialPerf, dir, trialNum) {
  var back1 = prevTrialPerf[prevTrialPerf.length - 1]; // Last trial
  var back2 = prevTrialPerf[prevTrialPerf.length - 2]; // Two trials ago
  var reverse = false; // Initialize reversal to false

  if (back1) {
    // If the last trial was correct
    if (back2) {
      // AND two trials ago were correct
      if (trialNum < 7) dotDiff -= 0.8;
      // for 0==trial and for the second half of the practice
      else if (trialNum > 6 && trialNum < 12) dotDiff -= 0.4;
      // for the first 5 trials of the practice
      else if (trialNum > 11) dotDiff -= 0.2;
      // for next 5 trials of the practice

      // changes the last trial to incorrect
      // so if previous two trials were correct and the staircase increased difficulty
      // it needs two more trials again before it lowers again in value
      prevTrialPerf[prevTrialPerf.length - 1] = false;

      dir[0] = dir[1]; // Set the direction two trials ago to the direction one trial ago
      dir[1] = "up"; // Set the direction one trial ago to up
      reverse = checkReversal(dir); // Check if there was a reversal in direction as a result of the step down
    }
    // If the last trial was correct and two trials ago were wrong, do nothing.
  } // If the last trial was wrong
  else {
    if (trialNum < 7) dotDiff += 0.8;
    // for 0==trial and for the second half of the practice
    else if (trialNum > 6 && trialNum < 12) dotDiff += 0.4;
    // for the first 5 trials of the practice
    else if (trialNum > 11) dotDiff += 0.2;
    // for next 5 trials of the practice

    dir[0] = dir[1]; // Set the direction two trials ago to the direction one trial ago
    dir[1] = "down"; // Set the direction one trial ago to down
    reverse = checkReversal(dir); // Check if there was a reversal in direction as a result of the step up
  }

  // Set limits on dots_diff s.t. it remains in the range of [0,50] inclusive
  //if (dots_diff >= 4.25)
  //  dots_diff = 4.25;
  if (dotDiff <= 1) dotDiff = 1;

  var output = {
    diff: dotDiff,
    direction: dir,
    reversal: reverse,
    stepcount: prevTrialPerf,
  };

  return output;
}

