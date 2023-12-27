// Register the PWA (Progressive Web App) service worker
if ('serviceWorker' in navigator) {
   navigator.serviceWorker.register("/serviceworker.js");
}

function DistanceUnit(inKm, unit, units, weeklyShortest, weeklyFurthest, fastest, slowest) {
  this.inKM = inKm;
  this.unit = unit;
  this.units = units;
  this.weeklyShortest = weeklyShortest;
  this.weeklyFurthest = weeklyFurthest;
  this.fastest = fastest;
  this.slowest = slowest;
}

const km = new DistanceUnit(1, "km", "km", 40, 240, 200, 450);
const mile = new DistanceUnit(1.608, "mile", "miles", 25, 150, 320, 720);

let crApp = {
  distanceUnit: km,
  weeklyDistance: 160,
  weeklyPace: 300,
};

crApp.tanda = function(distance, pace) {
  // 'distance' is the distance ran per week over the previous 8 weeks in km
  // 'pace' is the average pace at which this distance was run in seconds per km
  // Calculate a marathon time prediction in seconds from the weekly distance and pace ran based on the Tanda equation
  return 42.195 * (17.1 + 140.0 * Math.exp(-0.0053 * distance) + 0.55 * pace);
}

crApp.tandaPace = function (time, distance) {
  // 'time' in seconds for a marathon
  // 'distance' is the distance ran per week over the previous 8 weeks in km
  // Calculate how fast to run in seconds/km based on the Tanda equation
  return (time / 42.195 - 140 * Math.exp(-0.0053 * distance) - 17.1) / 0.55;
}

