module.exports = {
  config: {
    name: "stocks",
    version: "2.0",
    author: "devastatinglordxemon",
    countDown: 5,
    role: 0,
    shortDescription: "Simulate stock market investments",
    longDescription: "Check stock prices, buy, sell, view your portfolio, and track your investments.",
    category: "economy",
    guide: `
    📈 **Stock Commands** 💸
    1. View current stock prices: {pn}
    2. Buy stocks: {pn} buy <stock_name> <amount>
    3. Sell stocks: {pn} sell <stock_name> <amount>
    4. View your portfolio: {pn} portfolio
    5. View stock price history: {pn} history <stock_name>
    `
  },

  onStart: async function ({ message, args, usersData }) {
    try {
      const userID = message.senderID;
      if (!userID) {
        return message.reply("❌ Error: Unable to retrieve user ID.");
      }

      let userData = await usersData.get(userID) || { stocks: {}, balance: 0 };

      const stockMarket = {
        "TechCorp": { price: 1500, history: [1400, 1450, 1500] },
        "HealthPlus": { price: 800, history: [700, 750, 800] },
        "EduGrow": { price: 1200, history: [1100, 1150, 1200] },
        "GreenEnergy": { price: 1000, history: [900, 950, 1000] },
        "CryptoX": { price: 2500, history: [2200, 2300, 2500] }
      };

      const action = args[0];
      
      if (!action) {
        // Show stock prices
        let stockList = "📊 **Current Stock Prices** 💸\n";
        for (let stock in stockMarket) {
          stockList += `- ${stock}: ${stockMarket[stock].price} 💸\n`;
        }
        return message.reply(stockList);
      }

      switch(action.toLowerCase()) {
        case "buy":
          return buyStock(args, stockMarket, userData, userID, message, usersData);
        case "sell":
          return sellStock(args, stockMarket, userData, userID, message, usersData);
        case "portfolio":
          return viewPortfolio(userData, message);
        case "history":
          return viewStockHistory(args, stockMarket, message);
        default:
          return message.reply("❌ Invalid action. Please use the correct command.");
      }
    } catch (error) {
      console.error(error);
      return message.reply(`❌ An error occurred: ${error.message}`);
    }
  }
};

// Function to buy stocks
async function buyStock(args, stockMarket, userData, userID, message, usersData) {
  const stockName = args[1];
  const amount = parseInt(args[2]);

  if (!stockName || !amount || isNaN(amount)) {
    return message.reply("❌ Invalid command. Example usage: `.stocks buy TechCorp 10`");
  }

  if (!stockMarket[stockName]) {
    return message.reply("❌ That stock is not listed.");
  }

  const stockPrice = stockMarket[stockName].price;
  const totalCost = stockPrice * amount;

  // Check if the user can afford it (assuming user data has a `balance`)
  if (userData.balance < totalCost) {
    return message.reply(`❌ You do not have enough funds to buy ${amount} shares of ${stockName}.`);
  }

  // Deduct balance and add stocks
  userData.balance -= totalCost;
  userData.stocks[stockName] = (userData.stocks[stockName] || 0) + amount;

  await usersData.set(userID, userData);

  return message.reply(`✅ You successfully bought ${amount} shares of ${stockName} for 💸 ${totalCost}.`);
}

// Function to sell stocks
async function sellStock(args, stockMarket, userData, userID, message, usersData) {
  const stockName = args[1];
  const amount = parseInt(args[2]);

  if (!stockName || !amount || isNaN(amount)) {
    return message.reply("❌ Invalid command. Example usage: `.stocks sell TechCorp 10`");
  }

  if (!stockMarket[stockName]) {
    return message.reply("❌ That stock is not listed.");
  }

  if (!userData.stocks[stockName] || userData.stocks[stockName] < amount) {
    return message.reply(`❌ You do not own enough shares of ${stockName} to sell.`);
  }

  const stockPrice = stockMarket[stockName].price;
  const totalSale = stockPrice * amount;

  // Add balance and deduct stocks
  userData.balance += totalSale;
  userData.stocks[stockName] -= amount;

  await usersData.set(userID, userData);

  return message.reply(`✅ You successfully sold ${amount} shares of ${stockName} for 💸 ${totalSale}.`);
}

// Function to view user's stock portfolio
function viewPortfolio(userData, message) {
  if (!userData.stocks || Object.keys(userData.stocks).length === 0) {
    return message.reply("📉 You do not own any stocks.");
  }

  let portfolio = "📊 **Your Stock Portfolio** 💸\n";
  for (let stock in userData.stocks) {
    portfolio += `- ${stock}: ${userData.stocks[stock]} shares\n`;
  }

  return message.reply(portfolio);
}

// Function to view stock price history
function viewStockHistory(args, stockMarket, message) {
  const stockName = args[1];

  if (!stockName || !stockMarket[stockName]) {
    return message.reply("❌ Please specify a valid stock to view its price history.");
  }

  const history = stockMarket[stockName].history.join(', ');

  return message.reply(`📈 **${stockName} Price History** 💸\n${history}`);
}
