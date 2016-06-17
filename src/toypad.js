let EventEmitter = require("events").EventEmitter,
    HID = require("node-hid");


const minifigData = require("../data/minifigs.json");
let Minifig = {};

Object.keys(minifigData).forEach((sig) => {
    Minifig[minifigData[sig].toUpperCase().replace(/\W+/g, "_")] = sig;
});


const Action = {
    ADD: 0,
    REMOVE: 1
};


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


class ToyPad extends EventEmitter {


    constructor () {
        super();
        this._device = null;
        this._requestId = 0;
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
            return `Unknown - ${sig}`;
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
        data.push(checksum & 0xFF);
        return data;
    }


    static _pad (data) {
        while (data.length < 32) {
            data.push(0x00);
        }
        return data;
    }


    connect () {

        try {

            this._device = new HID.HID(3695, 577);

            this._device.on("data", (data) => {

                let cmd = data[1];

                if (cmd == Command.CONNECTED) {
                    this.emit("connect");
                } else if (cmd == Command.ACTION) {

                    let action = data[5];

                    let emitPayload = {
                        panel: data[2],
                        sig: ToyPad._bufferToHexString(data.slice(7, 13))
                    };

                    if (action == Action.ADD) {
                        this.emit("add", emitPayload);
                    } else if (action == Action.REMOVE) {
                        this.emit("remove", emitPayload);
                    }

                }

            });

            this._device.on("error", (err) => {
                this.emit(err);
            });

            // Wake the Toy Pad
            this._device.write([0x00,
                0x55, 0x0f, 0xb0, 0x01,
                0x28, 0x63, 0x29, 0x20,
                0x4c, 0x45, 0x47, 0x4f,
                0x20, 0x32, 0x30, 0x31,
                0x34, 0xf7, 0x00, 0x00,
                0x00, 0x00, 0x00, 0x00,
                0x00, 0x00, 0x00, 0x00,
                0x00, 0x00, 0x00, 0x00]);

        } catch (err) {
            this.emit("error");
        }

    }


    setColor (panel, color, speed = 1) {
        let data = [
            this._requestId & 0xff,
            panel,
            ((1 - speed) * 0xff) & 0xff,
            0x01, (color >> 16) & 0xff,
            (color >> 8) & 0xff,
            color & 0xff
        ];
        this._requestId++;
        this._write([0x55, 0x08, 0xc2].concat(data));
    };


    _write (data) {
        this._device.write([0x00].concat(ToyPad._pad(ToyPad._checksum(data))));
    }


}


module.exports = ToyPad;