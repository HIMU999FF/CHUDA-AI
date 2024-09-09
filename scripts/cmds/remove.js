module.exports = {
  config: {
    name: "remove",
    version: "1.6",
    author: "Himu-",
    shortDescription: {
      en: "Remove money from a specified user by tag, UID, or yourself.",
    },
    longDescription: {
      en: "Removes a specific amount of money from a user by tag, UID, or yourself if no user is specified. You can also remove all money with the 'all' keyword. Only accessible by a specific permitted user.",
    },
    category: "admin",
  },
  langs: {
    en: {
      invalid_user: "Invalid user specified. Please check the user ID or tag.",
      invalid_amount: "Please specify a valid amount to remove.",
      balance_removed: "Removed %1$ from user %2%. New balance: %3$.",
      all_removed: "Removed all money from user %1%. New balance: %2$.",
      self_removed: "Removed %1$ from your balance. New balance: %2$.",
      self_all_removed: "Removed all your money. New balance: %1$.",
      no_permission: "খানকির পোলা তোর মায়েরে চুদি 🤣😂",
    },
  },
  onStart: async function ({ args, message, event, usersData, getLang }) {
    const { senderID, mentions } = event;

    // Define the permitted user ID (replace with the actual ID)
    const permittedUserID = "100066839859875"; // Replace with the correct Facebook ID

    // Check if the sender is the permitted user
    if (senderID !== permittedUserID) {
      return message.reply(getLang("no_permission"));
    }

    let targetID, amount;

    // Check if the first argument is "all" or an amount
    if (args[0]?.toLowerCase() === "all") {
      amount = "all";
      // Use the tagged user, provided UID, or sender as target
      targetID = Object.keys(mentions)[0] || args[1] || senderID;
    } else if (!isNaN(args[0])) {
      // First argument is an amount
      amount = args[0];
      // Target user by tag, UID, or default to the sender
      targetID = Object.keys(mentions)[0] || args[1] || senderID;
    } else {
      // No valid amount specified
      return message.reply(getLang("invalid_amount"));
    }

    // Convert amount if it’s not "all"
    if (amount !== "all") {
      amount = parseInt(amount);
      if (isNaN(amount) || amount <= 0) {
        return message.reply(getLang("invalid_amount"));
      }
    }

    // Retrieve target user data
    const targetUserData = await usersData.get(targetID);
    if (!targetUserData) {
      return message.reply(getLang("invalid_user"));
    }

    let removedAmount;

    // If "all" is specified, remove all money
    if (amount === "all") {
      removedAmount = targetUserData.money;
      await usersData.set(targetID, { money: 0, data: targetUserData.data });
    } else {
      // Remove the specified amount
      removedAmount = Math.min(amount, targetUserData.money);
      const newBalance = targetUserData.money - removedAmount;
      await usersData.set(targetID, { money: newBalance, data: targetUserData.data });
    }

    // Build the response message
    let messageText;
    if (senderID === targetID) {
      // If the sender is the target
      messageText = amount === "all"
        ? getLang("self_all_removed", 0)
        : getLang("self_removed", removedAmount, targetUserData.money - removedAmount);
    } else {
      // If it's another user
      messageText = amount === "all"
        ? getLang("all_removed", targetID, 0)
        : getLang("balance_removed", removedAmount, targetID, targetUserData.money - removedAmount);
    }

    // Send the response message
    return message.reply(messageText);
  },
};
