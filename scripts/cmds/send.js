module.exports = {
  config: {
    name: "send",
    version: "1.0",
    author: "Rishad",
    shortDescription: {
      en: "Send money to another user",
    },
    longDescription: {
      en: "Transfer money to another user using their user ID or tag.",
    },
    category: "economy",
  },
  langs: {
    en: {
      invalid_amount: "Please specify a valid amount to send 🌝🙌",
      not_enough_money: "You don't have enough money to send 🌝🤣",
      invalid_user: "The specified user is invalid or not found 🌝😅",
      transfer_success: "Successfully sent %1$ to %2!",
      transfer_fail: "Failed to send money. Please check the user ID or tag and try again 🌝🥲",
    },
  },
  onStart: async function ({ args, message, event, usersData, getLang }) {
    const { senderID, mentions } = event;
    let recipientID, amount;

    // If a user is mentioned, use their ID as the recipientID
    if (mentions && Object.keys(mentions).length > 0) {
      recipientID = Object.keys(mentions)[0];
      amount = parseInt(args.find(arg => !isNaN(arg))); // Find the number in args as the amount
    } else {
      // Otherwise, use the first argument as the recipient ID/tag and the second as the amount
      recipientID = args[0];
      amount = parseInt(args[1]);
    }

    if (isNaN(amount) || amount <= 0) {
      return message.reply(getLang("invalid_amount"));
    }

    const senderData = await usersData.get(senderID);
    if (amount > senderData.money) {
      return message.reply(getLang("not_enough_money"));
    }

    // Validate recipient
    try {
      const recipientData = await usersData.get(recipientID);
      if (!recipientData) {
        return message.reply(getLang("invalid_user"));
      }

      // Perform the transfer
      await usersData.set(senderID, {
        money: senderData.money - amount,
        data: senderData.data,
      });

      await usersData.set(recipientID, {
        money: recipientData.money + amount,
        data: recipientData.data,
      });

      return message.reply(getLang("transfer_success", amount, recipientID));
    } catch (error) {
      return message.reply(getLang("invalid_user"));
    }
  },
};
