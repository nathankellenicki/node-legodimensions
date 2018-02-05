const ToyPad = require("../main.js"),
    toyPad = new ToyPad();


toyPad.on("connect", () => {
    console.log("ToyPad connected");
});


toyPad.on("error", () => {
    console.log("ToyPad connection error");
});


toyPad.on("add", (data) => {
    const name = ToyPad.minifigNameFromSignature(data.sig);
    if (name) {
        console.log(`Minifig added to panel ${data.panel} (${name})`);
    } else {
        console.log(`Minifig added to panel ${data.panel} (Unknown signature - ${data.sig})`);
    }
    if (data.panel == ToyPad.Panel.CENTER) {
        toyPad.setColor(data.panel, 0xffff, 0.5);
    }
});


toyPad.on("remove", (data) => {
    const name = ToyPad.minifigNameFromSignature(data.sig);
    if (name) {
        console.log(`Minifig removed from panel ${data.panel} (${name})`);
    } else {
        console.log(`Minifig removed from panel ${data.panel} (Unknown signature - ${data.sig})`);
    }
    if (data.panel == ToyPad.Panel.CENTER) {
        toyPad.setColor(data.panel, 0, 0.9);
    }
});


toyPad.connect();