crApp.junkPace = function (distance, pace) {  // km, seconds/km
  const speed = 3600/pace;
  const dailyKm = distance/7;
  return ((1+dailyKm)/(1390/(98.5 *(Math.exp(-dailyKm*7/189)-Math.exp(-(dailyKm+1)*7/189))+1390/speed))-dailyKm/speed)*60*60;
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
  const startEvents = ['touchstart', 'mousedown'];
  const endEvents = ['touchend', 'touchcancel', 'mouseup', 'mouseleave'];

  const milesCheckbox = document.getElementById("miles");

  let mouseHeld = false;

  let update = function() {
    if (milesCheckbox.checked !== (crApp.distanceUnit === mile)) {
      changeUnits(milesCheckbox.checked ? mile : km);
    }

    tandaPrediction.innerText = crApp.secondsToHms(
      crApp.tanda(crApp.weeklyDistance*crApp.distanceUnit.inKM, crApp.weeklyPace/crApp.distanceUnit.inKM)
    );
    weeklyDistanceSpan.innerHTML = crApp.weeklyDistance + crApp.distanceUnit.units;
    weeklyPaceSpan.innerText = crApp.secondsToHms(crApp.weeklyPace) + "/" + crApp.distanceUnit.unit;
    weeklyTimeValue.innerText = crApp.secondsToHms(crApp.weeklyDistance * crApp.weeklyPace);
    junkPaceValue.innerText = crApp.secondsToHms(
      crApp.junkPace(crApp.weeklyDistance*crApp.distanceUnit.inKM, crApp.weeklyPace/crApp.distanceUnit.inKM)
      * crApp.distanceUnit.inKM
    ) + "/" + crApp.distanceUnit.unit;
    crApp.tandaSpace.render();
  }

  function changeUnits(newUnit) {
    const oldUnit = crApp.distanceUnit;
    const newDistance = Math.round(crApp.weeklyDistance * oldUnit.inKM / newUnit.inKM);
    const newPace = Math.round(crApp.weeklyPace / oldUnit.inKM * newUnit.inKM);
    /* Note, ordering of min, max and value setting matter to avoid the min/max limits affecting the value before/after
     it is set */
    weeklyDistanceRange.min = newUnit.weeklyShortest;
    weeklyDistanceRange.max = newUnit.weeklyFurthest;
    weeklyPaceRange.max = newUnit.slowest;
    weeklyPaceRange.min = newUnit.fastest;
    crApp.weeklyDistance = newDistance;
    weeklyDistanceRange.value = crApp.weeklyDistance;
    crApp.weeklyPace = newPace;
    weeklyPaceRange.value = crApp.weeklyPace;
    crApp.distanceUnit = newUnit;
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
      crApp.weeklyDistance = weeklyDistanceRange.value;
      crApp.weeklyPace = weeklyPaceRange.value;
      update();
    });
  }

  /* Button listeners: */
  addMultipleEventListeners(decrementDistanceButton, startEvents, event => {
    event.preventDefault();
    mousePressed(function () {
      crApp.weeklyDistance--;
      weeklyDistanceRange.value = crApp.weeklyDistance;
    });
  });

  addMultipleEventListeners(incrementDistanceButton, startEvents, event => {
    event.preventDefault();
    mousePressed(function () {
      crApp.weeklyDistance++;
      weeklyDistanceRange.value = crApp.weeklyDistance;
    });
  });

  addMultipleEventListeners(incrementPaceButton, startEvents, event => {
    event.preventDefault();
    mousePressed(function () {
      crApp.weeklyPace++;
      weeklyPaceRange.value = crApp.weeklyPace;
    });
  });

  addMultipleEventListeners(decrementPaceButton, startEvents, event => {
    event.preventDefault();
    mousePressed(function () {
      crApp.weeklyPace--;
      weeklyPaceRange.value = crApp.weeklyPace;
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
  const step = 1;  // Length between calculations in distance units

  function render() {
    let newNodes = [];
    newNodes.push(guides());
    newNodes.push(tandaPoint(crApp.weeklyDistance, crApp.weeklyPace));
    newNodes.push(tandaLines());
    tandaSpace.replaceChildren(...newNodes);
  }

  function windowX(v) {
    v = v - crApp.distanceUnit.weeklyShortest;
    v = v / (crApp.distanceUnit.weeklyFurthest - crApp.distanceUnit.weeklyShortest);
    v = v * width;
    return v;
  }
  function windowY(v) {
    v = v - crApp.distanceUnit.fastest;
    v = v / (crApp.distanceUnit.slowest - crApp.distanceUnit.fastest);
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
    for (let t = 2; t <= 7; t += 0.5) {  // t is in hours
      const time = t * 60 * 60;  // time is in seconds
      let points = [];

      for (let x = crApp.distanceUnit.weeklyShortest; x < crApp.distanceUnit.weeklyFurthest; x += step) {
        const y = crApp.tandaPace(time, x*crApp.distanceUnit.inKM)*crApp.distanceUnit.inKM;
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
      const rightAxisCrossing = crApp.tandaPace(time, crApp.distanceUnit.weeklyFurthest*crApp.distanceUnit.inKM)*crApp.distanceUnit.inKM;
      label.setAttribute("y", `${windowY(rightAxisCrossing) + 12}`);
      label.setAttribute("x", `${windowX(crApp.distanceUnit.weeklyFurthest)}`)
      label.textContent = crApp.secondsToHms(time);
      lines.append(label);
    }
    return lines;
  }

  function guides() {
    const guides = document.createElementNS("http://www.w3.org/2000/svg", "g");
    const secondsBetweenGuides = 60;
    const topGuide = Math.ceil((crApp.distanceUnit.fastest+1)/secondsBetweenGuides)*secondsBetweenGuides;
    const distanceBetweenGuides = 50;
    const leftGuide = Math.ceil((crApp.distanceUnit.weeklyShortest+1)/distanceBetweenGuides)*distanceBetweenGuides;

    for (let p = topGuide; p < crApp.distanceUnit.slowest; p += secondsBetweenGuides) {
      const guide = document.createElementNS("http://www.w3.org/2000/svg", "path");
      guide.setAttribute("class", "guide");
      guide.setAttribute("d", `M0,${windowY(p)} H${width}`);
      guides.append(guide);
      const label = document.createElementNS("http://www.w3.org/2000/svg", "text");
      label.setAttribute("class", "guide-label");
      label.setAttribute("y", `${windowY(p) - 2}`);  // The "-2" puts the label above the guide
      label.textContent = crApp.secondsToHms(p) + "/" + crApp.distanceUnit.unit;
      guides.append(label);
    }

    for (let d = leftGuide; d < crApp.distanceUnit.weeklyFurthest; d += 50) {
      const guide = document.createElementNS("http://www.w3.org/2000/svg", "path");
      guide.setAttribute("class", "guide");
      guide.setAttribute("d", `M${windowX(d)},0 V${height}`);
      guides.append(guide);
      const label = document.createElementNS("http://www.w3.org/2000/svg", "text");
      label.setAttribute("class", "guide-label");
      label.setAttribute("y", `${windowY(crApp.distanceUnit.slowest) - 2}`);
      label.setAttribute("x", `${windowX(d) + 1}`);
      label.textContent = d + crApp.distanceUnit.unit;
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
