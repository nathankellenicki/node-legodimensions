const EventEmitter = require("events").EventEmitter,
      debugLog = require("debug")("LegoDimensions"),
      fs = require("fs");


const ToyPad = require("./src/toypad.js");


class LegoDimensions extends EventEmitter {


    constructor (config) {
        super();
    }


    wirethingInit () {
        let toyPad = new ToyPad();
        this.emit("discover", toyPad);
    }


    static get wirething () {
        return JSON.parse(fs.readFileSync(`${__dirname}/Wirefile`));
    }


}


module.exports = LegoDimensions;