const RPC = require("discord-rpc");
const rpc = new RPC.Client({
    transport: "ipc"
});
console.log("RPC loading...");
rpc.on("ready", () => {
    rpc.setActivity({
        details: "Using SnailDOS Desktop",
        state: "Managing your account",
        startTimestamp: new Date(),
        largeImageKey: "largelogo_1_",
        largeImageText: "portal.snaildos.com",
        smallImageText: "Check out SnailDOS today!"
    });

    console.log("Discord RPC loaded.");
});

rpc.login({
    clientId: "677456644384489472"
});