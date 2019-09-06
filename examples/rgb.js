const ToyPad = require("../main.js");
    toyPad = new ToyPad();


let PanelStates = {
    [ToyPad.Panel.LEFT]: 0x0,
    [ToyPad.Panel.RIGHT]: 0x0,
    [ToyPad.Panel.CENTER]: 0x0
};


const Colors = {
    '07 c9 52 99 40 81': 0xff0000, // Wyldstyle
    'fc f3 8a 71 40 80': 0x00ff00, // Batman
    '9f 1f 8a 71 40 80': 0x0000ff // Gandalf
}


toyPad.on("connect", () => {
    console.log("ToyPad connected");
});


toyPad.on("error", () => {
    console.log("ToyPad connection error");
});


toyPad.on("add", (data) => {

    console.log(`Minifig added to panel ${data.panel} (${data.sig})`);
    PanelStates[data.panel] = PanelStates[data.panel] | Colors[data.sig];
    toyPad.fade(data.panel, 20, 1, PanelStates[data.panel]);

});


toyPad.on("remove", (data) => {

    console.log(`Minifig removed from panel ${data.panel} (${data.sig})`);
    PanelStates[data.panel] = PanelStates[data.panel] ^ Colors[data.sig];
    toyPad.fade(data.panel, 15, 1, PanelStates[data.panel]);

});


toyPad.connect();