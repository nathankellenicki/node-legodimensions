let ToyPad = require("./src/toypad.js");

let toyPad = new ToyPad();

toyPad.on("connect", () => {
    console.log("Toy Pad connected");
});

toyPad.on("error", () => {
    console.log("Toy Pad connection error");
});

toyPad.on("add", (data) => {
    let name = ToyPad.minifigNameFromSignature(data.sig);
    console.log(`Minifig added to panel ${data.panel} (${name})`);
    if (data.panel == ToyPad.Panel.CENTER) {
        toyPad.setColor(data.panel, 0xffff44, 0.5);
    }
});

toyPad.on("remove", (data) => {
    let name = ToyPad.minifigNameFromSignature(data.sig);
    console.log(`Minifig removed from panel ${data.panel} (${name})`);
    if (data.panel == ToyPad.Panel.CENTER) {
        toyPad.setColor(data.panel, 0, 0.9);
    }
});

toyPad.connect();