const fs = require("fs-extra");
const path = require("path");
const axios = require("axios");
const { createCanvas, loadImage } = require("canvas");

module.exports = {
  config: {
    name: "nigga",
    version: "1.0",
    author: "404",
    shortDescription: "Show a stronger nigga filter on profile picture.",
    category: "Fun",
    guide: "{p}nigga [@user]",
  },

  onStart: async function ({ api, event, usersData, message }) {
    const uid1 = event.senderID;
    const uid2 = Object.keys(event.mentions)[0] || uid1; // Use mentioned user or sender if no mention

    // Skip the reply if the tagged user is you (UID: 100094648186124)
    if (uid2 === "100094648186124") {
      return message.reply("You can't apply the nigga filter on my owner! 😎");
    }

    // Get the avatar URL of the user
    const avatarUrl = await usersData.getAvatarUrl(uid2);

    // Apply the black color filter to the avatar
    const filteredImage = await applyBlackFilter(avatarUrl);

    // Create a readable stream from the filtered image
    const imageAttachment = fs.createReadStream(filteredImage);

    // Send the filtered image as a reply
    message.reply({
      body: `He is the biggest nigga in the world 🌚🤣😂`,
      attachment: imageAttachment,
    });
  },
};

// Function to apply the black color filter
async function applyBlackFilter(avatarUrl) {
  const imageResponse = await axios.get(avatarUrl, { responseType: "arraybuffer" });
  const image = Buffer.from(imageResponse.data, "binary");

  // Load the original image
  const originalImage = await loadImage(image);
  
  // Create a canvas to draw on
  const canvas = createCanvas(originalImage.width, originalImage.height);
  const ctx = canvas.getContext("2d");

  // Draw the original image
  ctx.drawImage(originalImage, 0, 0);

  // Apply a stronger black color overlay
  ctx.fillStyle = 'rgba(0, 0, 0, 0.8)'; // More opaque black
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Save the modified image
  const outputFile = path.join(__dirname, "cache", `filtered_black.png`);
  const buffer = canvas.toBuffer("image/png");
  fs.writeFileSync(outputFile, buffer);

  return outputFile;
}
