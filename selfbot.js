const FS = require("fs");
const Discordie = require("discordie");
const Events = Discordie.Events;
const SelfCommandProcessor = require("./selfcommand_processor.js");

const token = require("./.user_token.json");
const settings = require("./settings.json");
const client = new Discordie();

client.Dispatcher.on(Events.GATEWAY_READY, e => {
    console.log("Connected as: " + client.User.username);
});

client.Dispatcher.on(Events.MESSAGE_CREATE, e => {
    if(client.User.id !== e.message.author.id) {
        return;
    }
    (new SelfCommandProcessor(e, settings.prefix)).run();
});

client.connect(token);