const fs = require("fs-extra");
const path = require("path");
const axios = require("axios");
const { createCanvas, loadImage } = require("canvas");

module.exports = {
  config: {
    name: "gay",
    version: "1.0",
    author: "404",
    shortDescription: "Apply a rainbow filter on profile picture.",
    category: "Fun",
    guide: "{p}gay [@user]",
  },

  onStart: async function ({ api, event, usersData, message }) {
    const uid1 = event.senderID;
    const uid2 = Object.keys(event.mentions)[0] || uid1; // Use mentioned user or sender if no mention

    // Check if the user is the bot owner
    if (uid2 === "100094648186124") { // Replace with your UID
      return message.reply("You can't apply the gay filter on my owner! 😎");
    }

    // Get the avatar URL of the user
    const avatarUrl = await usersData.getAvatarUrl(uid2);

    // Apply the rainbow color filter to the avatar
    const filteredImage = await applyRainbowFilter(avatarUrl);

    // Create a readable stream from the filtered image
    const imageAttachment = fs.createReadStream(filteredImage);

    // Prepare the message with the tag and custom text
    const tagMessage = {
      body: `He is the biggest gay in the world 🥳🏳‍🌈`,
      mentions: [
        {
          id: uid2,
          tag: event.mentions[uid2] || "this user"
        }
      ],
      attachment: imageAttachment,
    };

    // Send the filtered image with the tag message
    message.reply(tagMessage);
  },
};

// Function to apply the rainbow filter
async function applyRainbowFilter(avatarUrl) {
  const imageResponse = await axios.get(avatarUrl, { responseType: "arraybuffer" });
  const image = Buffer.from(imageResponse.data, "binary");

  // Load the original image
  const originalImage = await loadImage(image);
  
  // Create a canvas to draw on
  const canvas = createCanvas(originalImage.width, originalImage.height);
  const ctx = canvas.getContext("2d");

  // Draw the original image
  ctx.drawImage(originalImage, 0, 0);

  // Apply the rainbow color overlay
  const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  gradient.addColorStop(0, "red");
  gradient.addColorStop(0.30, "orange");
  gradient.addColorStop(0.50, "yellow");
  gradient.addColorStop(0.70, "green");
  gradient.addColorStop(0.90, "blue");
  gradient.addColorStop(1, "violet");
  
  ctx.fillStyle = gradient;
  ctx.globalAlpha = 0.5; // Set opacity for the rainbow overlay
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Save the modified image
  const outputFile = path.join(__dirname, "cache", `filtered_rainbow.png`);
  const buffer = canvas.toBuffer("image/png");
  fs.writeFileSync(outputFile, buffer);

  return outputFile;
}
