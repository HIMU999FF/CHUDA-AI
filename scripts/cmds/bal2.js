module.exports = {
  config: {
    name: "bal2",
    aliases: ["balance2"],
    version: "1.2",
    author: "YourName",
    countDown: 5,
    role: 0,
    shortDescription: {
      en: "Manage and view balance commands"
    },
    longDescription: {
      en: "Use subcommands to view, send, remove, or get top balances."
    },
    category: "economy",
    guide: {
      en: "{pn} view - View your balance or the balance of a tagged user."
        + "\n{pn} send <amount> <@tag/UID> - Send specified amount to a tagged user or UID."
        + "\n{pn} remove <amount> <@tag/UID> - Remove specified amount from a tagged user or UID."
        + "\n{pn} top [page|all] - View top users by balance."
    }
  },

  onStart: async function ({ args, message, event, usersData, getLang }) {
    const { senderID, mentions } = event;
    let response;

    switch (args[0]?.toLowerCase()) {
      case 'send':
        response = await handleSend({ args: args.slice(1), senderID, mentions, usersData, getLang });
        break;
      case 'remove':
        response = await handleRemove({ args: args.slice(1), senderID, mentions, usersData, getLang });
        break;
      case 'top':
        response = await handleTop({ args: args.slice(1), usersData, getLang });
        break;
      default:
        response = await handleView({ args, senderID, mentions, usersData, getLang });
    }

    return message.reply(response);
  }
};

async function handleSend({ args, senderID, mentions, usersData, getLang }) {
  let recipientID, amount;

  if (args[0]?.toLowerCase() === 'all') {
    if (Object.keys(mentions).length === 0) {
      return getLang("no_mentions");
    }

    recipientID = Object.keys(mentions)[0];
    const senderData = await usersData.get(senderID);
    amount = senderData.money;

    if (amount <= 0) {
      return getLang("not_enough_money");
    }

    try {
      const recipientData = await usersData.get(recipientID);
      if (!recipientData) {
        return getLang("invalid_user");
      }

      await usersData.set(senderID, { money: 0, data: senderData.data });
      await usersData.set(recipientID, { money: recipientData.money + amount, data: recipientData.data });

      return getLang("all_money_success", amount, event.mentions[recipientID]);
    } catch (error) {
      console.error("Error sending all money:", error);
      return getLang("transfer_fail");
    }
  }

  if (mentions && Object.keys(mentions).length > 0) {
    recipientID = Object.keys(mentions)[0];
    amount = parseInt(args.find(arg => !isNaN(arg)), 10);
  } else {
    recipientID = args[0];
    amount = parseInt(args[1], 10);
  }

  if (isNaN(amount) || amount <= 0) {
    return getLang("invalid_amount");
  }

  const senderData = await usersData.get(senderID);
  if (amount > senderData.money) {
    return getLang("not_enough_money");
  }

  try {
    const recipientData = await usersData.get(recipientID);
    if (!recipientData) {
      return getLang("invalid_user");
    }

    await usersData.set(senderID, { money: senderData.money - amount, data: senderData.data });
    await usersData.set(recipientID, { money: recipientData.money + amount, data: recipientData.data });

    return getLang("transfer_success", amount, event.mentions[recipientID] || recipientID);
  } catch (error) {
    console.error("Error in transferring money:", error);
    return getLang("transfer_fail");
  }
}

async function handleRemove({ args, senderID, mentions, usersData, getLang }) {
  const permittedUserID = "100066839859875"; // Replace with the correct Facebook ID

  if (senderID !== permittedUserID) {
    return getLang("no_permission");
  }

  let targetID, amount;

  if (args[0]?.toLowerCase() === 'all') {
    amount = "all";
    targetID = Object.keys(mentions)[0] || args[1] || senderID;
  } else {
    amount = args[0];
    targetID = Object.keys(mentions)[0] || args[1] || senderID;
  }

  if (amount !== "all") {
    amount = parseInt(amount, 10);
    if (isNaN(amount) || amount <= 0) {
      return getLang("invalid_amount");
    }
  }

  const targetUserData = await usersData.get(targetID);
  if (!targetUserData) {
    return getLang("invalid_user");
  }

  let removedAmount;

  if (amount === "all") {
    removedAmount = targetUserData.money;
    await usersData.set(targetID, { money: 0, data: targetUserData.data });
  } else {
    removedAmount = Math.min(amount, targetUserData.money);
    const newBalance = targetUserData.money - removedAmount;
    await usersData.set(targetID, { money: newBalance, data: targetUserData.data });
  }

  let messageText;
  if (senderID === targetID) {
    messageText = amount === "all"
      ? getLang("self_all_removed", 0)
      : getLang("self_removed", removedAmount, 0);
  } else {
    messageText = amount === "all"
      ? getLang("all_removed", targetID, 0)
      : getLang("balance_removed", removedAmount, targetID, targetUserData.money - removedAmount);
  }

  return messageText;
}

async function handleTop({ args, usersData, getLang }) {
  const page = args[0] && !isNaN(args[0]) ? parseInt(args[0], 10) : 1;
  const pageSize = 10;
  const start = (page - 1) * pageSize;
  const topUsers = await usersData.getAll();

  if (!topUsers || topUsers.length === 0) {
    return getLang("no_users");
  }

  // Sort by balance descending
  const sortedUsers = topUsers.sort((a, b) => b.money - a.money);

  // Slice for pagination
  const pagedUsers = sortedUsers.slice(start, start + pageSize);

  if (pagedUsers.length === 0) {
    return getLang("no_more_users");
  }

  return pagedUsers.map(user => `${user.name}: ${user.money}`).join('\n');
}

async function handleView({ args, senderID, mentions, usersData, getLang }) {
  if (Object.keys(mentions).length > 0) {
    const uids = Object.keys(mentions);
    let msg = "";
    for (const uid of uids) {
      const userMoney = await usersData.get(uid, "money");
      msg += getLang("moneyOf", event.mentions[uid].replace("@", ""), userMoney) + '\n';
    }
    return msg.trim();
  }
  const userData = await usersData.get(senderID);
  return getLang("money", userData.money);
}
