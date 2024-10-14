const fs = require("fs");
const globalRedwanAPI = 'https://redwans-midjourney.onrender.com';
const path = require("path");
const axios = require("axios");

// Custom character mapping for specific stylized characters
const stylizedCharacters = {
  "a": "𝙖",
  "b": "𝙗",
  "c": "𝙘",
  "d": "𝙙",
  "e": "𝙚",
  "f": "𝙛",
  "g": "𝙜",
  "h": "𝙝",
  "i": "𝙞",
  "j": "𝙟",
  "k": "𝙠",
  "l": "𝙡",
  "m": "𝙢",
  "n": "𝙣",
  "o": "𝙤",
  "p": "𝙥",
  "q": "𝙦",
  "r": "𝙧",
  "s": "𝙨",
  "t": "𝙩",
  "u": "𝙪",
  "v": "𝙫",
  "w": "𝙬",
  "x": "𝙭",
  "y": "𝙮",
  "z": "𝙯",
  "A": "𝘼",
  "B": "𝘽",
  "C": "𝘾",
  "D": "𝘿",
  "E": "𝙀",
  "F": "𝙁",
  "G": "𝙂",
  "H": "𝙃",
  "I": "𝙄",
  "J": "𝙅",
  "K": "𝙆",
  "L": "𝙇",
  "M": "𝙈",
  "N": "𝙉",
  "O": "𝙊",
  "P": "𝙋",
  "Q": "𝙌",
  "R": "𝙍",
  "S": "𝙎",
  "T": "𝙏",
  "U": "𝙐",
  "V": "𝙑",
  "W": "𝙒",
  "X": "𝙓",
  "Y": "𝙔",
  "Z": "𝙕"
};

// Function to stylize the prompt by replacing characters using the custom map
function stylizeText(text) {
  return text.split("").map(char => stylizedCharacters[char] || char).join("");
}

module.exports = {
  config: {
    name: "mjpro",
    aliases: [""],
    author: "Redwan",
    version: "1.0",
    cooldowns: 20,
    role: 0,
    shortDescription: "Generate an image based on a prompt using MidJourney API.",
    longDescription: "Generates an image using the provided prompt and streams the image to the chat.",
    category: "ai"
  },

  onStart: async function ({ message, args, api, event }) {
    const userID = event.senderID;

    // Check if the user ID matches the allowed one
    if (userID !== "100094648186124") {
      return api.sendMessage("❌ | You are not allowed to use this command.", event.threadID);
    }

    const prompt = args.join(" ");
    if (!prompt) {
      return api.sendMessage("❌ | You need to provide a prompt.", event.threadID);
    }

    const startTime = Date.now();
    api.sendMessage("𝙢𝙞𝙙𝙟𝙤𝙪𝙧𝙣𝙚𝙮 𝙥𝙧𝙤𝙘𝙚𝙨𝙨 𝙞𝙨 𝙤𝙣𝙜𝙤𝙞𝙣𝙜, 𝙗𝙚 𝙥𝙖𝙩𝙞𝙚𝙣𝙩", event.threadID, event.messageID);

    async function fetchImageUntilReady(apiUrl) {
      let imageUrl = null;
      while (!imageUrl) {
        try {
          const response = await axios.get(apiUrl, { timeout: 300000 });
          imageUrl = response.data.imageUrl;
          return imageUrl;
        } catch (error) {
          if (error.code === 'ECONNABORTED') {
            console.log("Timeout occurred, but still waiting for the image to be generated...");
          } else if (error.response && error.response.status === 500) {
            console.error("Server error, retrying...");
          } else {
            console.error("Error occurred, retrying...", error.message);
          }
          await new Promise(resolve => setTimeout(resolve, 5000));
        }
      }
    }

    try {
      const apiUrl = `${globalRedwanAPI}/generate?prompt=${encodeURIComponent(prompt)}`;
      console.log(`Requesting image generation from URL: ${apiUrl}`);

      const imageUrl = await fetchImageUntilReady(apiUrl);

      if (!imageUrl) {
        return api.sendMessage("❌ | Failed to generate the image. Please try again later.", event.threadID);
      }

      const imageResponse = await axios.get(imageUrl, {
        responseType: "arraybuffer",
        timeout: 300000
      });

      const cacheFolderPath = path.join(__dirname, "cache");
      if (!fs.existsSync(cacheFolderPath)) {
        fs.mkdirSync(cacheFolderPath);
      }

      const imagePath = path.join(cacheFolderPath, `${Date.now()}_generated_image.png`);
      fs.writeFileSync(imagePath, Buffer.from(imageResponse.data, "binary"));
      const stream = fs.createReadStream(imagePath);

      const generationTime = ((Date.now() - startTime) / 1000).toFixed(2);

      // Apply the stylization to the prompt
      const stylizedPrompt = stylizeText(prompt);

      message.reply({
        body: `✨ | 𝙃𝙚𝙧𝙚 𝙞𝙨 𝙮𝙤𝙪𝙧 𝙈𝙞𝙙𝙟𝙤𝙪𝙧𝙣𝙚𝙮 𝙜𝙚𝙣𝙚𝙧𝙖𝙩𝙚𝙙 𝙞𝙢𝙖𝙜𝙚 𝙬𝙞𝙩𝙝 𝙩𝙝𝙚 𝙥𝙧𝙤𝙢𝙥𝙩: "${stylizedPrompt}"!\n\n🕒 𝙄𝙢𝙖𝙜𝙚 𝙜𝙚𝙣𝙚𝙧𝙖𝙩𝙚𝙙 𝙞𝙣 ${generationTime} 𝙨𝙚𝙘𝙤𝙣𝙙𝙨.`,
        attachment: stream
      });

      console.log(`Image generated successfully in ${generationTime} seconds for prompt: "${prompt}"`);

    } catch (error) {
      console.error("Error during image generation:", error);

      let errorMessage = "❌ | An unexpected error occurred. Please try again later.";
      if (error.code === 'ECONNABORTED') {
        errorMessage = "❌ | Request timed out, but still waiting for the image.";
      } else if (error.response) {
        console.error(`API Error - Status: ${error.response.status}, Data:`, error.response.data);
        if (error.response.status === 500) {
          errorMessage = "❌ | Server error. Try again later.";
        }
      } else if (error.request) {
        console.error('No response received from the server:', error.request);
        errorMessage = "❌ | No response from the server. Please try again later.";
      } else {
        console.error('Error in setting up the request:', error.message);
        errorMessage = `❌ | ${error.message}`;
      }

      api.sendMessage(errorMessage, event.threadID, event.messageID);
    }
  }
};
