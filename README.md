# NodeMCU Arcade

## Introduction

**I wanted to build a "physical" gaming device that:**
* Had it's only input to be a joystick
* Could provide a simple foundation out of the box for developing web games
* Didn't require an existing WiFi network - it's portable anywhere

**The project will out of the box:**
* Create a WiFi network on the NodeMCU
* Start a webserver on the NodeMCU
* Start a websocket server on the NodeMCU
* Embed [p5.js](https://p5js.org) in the website

The project includes two example games:
* "Echa sketch"
* Snake (default)

## Installation

### PlatformIO

It's not a requirement, but I highly recommend you using PlatformIO when working with this project. You can read all about it over at http://platformio.org/

### Node.js dependencies

1) Install node.js (https://nodejs.org/en/)
2) Navigate in to the `/web` directory and install node dependencies.

`npm install`

### Gulp

In order to build the web project and embed it into the NodeMCU application code, the tool Gulp is used to inline, minify and compress everything into one single array of bytes (that is automatically included in the c++ code).

https://gulpjs.com/

## Usage

### Play a game

* Join the WiFi network that the NodeMCU is hosting
* Use a web browser to navigate to the IP address of the NodeMCU

### Game selection

Make sure the JavaScript-game file you want to run is the only `*.js` file in the directory (you can make gulp ignore files by changing the extension to something else than .js)

### Deployment

Whenever you make a change in the web project, run `gulp`, and re-deploy the c++ code on to the NodeMCU.

### Writing a new game

Create a new `.js`-file in the `/web/site` directory and make sure it's the only `.js`-file (change the extension on the currently "selected" `.js`-file).

Boilerplate code (that's utilizing the p5.js library) would look something like this:

```javascript
function setup() {
  // Setup the WebSocket connection and handle events from the joystick
  socket = new WebSocket("ws://" + document.location.hostname + "/ws");
  socket.onmessage = function(event) {
    var e = JSON.parse(event.data);
    if (e.event == "move") {
      var x = e.x;
      var y = e.y;
      // ...
    } else if (e.event == "button-down") {
      // ...
    }
  }
}

function draw() {
  // Handle drawing
}
```

For more information about working with the the p5.js library, check out https://p5js.org
