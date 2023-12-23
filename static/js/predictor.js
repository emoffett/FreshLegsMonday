// Register the PWA (Progressive Web App) service worker
if ('serviceWorker' in navigator) {
   navigator.serviceWorker.register("/serviceworker.js");
}

let crApp = {};
const oneMile = 1.608;

crApp.tanda = function(distance, pace) {
  // 'distance' is the distance ran per week over the previous 8 weeks in km
  // 'pace' is the average pace at which this distance was run in seconds per km
  // Calculate a marathon time prediction from the weekly distance and pace ran based on the Tanda equation
  return 42.195 * (17.1 + 140.0 * Math.exp(-0.0053 * distance) + 0.55 * pace);
}

crApp.tandaPace = function (time, distance) {  // seconds, km
  return (time / 42.195 - 140 * Math.exp(-0.0053 * distance) - 17.1) / 0.55;
}

crApp.junkPace = function (distance, pace) {  // km, seconds/km
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

  const weeklyPaceRange = document.getElementById("weeklyPaceRange");
  const weeklyPaceSpan = document.getElementById("weeklyPaceSpan");
  const incrementPaceButton = document.getElementById("incrementPaceButton");
  const decrementPaceButton = document.getElementById("decrementPaceButton");

  const weeklyTimeValue = document.getElementById("weeklyTimeValue");
  const junkPaceValue = document.getElementById("junkPaceValue");

  const sliderButtons = document.getElementsByClassName("btn-slider");
  let mouseHeld = false;
  const startEvents = ['touchstart', 'mousedown'];
  const endEvents = ['touchend', 'touchcancel', 'mouseup', 'mouseleave'];

  const milesCheckbox = document.getElementById("miles");
  let miles = milesCheckbox.checked;
  let distanceInKm = miles ? oneMile : 1;
  let distanceUnit = miles ? "mile" : "km";
  let distanceUnits = miles ? "miles" : "km";
  let weeklyDistance = weeklyDistanceRange.value;
  let weeklyPace = weeklyPaceRange.value;

  let update = function() {
    if (miles !== milesCheckbox.checked) changeUnits();
    tandaPrediction.innerText = crApp.secondsToHms(crApp.tanda(weeklyDistance*distanceInKm, weeklyPace/distanceInKm));
    weeklyDistanceSpan.innerHTML = weeklyDistance + distanceUnits;
    weeklyPaceSpan.innerText = crApp.secondsToHms(weeklyPace) + "/" + distanceUnit;
    weeklyTimeValue.innerText = crApp.secondsToHms(weeklyDistance * weeklyPace);
    junkPaceValue.innerText = crApp.secondsToHms(crApp.junkPace(weeklyDistance*distanceInKm, weeklyPace/distanceInKm) * distanceInKm) + "/" + distanceUnit;
    crApp.tandaSpace.render();
  }

  function changeUnits() {
    miles = milesCheckbox.checked;
    distanceInKm = miles ? oneMile : 1;
    distanceUnit = miles ? "mile" : "km";
    distanceUnits = miles ? "miles" : "km"
    /* Note, ordering of min, max and value setting matter to avoid the min/max limits affecting the value before/after
     it is set */
    if (miles) {
      weeklyDistanceRange.min = 25;
      weeklyDistance = Math.round(weeklyDistanceRange.value / oneMile);
      weeklyDistanceRange.value = weeklyDistance;
      weeklyDistanceRange.max = 150;
      weeklyPaceRange.max = 720;
      weeklyPace = Math.round(weeklyPaceRange.value * oneMile)
      weeklyPaceRange.value = weeklyPace;
      weeklyPaceRange.min = 320;
    } else {  // km
      weeklyDistanceRange.max = 240;
      weeklyDistance = Math.round(weeklyDistanceRange.value * oneMile);
      weeklyDistanceRange.value = weeklyDistance;
      weeklyDistanceRange.min = 40;
      weeklyPaceRange.min = 200;
      weeklyPace = Math.round(weeklyPaceRange.value / oneMile)
      weeklyPaceRange.value = weeklyPace;
      weeklyPaceRange.max = 450;
    }
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

  // Add listeners for both mouse and touch events
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

crApp.tandaSpace = function () {
  const tandaSpace = document.getElementById("tandaGraph");
  const width = tandaSpace.width.baseVal.value;  // SVG pixels
  const height = tandaSpace.height.baseVal.value;  // SVG pixels
  let xmax = 240;  // Weekly distance in km
  let xmin = 40;  // Weekly distance in km
  let ymax = 450;  // Pace in s/km
  let ymin = 200;  // Pace in s/km
  let step = 1;  // Length between calculations in km

  function render() {
    let newNodes = [];
    newNodes.push(guides());
    newNodes.push(tandaPoint(document.getElementById("weeklyDistanceRange").value, document.getElementById("weeklyPaceRange").value));
    newNodes.push(tandaLines());
    tandaSpace.replaceChildren(...newNodes);
  }

  function windowX(v) {
    v = v - xmin;
    v = v / (xmax - xmin);
    v = v * width;
    return v;
  }
  function windowY(v) {
    v = v - ymin;
    v = v / (ymax - ymin);
    v = v * height;
    return v;
  }

  function tandaPoint(distance, pace){
    const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    circle.setAttribute("class", "tanda-point");
    circle.setAttribute("cx", windowX(distance));
    circle.setAttribute("cy", windowY(pace));
    circle.setAttribute("r", "5");
    return circle;
  }

  function tandaLines(){
    const lines = document.createElementNS("http://www.w3.org/2000/svg", "g");
    for (let t = 2; t <= 7; t += 0.5) {
      const time = t * 60 * 60;

      let points = [];
      for (let x = xmin; x < xmax; x += step) {
        const y = crApp.tandaPace(time, x);
        points.push({x, y});
      }

      points = points.map(p => ({
        x: windowX(p.x),
        y: windowY(p.y),
      }));

      const pathData = ["M"];
      pathData.push(points[0].x.toFixed(2), points[0].y.toFixed(2));
      for (let i = 1; i < points.length; i++) {
        pathData.push("L", points[i].x.toFixed(2), points[i].y.toFixed(2));
      }
      const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
      path.setAttribute("class", "tanda-line");
      path.setAttribute("d", pathData.join(" "));
      lines.append(path);

      const label = document.createElementNS("http://www.w3.org/2000/svg", "text");
      label.setAttribute("class", "tanda-label");
      label.setAttribute("y", `${windowY(crApp.tandaPace(time, xmax)) + 12}`);
      label.setAttribute("x", `${windowX(xmax)}`)
      label.textContent = crApp.secondsToHms(time);
      lines.append(label);
    }
    return lines;
  }

  function guides() {
    const guides = document.createElementNS("http://www.w3.org/2000/svg", "g");
    for (let p = Math.ceil((ymin+1)/60)*60; p < ymax; p += 60) {
      const guide = document.createElementNS("http://www.w3.org/2000/svg", "path");
      guide.setAttribute("class", "guide");
      guide.setAttribute("d", `M0,${windowY(p)} H${width}`);
      guides.append(guide);
      const label = document.createElementNS("http://www.w3.org/2000/svg", "text");
      label.setAttribute("class", "guide-label");
      label.setAttribute("y", `${windowY(p) - 2}`);  // The "-2" puts the label above the guide
      label.textContent = crApp.secondsToHms(p) + "/km";
      guides.append(label);
    }
    for (let d = Math.ceil((xmin+1)/50)*50; d < xmax; d += 50) {
      const guide = document.createElementNS("http://www.w3.org/2000/svg", "path");
      guide.setAttribute("class", "guide");
      guide.setAttribute("d", `M${windowX(d)},0 V${height}`);
      guides.append(guide);
      const label = document.createElementNS("http://www.w3.org/2000/svg", "text");
      label.setAttribute("class", "guide-label");
      label.setAttribute("y", `${windowY(ymax) - 2}`);
      label.setAttribute("x", `${windowX(d) + 1}`);
      label.textContent = d + "km";
      guides.append(label);
    }
    return guides;
  }

  return {
    render: render,
  };
}();

window.addEventListener("load", () => {
  crApp.predictor.update();
});

