const ToyPad = require("../main.js"),
    toyPad = new ToyPad();


toyPad.on("connect", () => {
    console.log("ToyPad connected");
});


toyPad.on("error", () => {
    console.log("ToyPad connection error");
});


toyPad.on("add", (data) => {
    console.log(`Minifig added to panel ${data.panel} (${data.sig})`);
        toyPad.setColor(data.panel, 0xffff);
});


toyPad.on("remove", (data) => {
    console.log(`Minifig removed from panel ${data.panel} (${data.sig})`);
        toyPad.setColor(data.panel, 0x0);
});


toyPad.connect();