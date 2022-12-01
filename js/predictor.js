if ('serviceWorker' in navigator) {
   navigator.serviceWorker.register("/serviceworker.js");
}

let crApp = {};

/* Calculate a marathon time prediction from the weekly distance and pace ran based on the Tanda equation */
crApp.tanda = function(distance, pace) {
  // 'distance' is the distance ran per week over the previous 8 weeks in km
  // 'pace' is the average pace at which this distance was run in seconds per km
  return 42.195 * (17.1 + 140.0 * Math.exp(-0.0053 * distance) + 0.55 * pace);
}

crApp.junkPace = function (distance, pace) {
  const speed = 3600/pace;
  const jdistance = distance/7;
  return ((1+jdistance)/(1390/(98.5 *(Math.exp(-jdistance*7/189)-Math.exp(-(jdistance+1)*7/189))+1390/speed))-jdistance/speed)*60*60;
}

/* Pretty print hours, minutes and seconds at a fixed character width */
crApp.secondsToHms = function(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor(seconds % 3600 / 60);
  const s = Math.floor(seconds % 3600 % 60);
  return ((h > 0 ? h + ":" + (m < 10 ? "0" : "") : "") + m + ":" + (s < 10 ? "0" : "") + s);
}

crApp.predictor = function() {
  /* private variables */
  const tandaPrediction = document.getElementById("tandaPrediction");

  const weeklyDistanceRange = document.getElementById("weeklyDistanceRange");
  const weeklyDistanceSpan = document.getElementById("weeklyDistanceSpan");
  let weeklyDistance = weeklyDistanceRange.value; // in km

  const weeklyPaceRange = document.getElementById("weeklyPaceRange");
  const weeklyPaceSpan = document.getElementById("weeklyPaceSpan");
  let weeklyPace = weeklyPaceRange.value; // in seconds per km

  const weeklyTimeValue = document.getElementById("weeklyTimeValue");
  const junkPaceValue = document.getElementById("junkPaceValue");

  const milesCheckbox = document.getElementById("miles");
  let miles = milesCheckbox.checked;

  let mouseHeld = true;


  let update = function() {
    miles = milesCheckbox.checked;

    tandaPrediction.innerText = crApp.secondsToHms(crApp.tanda(weeklyDistance, weeklyPace));

    weeklyDistanceSpan.innerHTML = miles ?
      (weeklyDistance/1.608).toFixed().toString().padStart(3, " ") + "miles" :
      weeklyDistance.toString().padStart(3, " ") + "km";

    weeklyPaceSpan.innerText = miles ?
      crApp.secondsToHms(weeklyPace * 1.608) + "/mile" :
      crApp.secondsToHms(weeklyPace) + "/km";

    weeklyTimeValue.innerText = crApp.secondsToHms(weeklyDistance * weeklyPace);

    junkPaceValue.innerText = miles ?
      crApp.secondsToHms(crApp.junkPace(weeklyDistance, weeklyPace) * 1.608) + "/mile" :
      crApp.secondsToHms(crApp.junkPace(weeklyDistance, weeklyPace)) + "/km";
  }

  let tandaSlider = function () {
    weeklyDistance = weeklyDistanceRange.value;
    weeklyPace = weeklyPaceRange.value;
    update();
  }


  /* Button functionality: */
  // stop any mousePressed activity
  let mouseRelease = function() {mouseHeld = false;}

  // repeatedly make changes at the correct rate while a user holds down a button
  let mousePressed = function(step) {
    let nextTime = 0;
    let delay = 100;
    mouseHeld = true;

    function runStep(time) {
      if (mouseHeld) {
        requestAnimationFrame(runStep);
      }
      if (time < nextTime) return;
      nextTime = time + delay;
      step();
      update();
    }
    // timeout delay makes it easier for a user to get just a single increment from a quick click
    setTimeout(function (){
      requestAnimationFrame(runStep);
    }, 150);
  }

  let decrementDistance = function() {
    mousePressed(function() {
      weeklyDistance--;
      weeklyDistanceRange.value = weeklyDistance;
    });
  }

  let incrementDistance = function() {
    mousePressed(function() {
      weeklyDistance++;
      weeklyDistanceRange.value = weeklyDistance;
    });
  }

  let incrementPace = function() {
    mousePressed(function() {
      weeklyPace++;
      weeklyPaceRange.value = weeklyPace;
    });
  }

  let decrementPace = function() {
    mousePressed(function() {
      weeklyPace--;
      weeklyPaceRange.value = weeklyPace;
    });
  }


  /* Make the following functions available to the webpage once it has loaded */
  return {
    update: update,
    tandaSlider: tandaSlider,
    mouseRelease: mouseRelease,
    decrementDistance: decrementDistance,
    incrementDistance: incrementDistance,
    incrementPace: incrementPace,
    decrementPace: decrementPace
  };
}();

window.addEventListener("load", () => {
    crApp.predictor.update();
});
