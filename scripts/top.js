module.exports = {
  config: {
    name: "top",
    version: "1.0",
    author: "Rishad",
    shortDescription: {
      en: "Top 100 richest users",
    },
    longDescription: {
      en: "Displays the top 100 users with the highest balance.",
    },
    category: "economy",
  },
  langs: {
    en: {
      top_100_title: "🏆 Top 100 Richest Users 🏆",
      no_users: "No users found with a balance.",
      user_entry: "%1. %2: %3$ 💰",
    },
  },
  onStart: async function ({ message, usersData, getLang }) {
    const allUsers = await usersData.getAll();

    if (allUsers.length === 0) {
      return message.reply(getLang("no_users"));
    }

    // Sort users by balance in descending order
    const sortedUsers = allUsers
      .filter(user => user.money > 0) // Only include users with a positive balance
      .sort((a, b) => b.money - a.money);

    // Get the top 100 users
    const top100Users = sortedUsers.slice(0, 100);

    if (top100Users.length === 0) {
      return message.reply(getLang("no_users"));
    }

    // Format the list of top 100 users
    const top100List = top100Users
      .map((user, index) => getLang("user_entry", index + 1, user.name || "Unknown", user.money))
      .join("\n");

    return message.reply(getLang("top_100_title") + `\n${top100List}`);
  },
};
