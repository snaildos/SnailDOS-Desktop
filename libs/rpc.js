const RPC = require("discord-rpc");
const rpc = new RPC.Client({
    transport: "ipc"
});
console.log("RPC loading...");
rpc.on("ready", () => {
    rpc.setActivity({
        details: "SnailPortal",
        state: "Using SnailDOS",
        startTimestamp: new Date(),
        largeImageKey: "largelogo_1_",
        largeImageText: "snaildos.com",
        smallImageText: "Check out SnailDOS today!"
    });

    console.log("RPC loaded.");
});

rpc.login({
    clientId: "677456644384489472"
});