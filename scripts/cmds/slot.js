module.exports = {
  config: {
    name: "slot",
    version: "1.1",
    author: "Rishad",
    shortDescription: {
      en: "Game slot",
    },
    longDescription: {
      en: "Play a slot game with exciting features!",
    },
    category: "game",
  },
  langs: {
    en: {
      invalid_amount: "Put a valid number to bet 🌝🙌",
      not_enough_money: "You don't have enough money 🌝🤣",
      spin_message: "Spinning the slots... 🎰",
      win_message: "You won %1$ 💰! New balance: %2$",
      lose_message: "You lost %1$ 🥲. New balance: %2$",
      jackpot_message: "Jackpot! You won %1$ 💥! New balance: %2$",
      daily_reward_message: "Daily reward claimed! You received %1$.",
    },
  },
  onStart: async function ({ args, message, event, envCommands, usersData, commandName, getLang }) {
    const { senderID } = event;
    const userData = await usersData.get(senderID);

    let amount;
    if (args[0] === "all") {
      amount = userData.money;
    } else {
      amount = parseInt(args[0]);
    }

    if (isNaN(amount) || amount <= 0) {
      return message.reply(getLang("invalid_amount"));
    }

    if (amount > userData.money) {
      return message.reply(getLang("not_enough_money"));
    }

    // Display spinning message
    await message.reply(getLang("spin_message"));

    // Define slot symbols
    const slots = ["🍒", "🍇", "🍊", "🍉", "🍋", "🍎", "🍓", "🍑", "🥝"];
    const slot1 = slots[Math.floor(Math.random() * slots.length)];
    const slot2 = slots[Math.floor(Math.random() * slots.length)];
    const slot3 = slots[Math.floor(Math.random() * slots.length)];

    // Calculate winnings
    const winnings = calculateWinnings(slot1, slot2, slot3, amount);

    // Update user data
    const newBalance = userData.money + winnings;
    await usersData.set(senderID, {
      money: newBalance,
      data: userData.data,
    });

    // Construct message
    const messageText = getSpinResultMessage(slot1, slot2, slot3, winnings, newBalance, getLang);
    return message.reply(messageText);
  },
};

// Function to calculate winnings
function calculateWinnings(slot1, slot2, slot3, betAmount) {
  const winChance = Math.random();

  if (winChance <= 0.7) {
    if (slot1 === "🍒" && slot2 === "🍒" && slot3 === "🍒") {
      return betAmount * 10;
    } else if (slot1 === "🍇" && slot2 === "🍇" && slot3 === "🍇") {
      return betAmount * 5;
    } else if (slot1 === slot2 && slot2 === slot3) {
      return betAmount * 3;
    } else if (slot1 === slot2 || slot1 === slot3 || slot2 === slot3) {
      return betAmount * 2;
    } else {
      return betAmount; // Win back the bet amount
    }
  } else {
    return -betAmount; // Lose the bet
  }
}

// Function to get spin result message
function getSpinResultMessage(slot1, slot2, slot3, winnings, newBalance, getLang) {
  if (winnings > 0) {
    if (slot1 === "🍒" && slot2 === "🍒" && slot3 === "🍒") {
      return getLang("jackpot_message", winnings, newBalance);
    } else {
      return getLang("win_message", winnings, newBalance) + `\n[ ${slot1} | ${slot2} | ${slot3} ]`;
    }
  } else {
    return getLang("lose_message", -winnings, newBalance) + `\n[ ${slot1} | ${slot2} | ${slot3} ]`;
  }
}
