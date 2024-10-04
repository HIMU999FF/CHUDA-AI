 module.exports = {
  config: {
    name: "top",
    version: "1.3",
    author: "Himu-",
    role: 0, // Role 0 means everyone can use it
    shortDescription: "Top users by balance",
    longDescription: "Displays a list of top users based on their balance with pagination support or all users.",
    category: "economy",
    guide: "{pn} [page|all] - Display the top users for the specified page number (default is 1) or all users."
  },

  onStart: async function ({ message, usersData, args }) {
    try {
      // Fetch all users' data
      const allUsers = await usersData.getAll();
      
      // Check if data retrieval is successful and valid
      if (!Array.isArray(allUsers)) {
        throw new Error("Data retrieved is not an array.");
      }

      // Sort users by balance
      const sortedUsers = allUsers
        .filter(user => user.money > 0) // Filter out users without money
        .sort((a, b) => b.money - a.money); // Sort in descending order

      // Determine the command option
      const option = args[0] || '1'; // Default to page 1 if no argument
      let messageText;

      if (option === 'all') {
        // Display all users
        messageText = `【𝐓𝐎𝐏 𝐀𝐋𝐋 𝐑𝐈𝐂𝐇𝐄𝐒𝐓 𝐔𝐒𝐄𝐑𝐒】\n\n${sortedUsers.map((user, index) => {
          return `━━━━━━${index + 1}━━━━━━\n➟ ${user.name}\n$${user.money.toLocaleString()}\n`;
        }).join('\n')}\n💰 Keep earning to climb the leaderboard! 💰`;
      } else {
        // Pagination logic
        const pageNumber = parseInt(option, 10);
        if (isNaN(pageNumber) || pageNumber <= 0) {
          return message.reply("⚠ Please specify a valid page number (e.g., .top 2).");
        }

        // Calculate pagination
        const usersPerPage = 10;
        const totalPages = Math.ceil(sortedUsers.length / usersPerPage);
        const startIndex = (pageNumber - 1) * usersPerPage;
        const endIndex = startIndex + usersPerPage;
        const paginatedUsers = sortedUsers.slice(startIndex, endIndex);

        // Check if the page number is valid
        if (pageNumber > totalPages || pageNumber < 1) {
          return message.reply(`⚠ Page ${pageNumber} does not exist. Please specify a page between 1 and ${totalPages}.`);
        }

        // Prepare the top users list for the current page
        messageText = `【𝐓𝐎𝐏 𝐔𝐒𝐄𝐑𝐒 (𝐏𝐚𝐠𝐞 ${pageNumber}/${totalPages})】\n\n${paginatedUsers.map((user, index) => {
          return `━━━━━━${startIndex + index + 1}━━━━━━\n➟ ${user.name}\n$${user.money.toLocaleString()}\n`;
        }).join('\n')}\n\n💰 Keep earning to climb the leaderboard! 💰`;
      }

      // Reply with the top users
      await message.reply(messageText);

    } catch (error) {
      // Log detailed error message for debugging
      console.error("Error in retrieving top users by balance:", error);

      // Reply with a generic error message
      return message.reply("❌ An error occurred while retrieving the top users' balances. Please try again later.");
    }
  }
};
