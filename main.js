let ToyPad = require("./src/toypad.js");

let toyPad = new ToyPad();

toyPad.on("connect", () => {
    console.log("Toy Pad connected");
    toyPad.setColor(ToyPad.Panel.CENTER, 0xffff44, 0.5);
});

toyPad.on("error", () => {
    console.log("Toy Pad connection error");
});

toyPad.on("add", (data) => {
    let name = ToyPad.minifigNameFromSignature(data.sig);
    console.log(`Minifig added to panel ${data.panel} (${name})`);
});

toyPad.on("remove", (data) => {
    let name = ToyPad.minifigNameFromSignature(data.sig);
    console.log(`Minifig removed from panel ${data.panel} (${name})`);
});

toyPad.connect();