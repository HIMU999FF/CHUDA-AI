const fetch = require('node-fetch');

module.exports.config = {
    name: "joke",
    description: "Fetches a random joke",
    usage: ".joke",
    cooldown: 3
}

module.exports.run = async (bot, message, args) => {
    try {
        const response = await fetch('https://v2.jokeapi.dev/joke/Any?blacklistFlags=nsfw');
        const data = await response.json();

        if (data.type === "single") {
            message.reply(data.joke); // For single jokes
        } else {
            message.reply(`${data.setup}\n\n${data.delivery}`); // For jokes with setup and delivery
        }
    } catch (error) {
        console.error("Error fetching joke:", error);
        message.reply("Sorry, I couldn't fetch a joke at this time.");
    }
}
