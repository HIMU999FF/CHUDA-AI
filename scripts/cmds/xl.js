const fs = require("fs");
const globalRedwanAPI = 'https://anime-xl-api.onrender.com';
const path = require("path");
const axios = require("axios");

module.exports = {
  config: {
    name: "xl",
    aliases: ["nijiy"],
    author: "Redwan",
    version: "1.0",
    cooldowns: 20,
    role: 0,
    shortDescription: "Generate an image based on a prompt using the XL API.",
    longDescription: "Generates an image using the provided prompt and streams the image to the chat.",
    category: "ai",
    guide: "{pn} <prompt> --ar 16:9",
  },

  onStart: async function ({ message, args, api, event }) {
    const prompt = args.join(" ");
    if (!prompt) {
      return api.sendMessage("❌ | You need to provide a prompt.", event.threadID);
    }

    // Record the start time for process time calculation
    const startTime = Date.now(); 
    api.sendMessage("Please wait, generating your image...", event.threadID, event.messageID);

    try {
      // Request the image generation using the updated API with 5 minutes timeout
      const apiUrl = `${globalRedwanAPI}/generate?prompt=${encodeURIComponent(prompt)}`;
      console.log(`Requesting image generation from URL: ${apiUrl}`);

      // Increase timeout to 5 minutes for image generation
      const response = await axios.get(apiUrl, { timeout: 300000 }); 
      const imageUrl = response.data.imageUrl;

      if (!imageUrl) {
        return api.sendMessage("❌ | Failed to generate the image. Please try again later.", event.threadID);
      }

      // Fetch the generated image with 5 minutes timeout
      const imageResponse = await axios.get(imageUrl, {
        responseType: "arraybuffer",
        timeout: 300000 // Increase timeout for the image retrieval
      });

      // Ensure the cache directory exists
      const cacheFolderPath = path.join(__dirname, "cache");
      if (!fs.existsSync(cacheFolderPath)) {
        fs.mkdirSync(cacheFolderPath);
      }

      // Save the image to a file
      const imagePath = path.join(cacheFolderPath, `${Date.now()}_generated_image.png`);
      fs.writeFileSync(imagePath, Buffer.from(imageResponse.data, "binary"));
      const stream = fs.createReadStream(imagePath);

      // Calculate and format the process time
      const generationTime = ((Date.now() - startTime) / 1000).toFixed(2);

      // Send the image along with the prompt and process time
      message.reply({
        body: `✅ | Here is your image for the prompt: "${prompt}"!\n\n🕒 Image generated in ${generationTime} seconds.`,
        attachment: stream
      });

      console.log(`Image generated successfully in ${generationTime} seconds for prompt: "${prompt}"`);

    } catch (error) {
      console.error("Error during image generation:", error);

      // Customize error messages based on the type of error
      let errorMessage = "❌ | An unexpected error occurred. Please try again later.";
      if (error.code === 'ECONNABORTED') {
        errorMessage = "❌ | Request timed out. The image generation took too long.";
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

      // Send the error message to the user
      api.sendMessage(errorMessage, event.threadID, event.messageID);
    }
  }
};
