// Register the PWA (Progressive Web App) service worker
if ('serviceWorker' in navigator) {
   navigator.serviceWorker.register("/serviceworker.js");
}

// The main predictor app
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

crApp.updateAll = function () {
  crApp.predictor.update();
  crApp.tandaSpace.render();
  crApp.splitsTable.update();
}

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
  const minutesPadding = m < 10 ? "0" : "";
  const secondsPadding = s < 10 ? "0" : "";
  return ((h > 0 ? h + ":" + minutesPadding : "") + m + ":" + secondsPadding + s);
}

crApp.addMultipleEventListeners = function(element, events, handler) {
  // Add listeners for both mouse and touch events
  events.forEach(e => element.addEventListener(e, handler))
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
  const milesCheckbox = document.getElementById("miles");

  const sliderButtons = document.getElementsByClassName("btn-slider");

  const startEvents = ['touchstart', 'mousedown'];
  const endEvents = ['touchend', 'touchcancel', 'mouseup', 'mouseleave'];
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
    weeklyDistanceRange.value = crApp.weeklyDistance;
    weeklyPaceRange.value = crApp.weeklyPace;
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

    crApp.tandaSpace.render();
    crApp.splitsTable.configure();
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
      crApp.updateAll();
    }
    // timeout delay makes it easier for a user to get just a single increment from a quick click
    setTimeout(function (){
      requestAnimationFrame(runStep);
    }, 150);
  }

  /* Slider listeners: */
  for (const slider of tandaSliders) {
    slider.addEventListener("input", () => {
      crApp.weeklyDistance = parseInt(weeklyDistanceRange.value);
      crApp.weeklyPace = parseInt(weeklyPaceRange.value);
      crApp.updateAll();
    });
  }

  /* Button listeners: */
  crApp.addMultipleEventListeners(decrementDistanceButton, startEvents, event => {
    event.preventDefault();
    mousePressed(function () {
      crApp.weeklyDistance--;
      weeklyDistanceRange.value = crApp.weeklyDistance;
    });
  });

  crApp.addMultipleEventListeners(incrementDistanceButton, startEvents, event => {
    event.preventDefault();
    mousePressed(function () {
      crApp.weeklyDistance++;
      weeklyDistanceRange.value = crApp.weeklyDistance;
    });
  });

  crApp.addMultipleEventListeners(incrementPaceButton, startEvents, event => {
    event.preventDefault();
    mousePressed(function () {
      crApp.weeklyPace++;
      weeklyPaceRange.value = crApp.weeklyPace;
    });
  });

  crApp.addMultipleEventListeners(decrementPaceButton, startEvents, event => {
    event.preventDefault();
    mousePressed(function () {
      crApp.weeklyPace--;
      weeklyPaceRange.value = crApp.weeklyPace;
    });
  });

  for (const button of sliderButtons) {
    // stop any mousePressed activity when the mouse/touch is lifted/moved off of the button
    crApp.addMultipleEventListeners(button, endEvents, () => mouseHeld = false);
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
  const step = 1;  // Length between calculations in distance units
  let width = tandaSpace.width.baseVal.value;  // SVG pixels
  let height = tandaSpace.height.baseVal.value;  // SVG pixels

  function render() {
    width = tandaSpace.width.baseVal.value;  // SVG pixels
    height = tandaSpace.height.baseVal.value;  // SVG pixels
    let newNodes = [];
    newNodes.push(createGuides());
    newNodes.push(createTandaPoint(crApp.weeklyDistance, crApp.weeklyPace));
    newNodes.push(createTandaLines());
    tandaSpace.replaceChildren(...newNodes);
  }

  function windowX(v) {  // Distance to pixels
    v = v - crApp.distanceUnit.weeklyShortest;
    v = v / (crApp.distanceUnit.weeklyFurthest - crApp.distanceUnit.weeklyShortest);
    v = v * width;
    return v;
  }
  function windowY(v) {  // Pace to pixels
    v = v - crApp.distanceUnit.fastest;
    v = v / (crApp.distanceUnit.slowest - crApp.distanceUnit.fastest);
    v = v * height;
    return v;
  }
  function inverseScaleX(v) {  // Pixels to distance - note: no offset for axis start
    v = v / width;
    v = v * (crApp.distanceUnit.weeklyFurthest - crApp.distanceUnit.weeklyShortest);
    return v;
  }
  function inverseScaleY(v) {  // Pixels to pace - note: no offset for axis start
    v = v / height;
    v = v * (crApp.distanceUnit.slowest - crApp.distanceUnit.fastest);
    return v;
  }

  function createTandaPoint(distance, pace){
    const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    circle.setAttribute("class", "tanda-point");
    circle.setAttribute("cx", windowX(distance));
    circle.setAttribute("cy", windowY(pace));
    circle.setAttribute("r", "15");

    function handleMoveEvent(event, pointStart, newX, newY){
      event.preventDefault();
      event.stopPropagation();
      let newWeeklyDistance = pointStart[2] + inverseScaleX(newX - pointStart[0]);
      if (newWeeklyDistance < crApp.distanceUnit.weeklyShortest) {newWeeklyDistance = crApp.distanceUnit.weeklyShortest;}
      if (newWeeklyDistance > crApp.distanceUnit.weeklyFurthest) {newWeeklyDistance = crApp.distanceUnit.weeklyFurthest;}
      let newWeeklyPace = pointStart[3] + inverseScaleY(newY - pointStart[1]);
      if (newWeeklyPace < crApp.distanceUnit.fastest) {newWeeklyPace = crApp.distanceUnit.fastest;}
      if (newWeeklyPace > crApp.distanceUnit.slowest) {newWeeklyPace = crApp.distanceUnit.slowest;}
      circle.setAttribute("cx", windowX(newWeeklyDistance));
      circle.setAttribute("cy", windowY(newWeeklyPace));
      crApp.weeklyDistance = Math.round(newWeeklyDistance);
      crApp.weeklyPace = Math.round(newWeeklyPace);
      crApp.predictor.update();
    }

    circle.addEventListener("touchstart", (event) => {
      event.preventDefault();
      event.stopPropagation();
      let pointStart = [event.targetTouches[0].clientX, event.targetTouches[0].clientY, crApp.weeklyDistance, crApp.weeklyPace];
      circle.addEventListener("touchmove", (e) => {
        handleMoveEvent(e, pointStart, e.targetTouches[0].clientX, e.targetTouches[0].clientY);
      });
      circle.addEventListener("touchend", ()=>{crApp.updateAll();});
      circle.addEventListener("touchcancel", ()=>{crApp.updateAll();});
    });

    circle.addEventListener("mousedown", (event) => {
      event.preventDefault();
      event.stopPropagation();
      let pointStart = [event.clientX, event.clientY, crApp.weeklyDistance, crApp.weeklyPace];
      circle.addEventListener("mousemove", (e) => {
        if (e.buttons) {
          handleMoveEvent(e, pointStart, e.clientX, e.clientY);
        } else {
          pointStart = [];
          crApp.updateAll();
        }
      });
      circle.addEventListener("mouseup", ()=>{crApp.updateAll();});
    });

    return circle;
  }

  function createTandaLines(){
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

  function createGuides() {
    const guides = document.createElementNS("http://www.w3.org/2000/svg", "g");
    const secondsBetweenGuides = 60;
    const topGuide = Math.ceil((crApp.distanceUnit.fastest+1)/secondsBetweenGuides)*secondsBetweenGuides;
    const distanceBetweenGuides = 50;
    const leftGuide = Math.ceil((crApp.distanceUnit.weeklyShortest+1)/distanceBetweenGuides)*distanceBetweenGuides;

    for (let pace = topGuide; pace < crApp.distanceUnit.slowest; pace += secondsBetweenGuides) {
      const guide = document.createElementNS("http://www.w3.org/2000/svg", "path");
      guide.setAttribute("class", "guide");
      guide.setAttribute("d", `M0,${windowY(pace)} H${width}`);
      guides.append(guide);
      const label = document.createElementNS("http://www.w3.org/2000/svg", "text");
      label.setAttribute("class", "guide-label");
      label.setAttribute("y", `${windowY(pace) - 2}`);  // The "-2" puts the label above the guide
      label.textContent = crApp.secondsToHms(pace) + "/" + crApp.distanceUnit.unit;
      guides.append(label);
    }

    for (let distance = leftGuide; distance < crApp.distanceUnit.weeklyFurthest; distance += 50) {
      const guide = document.createElementNS("http://www.w3.org/2000/svg", "path");
      guide.setAttribute("class", "guide");
      guide.setAttribute("d", `M${windowX(distance)},0 V${height}`);
      guides.append(guide);
      const label = document.createElementNS("http://www.w3.org/2000/svg", "text");
      label.setAttribute("class", "guide-label");
      label.setAttribute("y", `${windowY(crApp.distanceUnit.slowest) - 2}`);
      label.setAttribute("x", `${windowX(distance) + 1}`);
      label.textContent = distance + crApp.distanceUnit.unit;
      guides.append(label);
    }

    return guides;
  }

  return {
    render: render,
  };
}();

crApp.splitsTable = function (){
  const markersBody = document.getElementById("markersBody");
  const markers = new Map();  // marker, [distance, column, row]  (row 0 is the topmost row)

  function generateMarkers() {
    markersBody.innerHTML = "";
    markers.clear();

    // First column
    let marker = 1;
    let row = 0;
    while (marker * crApp.distanceUnit.inKM < 42.195 / 4 + 1) {
      markers.set(marker.toString(), [marker * crApp.distanceUnit.inKM, 0, row]);
      marker++;
      row++;
    }
    // Second column
    row = 0;
    while (marker * crApp.distanceUnit.inKM < 42.195 / 2) {
      markers.set(marker.toString(), [marker * crApp.distanceUnit.inKM, 1, row]);
      marker++;
      row++
    }
    markers.set("HM", [42.195 / 2, 1, row]);
    // Third column
    row = 0;
    while (marker * crApp.distanceUnit.inKM < 42.195 * (3/4) + 1) {
      markers.set(marker.toString(), [marker * crApp.distanceUnit.inKM, 2, row]);
      marker++;
      row++;
    }
    // Fourth column
    row = 0;
    while (marker * crApp.distanceUnit.inKM < 42.195) {
      markers.set(marker.toString(), [marker * crApp.distanceUnit.inKM, 3, row]);
      marker++;
      row++;
    }
    markers.set("Finish", [42.195, 3, row]);
  }

  function configureSplitsTable(){
    function addMarkerToTable(markerData, marker) {
      let row;
      // Add the row if the marker is in the first column, otherwise it already exists
      if (markerData[1] === 0) {
        row= markersBody.insertRow();
        row.setAttribute("id", "splitsRow" + markerData[2]);
      } else {
        row = document.getElementById("splitsRow" + markerData[2]);
        const spacerCell = row.insertCell();
        spacerCell.setAttribute("class", "spacing-column");
      }

      const distanceCell = row.insertCell();
      const distanceText = document.createTextNode(marker);
      distanceCell.appendChild(distanceText);
      distanceCell.setAttribute("class", "marker-column");

      const splitCell = row.insertCell();
      splitCell.setAttribute("id", "split" + marker);
      splitCell.setAttribute("class", "split split-column");
    }

    generateMarkers();
    markers.forEach(addMarkerToTable);
    updateSplitsTable();
  }

  function updateSplitsTable() {
    const prediction = crApp.tanda(crApp.weeklyDistance*crApp.distanceUnit.inKM, crApp.weeklyPace/crApp.distanceUnit.inKM);
    const timePerKm = prediction / 42.195;

    function updateSplit(markerData, marker) {
      const cell = document.getElementById("split" + marker);
      cell.innerText = crApp.secondsToHms(markerData[0] * timePerKm);
    }

    markers.forEach(updateSplit)
  }

  return {
    configure: configureSplitsTable,
    update: updateSplitsTable
  }
}();

// Initialise the main app and ensure that it is re-rendered on resize
window.addEventListener("load", () => {
  crApp.updateAll();
  crApp.splitsTable.configure();
  window.addEventListener("resize", () => {crApp.tandaSpace.render();});
});

// Add the store links and images, as appropriate, based on the available cookies
window.addEventListener("load", () => {
  const appPlatform = document.cookie
    .split("; ")
    .find((row) => row.startsWith("app-platform="))
    ?.split("=")[1];
  if (appPlatform === "iOS App Store" || appPlatform === "screenshot") {}  // in iOS or taking screenshots
  else {
    const resources = document.getElementById("resources");

    let pwaLi = document.createElement("li");
    pwaLi.innerHTML += "Get the free app on any device by opening the browser menu and selecting 'Install Fresh Legs Monday' <br>";
    pwaLi.id = "install-prompt";

    let playStoreLink = document.createElement("a");
    playStoreLink.href = "https://play.google.com/store/apps/details?id=com.freshlegsmonday.twa";
    playStoreLink.target = "_blank";
    playStoreLink.innerHTML += "<img class='external-icon' alt='Get it on Google Play' src='img/PlayStore/google-play-badge.png'>"
    pwaLi.append(playStoreLink);

    let appStoreLink = document.createElement("a");
    appStoreLink.href = "https://apps.apple.com/us/app/freshlegsmonday/id6479964123?itsct=apps_box_link&itscg=30200";
    appStoreLink.target = "_blank";
    appStoreLink.innerHTML += "<img class='external-icon' alt='Download on the App Store' src='img/AppleAppStore/apple-app-store.svg'>"
    pwaLi.append(appStoreLink);

    let microsoftStoreLink = document.createElement("a");
    microsoftStoreLink.href = "https://apps.microsoft.com/detail/9ppbnzgk4rxw?ocid=webpdpshare";
    microsoftStoreLink.target = "_blank";
    microsoftStoreLink.innerHTML += "<img class='external-icon' alt='Download from the Microsoft Store' src='img/MicrosoftStore/microsoft-store.svg'>"
    pwaLi.append(microsoftStoreLink);

    resources.prepend(pwaLi);
  }
});
