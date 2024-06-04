// two down one up staircase to reach about 70%

// Note that we only call check_reversal when there was a step up or step down
function checkReversal(dir) {
  if (dir[0] !== dir[1])
    // If the direction two trials ago is NOT the same direction as the last trial, then there was a reversal
    return true;
  // If the direction two trials ago and the last trial are the same direction, no reversal
  else return false;
}

export function staircase(dotDiff, prevTrialPerf, dir, trialNum) {
  var back1 = prevTrialPerf[prevTrialPerf.length - 1];
  var back2 = prevTrialPerf[prevTrialPerf.length - 2];
  var reverse = false;

  if (back1) {
    // If the last trial was correct
    if (back2) {
      // Decrease difficulty for correct trials
      if (trialNum < 7) dotDiff -= 0.2;
      else if (trialNum > 6 && trialNum < 12) dotDiff -= 0.1;
      else if (trialNum > 11) dotDiff -= 0.05;
      prevTrialPerf[prevTrialPerf.length - 1] = false;
      dir[0] = dir[1];
      dir[1] = "up";
      reverse = checkReversal(dir);
    }
  } else {
    // If the last trial was wrong
    // Increase difficulty for incorrect trials
    if (trialNum < 7) dotDiff += 0.2;
    else if (trialNum > 6 && trialNum < 12) dotDiff += 0.1;
    else if (trialNum > 11) dotDiff += 0.05;
    dir[0] = dir[1];
    dir[1] = "down";
    reverse = checkReversal(dir);
  }

  // Set limits on dotDiff to remain in the range [0, 50]
  if (dotDiff <= 1) dotDiff = 1;

  var output = {
    diff: dotDiff,
    direction: dir,
    reversal: reverse,
    stepcount: prevTrialPerf,
  };

  return output;
}

