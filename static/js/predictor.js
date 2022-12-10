// Register the PWA (Progressive Web App) service worker
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

  const tandaSliders = document.getElementsByClassName("tandaSlider");

  const weeklyDistanceRange = document.getElementById("weeklyDistanceRange");
  const weeklyDistanceSpan = document.getElementById("weeklyDistanceSpan");
  const decrementDistanceButton = document.getElementById("decrementDistanceButton");
  const incrementDistanceButton = document.getElementById("incrementDistanceButton");
  let weeklyDistance = weeklyDistanceRange.value; // in km

  const weeklyPaceRange = document.getElementById("weeklyPaceRange");
  const weeklyPaceSpan = document.getElementById("weeklyPaceSpan");
  const incrementPaceButton = document.getElementById("incrementPaceButton");
  const decrementPaceButton = document.getElementById("decrementPaceButton");
  let weeklyPace = weeklyPaceRange.value; // in seconds per km

  const weeklyTimeValue = document.getElementById("weeklyTimeValue");
  const junkPaceValue = document.getElementById("junkPaceValue");

  const sliderButtons = document.getElementsByClassName("btn-slider");
  let mouseHeld = true;
  const startEvents = ['touchstart', 'mousedown'];
  const endEvents = ['touchend', 'touchcancel', 'mouseup', 'mouseleave'];

  const milesCheckbox = document.getElementById("miles");
  let miles = milesCheckbox.checked;

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

  // Repeatedly update the tanda prediction while a user holds down a button
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

  // Add both mouse and touch events to be
  function addMultipleEventListeners(element, events, handler) {
    events.forEach(e => element.addEventListener(e, handler))
  }

  /* Slider listeners: */
  for (const slider of tandaSliders) {
    slider.addEventListener("input", () => {
      weeklyDistance = weeklyDistanceRange.value;
      weeklyPace = weeklyPaceRange.value;
      update();
    });
  }

  /* Button listeners: */
  addMultipleEventListeners(decrementDistanceButton, startEvents, event => {
    event.preventDefault();
    mousePressed(function () {
      weeklyDistance--;
      weeklyDistanceRange.value = weeklyDistance;
    });
  });

  addMultipleEventListeners(incrementDistanceButton, startEvents, event => {
    event.preventDefault();
    mousePressed(function () {
      weeklyDistance++;
      weeklyDistanceRange.value = weeklyDistance;
    });
  });

  addMultipleEventListeners(incrementPaceButton, startEvents, event => {
    event.preventDefault();
    mousePressed(function () {
      weeklyPace++;
      weeklyPaceRange.value = weeklyPace;
    });
  });

  addMultipleEventListeners(decrementPaceButton, startEvents, event => {
    event.preventDefault();
    mousePressed(function () {
      weeklyPace--;
      weeklyPaceRange.value = weeklyPace;
    });
  });

  for (const button of sliderButtons) {
    // stop any mousePressed activity when the mouse/touch is lifted/moved off of the button
    addMultipleEventListeners(button, endEvents, () => mouseHeld = false);
    // stop the context menu appearing when the button is held down
    button.addEventListener('contextmenu', (event) => event.preventDefault())
  }

  // Parts that should be accessed externally
  return {
    update: update,
  };
}();

window.addEventListener("load", () => {
  crApp.predictor.update();
});
