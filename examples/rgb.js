const ToyPad = require("../main.js");
    toyPad = new ToyPad();


let PanelStates = {};
PanelStates[ToyPad.Panel.LEFT] = 0;
PanelStates[ToyPad.Panel.RIGHT] = 0;
PanelStates[ToyPad.Panel.CENTER] = 0;


const Colors = {
    WYLDSTYLE: 0xff0000,
    BATMAN: 0x00ff00,
    GANDALF: 0x0000ff
}


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

    PanelStates[data.panel] = PanelStates[data.panel] | Colors[name.toUpperCase()];
    toyPad.fade(data.panel, 20, 1, PanelStates[data.panel]);

});


toyPad.on("remove", (data) => {

    const name = ToyPad.minifigNameFromSignature(data.sig);
    if (name) {
        console.log(`Minifig removed from panel ${data.panel} (${name})`);
    } else {
        console.log(`Minifig removed from panel ${data.panel} (Unknown signature - ${data.sig})`);
    }

    PanelStates[data.panel] = PanelStates[data.panel] ^ Colors[name.toUpperCase()];
    toyPad.fade(data.panel, 15, 1, PanelStates[data.panel]);

});


toyPad.connect();