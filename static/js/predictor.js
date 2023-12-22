// Register the PWA (Progressive Web App) service worker
if ('serviceWorker' in navigator) {
   navigator.serviceWorker.register("/serviceworker.js");
}

let crApp = {};
const oneMile = 1.608;

/* Calculate a marathon time prediction from the weekly distance and pace ran based on the Tanda equation */
crApp.tanda = function(distance, pace) {
  // 'distance' is the distance ran per week over the previous 8 weeks in km
  // 'pace' is the average pace at which this distance was run in seconds per km
  return 42.195 * (17.1 + 140.0 * Math.exp(-0.0053 * distance) + 0.55 * pace);
}

crApp.junkPace = function (distance, pace) {  // km, seconds
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

window.addEventListener("load", () => {
  crApp.predictor.update();
});

// https://dev.to/ndesmic/graphing-with-web-components-n3d
class TandaSpace extends HTMLElement {
  #points = [];
  #width = 480;  // SVG pixels
  #height = 240;  // SVG pixels
  #xmax = 240;  // Weekly distance in km
  #xmin = 40;  // Weekly distance in km
  #ymax = 450;  // Pace in s/km
  #ymin = 200;  // Pace in s/km
  #step = 1;  // Length between calculations in km
  #continuous = false;
  #thickness = 1;
  #defaultSize = 1;
  #defaultColor = "#008800"

  static observedAttributes = ["points", "func", "step", "width", "height", "xmin", "xmax", "ymin", "ymax", "default-shape", "default-size", "default-color", "continuous", "thickness"];
  constructor() {
      super();
      this.bind(this);
  }
  bind(element) {
      element.attachEvents.bind(element);
  }
  render() {
    if(!this.shadowRoot){
        this.attachShadow({ mode: "open" });
    }
    this.innerHTML = "";
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("width", this.#width);
    svg.setAttribute("height", this.#height);
    svg.append(this.background());
    svg.append(this.guides());

    svg.append(this.tandaPoint(100, 300));
    for (let time = 2; time <= 7; time += 0.5) {
      svg.append(this.tandaLine(time * 60 * 60));
    }

    this.shadowRoot.append(svg);
  }

  windowX(v) {  // x is pixels from left
    v = v - this.#xmin;
    v = v / (this.#xmax - this.#xmin);
    v = v * this.#width;
    return v;
  }
  windowY(v) {  // y is pixels from top
    v = v - this.#ymin;
    v = v / (this.#ymax - this.#ymin);
    v = v * this.#height;
    return v;
  }

  attachEvents() {

  }
  connectedCallback() {
    this.render();
    this.attachEvents();
  }
  attributeChangedCallback(name, oldValue, newValue) {
    this[hyphenCaseToCamelCase(name)] = newValue;
  }

  tandaPoint(distance, pace){
    const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    circle.setAttribute("cx", this.windowX(distance));
    circle.setAttribute("cy", this.windowY(pace));
    circle.setAttribute("r", 5);
    circle.setAttribute("fill", this.#defaultColor);
    return circle;
  }

  tandaLine(time){
    let points = [];
    for (let x = this.#xmin; x < this.#xmax; x += this.#step) {
      const y = (time/42.195 - 140*Math.exp(-0.0053 * x) - 17.1)/0.55;  // y is pace (s/km), x is distance (km)
      points.push({x, y, color: this.#defaultColor, size: this.#defaultSize});
    }

    points = points.map(p => ({
      x: this.windowX(p.x),
      y: this.windowY(p.y),
      color: p.color,
      size: p.size,
    }));

    const pathData = ["M"];
    pathData.push(points[0].x.toFixed(2), points[0].y.toFixed(2));
    for (let i = 1; i < points.length; i++) {
        pathData.push("L", points[i].x.toFixed(2), points[i].y.toFixed(2));
    }
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("fill", "none");
    path.setAttribute("stroke-width", this.#thickness);
    path.setAttribute("stroke", this.#defaultColor);
    path.setAttribute("d", pathData.join(" "));
    return path;
  }

  guides() {
    const guides = document.createElementNS("http://www.w3.org/2000/svg", "path");
    guides.setAttribute("stroke-width", 1.0);
    guides.setAttribute("stroke", "black");
    guides.setAttribute("d", `M0,${this.#height} H${this.#width} M0,0 V${this.#height}`);
    return guides;
  }

  background(){
    const background = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    background.setAttribute("width", this.#width);
    background.setAttribute("height", this.#height);
    background.setAttribute("fill", "white");
    return background;
  }
}

function hyphenCaseToCamelCase(text) {
  return text.replace(/-([a-z])/g, g => g[1].toUpperCase());
}

customElements.define("tanda-graph", TandaSpace);
