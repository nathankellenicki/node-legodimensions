const {EventEmitter} = require("events"),
      HID = require("node-hid"),
      debug = require("debug")("LegoDimensions");


const minifigData = require("../data/minifigs.json");
const Minifig = {};

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
    FADE: 0xc2,
    SET_COLOR: 0xc0,
    FLASH: 0xc3
}


class Callback {

    constructor (type, callback) {
        this.type = type;
        this.callback = callback;
    }

}


class EmitPayload {

    constructor (panel, sig, recognised) {
        this.panel = panel;
        this.sig = sig;
        this.recognised = recognised;
    }

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

                const type = data[0],
                    cmd = data[1];

                if (type === Type.EVENT && cmd == Command.ACTION) {

                    const action = data[5],
                        sig = ToyPad._bufferToHexString(data.slice(7, 13));

                    const emitPayload = new EmitPayload(data[2], sig, !!minifigData[sig]);

                    if (action == Action.ADD) {
                        this.emit("add", emitPayload);
                    } else if (action == Action.REMOVE) {
                        this.emit("remove", emitPayload);
                    }

                } else if (type === Type.RESPONSE) {

                    if (cmd == Command.CONNECTED) {
                        this.emit("connect");
                        return;
                    }

                    const length = data[1],
                        requestId = data[2],
                        payload = data.slice(3, 2 + length);

                    this._processCallback(requestId, payload);

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
        const params = [
            (panel - 1) & 0xff
        ];
        this._send(Request.GET_COLOR, params, callback);
    }


    _getColorResponse (callback, data) {
        let color = data[2];
        color += data[1] << 8;
        color += data[0] << 16;
        callback(null, color);
    }


    setColor (panel, color, callback) {
        const params = [
            panel & 0xff,
            (color >> 16) & 0xff,
            (color >> 8) & 0xff,
            color & 0xff
        ];
        this._send(Request.SET_COLOR, params, callback);
    };


    flash (panel, color, count, options = {}, callback) {
        options.offTicks = options.offTicks || 10;
        options.onTicks = options.onTicks || 10;
        const params = [
            panel & 0xff,
            options.offTicks & 0xff,
            options.onTicks & 0xff,
            count & 0xff,
            (color >> 16) & 0xff,
            (color >> 8) & 0xff,
            color & 0xff
        ];
        this._send(Request.FLASH, params, callback);
    };


    fade (panel, speed, cycles, color, callback) {
        const params = [
            panel & 0xff,
            speed & 0xff,
            cycles & 0xff,
            (color >> 16) & 0xff,
            (color >> 8) & 0xff,
            color & 0xff
        ];
        this._send(Request.FADE, params, callback);
    }


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


    _processCallback (requestId, payload) {
        const callback = this._callbacks[requestId];
        if (callback) {
            delete this._callbacks[requestId];
            switch (callback.type) {
                case Request.GET_COLOR:
                    this._getColorResponse(callback.callback, payload);
                    break;
                default:
                    callback.callback(null);
                    break;
            }
        }
    }


    _send (type, params, callback) {
        const requestId = (++this._requestId) & 0xff;
        if (callback) {
            this._callbacks[requestId] = new Callback(type, callback);
        }
        this._device.write(ToyPad._pad(ToyPad._checksum([Type.RESPONSE, (params.length + 2) & 0xff, type, requestId].concat(params))));
    }


}


module.exports = ToyPad;