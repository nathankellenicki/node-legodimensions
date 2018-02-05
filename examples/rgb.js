const ToyPad = require("../main.js");
    toyPad = new ToyPad();


let PanelStates = {};
PanelStates[ToyPad.Panel.LEFT] = 0;
PanelStates[ToyPad.Panel.RIGHT] = 0;
PanelStates[ToyPad.Panel.CENTER] = 0;


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

    switch (name) {
        case "Wyldstyle":
            PanelStates[data.panel] = PanelStates[data.panel] | 0xff0000;
            break;
        case "Batman":
            PanelStates[data.panel] = PanelStates[data.panel] | 0x00ff00;
            break;
        case "Gandalf":
            PanelStates[data.panel] = PanelStates[data.panel] | 0x0000ff;
            break;
    }

    //console.log(PanelStates[data.panel]);
    toyPad.setColor(data.panel, PanelStates[data.panel]);

});


toyPad.on("remove", (data) => {

    const name = ToyPad.minifigNameFromSignature(data.sig);
    if (name) {
        console.log(`Minifig removed from panel ${data.panel} (${name})`);
    } else {
        console.log(`Minifig removed from panel ${data.panel} (Unknown signature - ${data.sig})`);
    }

    switch (name) {
        case "Wyldstyle":
            PanelStates[data.panel] = PanelStates[data.panel] ^ 0xff0000;
            break;
        case "Batman":
            PanelStates[data.panel] = PanelStates[data.panel] ^ 0x00ff00;
            break;
        case "Gandalf":
            PanelStates[data.panel] = PanelStates[data.panel] ^ 0x0000ff;
            break;
    }

    //console.log(PanelStates[data.panel]);
    toyPad.setColor(data.panel, PanelStates[data.panel]);

});


toyPad.connect();