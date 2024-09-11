 const { getPrefix } = global.utils;
const path = require('path');

// Initialize challenge data
const challengeData = {};

module.exports = {
  config: {
    name: "challenge",
    aliases: ["bet"],
    version: "1.7",
    author: "Redwan",
    countDown: 5,
    role: 0,
    shortDescription: {
      en: "Create, join, start, and view bets",
    },
    longDescription: {
      en: "Create a bet challenge, join an open challenge, start the challenge, and view all pending bets with detailed user info and attractive emojis.",
    },
    category: "games",
    guide: {
      en: "{pn} challenge create <amount> - Create a new challenge 💰\n{pn} challenge join - Join an open challenge 🤝\n{pn} challenge start - Start the challenge 🚀\n{pn} challenge pending - View all pending bets 📝"
    },
    priority: 2,
  },

  onStart: async function ({ message, args, event, usersData }) {
    const { threadID, senderID } = event;
    const prefix = getPrefix(threadID);

    // Load or initialize challenge data
    if (!global.challengeData) global.challengeData = {};

    const challengeData = global.challengeData;

    // Usage message
    const usageMsg = `📜 **Usage:**\n${prefix}challenge create <amount> - Create a new challenge 💰\n${prefix}challenge join - Join an open challenge 🤝\n${prefix}challenge start - Start the challenge 🚀\n${prefix}challenge pending - View all pending bets 📝`;

    // No arguments or invalid action
    if (args.length === 0 || !["create", "join", "start", "pending"].includes(args[0])) {
      return message.reply(usageMsg);
    }

    // Handle creating a new challenge
    if (args[0] === "create") {
      const amount = parseInt(args[1]);
      if (isNaN(amount) || amount <= 0) {
        return message.reply(`💡 Usage: ${prefix}challenge create <amount>`);
      }

      const userBalance = await usersData.get(senderID, "money");
      if (userBalance < amount) {
        return message.reply("💸 You don't have enough money to create this challenge.");
      }

      // Create challenge
      challengeData[senderID] = {
        amount,
        status: "pending",
        challenger: senderID
      };

      await usersData.set(senderID, { money: userBalance - amount });
      const userName = await usersData.get(senderID, "name") || "Unknown";
      message.reply(`🎉 **Challenge Created!**\n${userName} created a challenge with a stake of ${amount}. Waiting for someone to join. 🤞`);
      return;
    }

    // Handle joining an existing challenge
    if (args[0] === "join") {
      const challenge = Object.values(challengeData).find(challenge => challenge.status === "pending" && challenge.challenger !== senderID);
      
      if (!challenge) {
        return message.reply("❌ No challenge is available to join.");
      }

      const userBalance = await usersData.get(senderID, "money");
      if (userBalance < challenge.amount) {
        return message.reply("💸 You don't have enough money to join this challenge.");
      }

      // Join the challenge
      challenge.joiner = senderID;
      challenge.status = "ready_to_start";
      await usersData.set(senderID, { money: userBalance - challenge.amount });
      const userName = await usersData.get(senderID, "name") || "Unknown";
      message.reply(`🤝 **Challenge Joined!**\n${userName} has joined the challenge of ${challenge.amount}. Ready to start.`);
      return;
    }

    // Handle starting the challenge
    if (args[0] === "start") {
      const challenge = Object.values(challengeData).find(challenge => challenge.status === "ready_to_start");
      
      if (!challenge) {
        return message.reply("❌ No challenge is ready to start.");
      }

      const challenger = challenge.challenger;
      const joiner = challenge.joiner;
      
      // Text-based animation for starting the challenge
      const animations = [
        "🚀 Starting the challenge in 3...",
        "🚀 Starting the challenge in 2...",
        "🚀 Starting the challenge in 1...",
        "🎯 Let's go!"
      ];

      for (const animation of animations) {
        await message.reply(animation);
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second between messages
      }

      // Resolve the challenge
      const result = Math.random() < 0.5 ? "win" : "lose";
      const winner = result === "win" ? challenger : joiner;
      const loser = result === "win" ? joiner : challenger;

      // Retrieve balances before and after the challenge
      const challengeAmount = challenge.amount;
      const winnerBalanceBefore = await usersData.get(winner, "money");
      const loserBalanceBefore = await usersData.get(loser, "money");

      await usersData.set(winner, { money: winnerBalanceBefore + challengeAmount * 2 });
      await usersData.set(loser, { money: loserBalanceBefore });

      const winnerBalanceAfter = await usersData.get(winner, "money");
      const loserBalanceAfter = await usersData.get(loser, "money");

      const winnerName = await usersData.get(winner, "name") || "Unknown";
      const loserName = await usersData.get(loser, "name") || "Unknown";

      await message.reply(`🚀 **Challenge Result!**\nCongratulations to ${winnerName} who won ${challengeAmount}!\n${loserName} lost the challenge.\n\n💰 **Balances:**\n\n**${winnerName}:**\nBefore: ${winnerBalanceBefore}\nAfter: ${winnerBalanceAfter}\n\n**${loserName}:**\nBefore: ${loserBalanceBefore}\nAfter: ${loserBalanceAfter}`);

      // Remove challenge from the list
      delete challengeData[challenger];
      return;
    }

    // Handle viewing pending challenges
    if (args[0] === "pending") {
      const pendingChallenges = Object.values(challengeData).filter(challenge => challenge.status === "pending");

      if (pendingChallenges.length === 0) {
        return message.reply("📝 No pending challenges.");
      }

      let msg = "📝 **Pending Challenges:**\n";
      for (const challenge of pendingChallenges) {
        const challengerName = await usersData.get(challenge.challenger, "name") || "Unknown";
        msg += `- Challenge by ${challengerName} for ${challenge.amount} 💰\n`;
      }
      message.reply(msg);
    }
  }
};
