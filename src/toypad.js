const EventEmitter = require("events").EventEmitter,
      HID = require("node-hid"),
      debug = require("debug")("LegoDimensions");


const minifigData = require("../data/minifigs.json");
let Minifig = {};

Object.keys(minifigData).forEach((sig) => {
    Minifig[minifigData[sig].toUpperCase().replace(/\W+/g, "_")] = sig;
});


const Action = {
    ADD: 0,
    REMOVE: 1
};


const Type = {
    RESPONSE: 0x55,
    EVENT: 0x56
}


const Command = {
    CONNECTED: 0x19,
    ACTION: 0x0b
};


const Panel = {
    ALL: 0,
    CENTER: 1,
    LEFT: 2,
    RIGHT: 3
};


const Request = {
    GET_COLOR: 0xc1,
    SET_COLOR: 0xc0,
    FLASH: 0xc3
}


class ToyPad extends EventEmitter {


    constructor () {
        super();
        this._device = null;
        this._requestId = 0;
        this._callbacks = {};
    }


    static get Panel () {
        return Panel;
    }


    static get Minifig () {
        return Minifig;
    }


    static minifigNameFromSignature (sig) {
        if (minifigData[sig]) {
            return minifigData[sig];
        } else {
            return null;
        }
    }


    static _bufferToHexString (buf) {
        let str = "";
        for (let i = 0; i < buf.length; i++) {
            str +=
                ((buf[i] >> 4) & 0xf).toString(16) +
                (buf[i] & 0xf).toString(16) +
                " ";
        }
        return str.trim();
    }


    static _checksum (data) {
        let checksum = 0;
        for (let i = 0; i < data.length; i++) {
            checksum += data[i];
        }
        data.push(checksum & 0xff);
        return data;
    }


    static _pad (data) {
        while (data.length < 31) {
            data.push(0x00);
        }
        return data;
    }


    connect () {

        try {

            this._device = new HID.HID(3695, 577);

            this._device.on("data", (data) => {

                let type = data[0],
                    cmd = data[1];

                if (type === Type.RESPONSE && cmd == Command.CONNECTED) {
                    this.emit("connect");
                } else if (type === Type.EVENT && cmd == Command.ACTION) {

                    let action = data[5],
                        sig = ToyPad._bufferToHexString(data.slice(7, 13));

                    let emitPayload = {
                        panel: data[2],
                        sig: sig,
                        recognized: !!minifigData[sig]
                    };

                    if (action == Action.ADD) {
                        this.emit("add", emitPayload);
                    } else if (action == Action.REMOVE) {
                        this.emit("remove", emitPayload);
                    }

                } else if (type === Type.RESPONSE) {
                    
                }

            });

            this._device.on("error", (err) => {
                this.emit("error", err);
            });

            this._wake();

        } catch (err) {
            this.emit("error");
        }

    }


    getColor (panel, callback) {
        let data = [
            this._requestId++ & 0xff,
            (panel - 1) & 0xff
        ];
        this._send([(data.length + 1) & 0xff, Request.GET_COLOR].concat(data), callback);
    }


    setColor (panel, color, callback) {
        let data = [
            this._requestId++ & 0xff,
            panel & 0xff,
            (color >> 16) & 0xff,
            (color >> 8) & 0xff,
            color & 0xff
        ];
        this._send([(data.length + 1) & 0xff, Request.SET_COLOR].concat(data), callback);
    };


    flash (panel, color, count, options = {}, callback) {
        options.offTicks = options.offTicks || 10;
        options.onTicks = options.onTicks || 10;
        let data = [
            this._requestId++ & 0xff,
            panel & 0xff,
            options.offTicks & 0xff,
            options.onTicks & 0xff,
            count & 0xff,
            (color >> 16) & 0xff,
            (color >> 8) & 0xff,
            color & 0xff
        ];
        this._send([(data.length + 1) & 0xff, Request.FLASH].concat(data), callback);
    };


    _wake () {
        this._device.write([0x00,
            0x55, 0x0f, 0xb0, 0x01,
            0x28, 0x63, 0x29, 0x20,
            0x4c, 0x45, 0x47, 0x4f,
            0x20, 0x32, 0x30, 0x31,
            0x34, 0xf7, 0x00, 0x00,
            0x00, 0x00, 0x00, 0x00,
            0x00, 0x00, 0x00, 0x00,
            0x00, 0x00, 0x00, 0x00]);
    }


    _send (data, callback) {
        if (callback) {
            this._callbacks[data[3]] = callback;
        }
        this._device.write(ToyPad._pad(ToyPad._checksum([Type.RESPONSE].concat(data))));
    }


}


module.exports = ToyPad;