const axios = require('axios');

module.exports = {
  config: {
    name: "dera",
    version: "1.0",
    author: "akash|Mahi--",
    countDown: 5,
    role: 0,
    shortDescription: "ignore this command",
    longDescription: "ignore this command",
    category: "no prefix",
  },
  onStart: async function () {},
  onChat: async function ({ event, message }) {
    if (event && event.body) {
      const body = event.body.toLowerCase();
      if (
        body === "bot" || // you can edit these keywords
        body === "robot" ||
        body === "রোবট" ||
        body === "বট" ||
        body === "alive" ||
        body === "bots"
      ) {
        // List of GIF URLs
        const gifUrls = [
          "", // You can replace these with any GIF URLs
          "",
          ""
        ];

        // Randomly select a GIF URL
        const randomGif = gifUrls[Math.floor(Math.random() * gifUrls.length)];

        try {
          // Get the GIF stream
          const attachment = await global.utils.getStreamFromURL(randomGif);

          // Reply with the message and GIF
          await message.reply({
            body: "কিরে মাংগের নাতি 😏",
            attachment: attachment
          }, event.threadID, event.messageID);

        } catch (error) {
          console.error("Error sending GIF:", error);
          await message.reply("কিরে মাংগের নাতি 😏", event.threadID, event.messageID);
        }
      }
    }
  },
};
