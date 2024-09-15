const fs = require('fs');
const path = require('path');
const filePath = path.resolve(__dirname, 'bankData.json');
const readData = () => fs.existsSync(filePath) ? JSON.parse(fs.readFileSync(filePath)) : {};
const writeData = data => fs.writeFileSync(filePath, JSON.stringify(data, null, 2));

module.exports = {
  config: {
    name: "bank",
    version: "0.06",
    author: "UPoL🐔",
    countDown: 5,
    role: 0,
    shortDescription: {
      en: "Manage your bank account."
    },
    description: {
      en: "Banking commands for creating, renaming, checking balance, deposits, withdrawals, transfers, loans, investments, insurance, and more."
    },
    category: "finance",
    guide: {
      en: `Bank Commands:
          1. .bank create <name> — Create a new bank account.
          2. .bank rename <new name> — Rename your bank account.
          3. .bank check — Check your account balance.
          4. .bank deposit <amount> — Deposit money into your account.
          5. .bank withdraw <amount> — Withdraw money from your account.
          6. .bank transfer <amount> <user> — Transfer money to another user.
          7. .bank help — Display this help message.
          8. .bank history — View your transaction history.
          9. .bank loan <amount> — Request a loan.
          10. .bank invest <amount> — Invest money.
          11. .bank insurance <amount> — Insure part of your money.
          12. .bank steal <amount> <user> — Attempt to steal money from another user.
          13. .bank close — Close your bank account.`
    }
  },

  langs: {
    en: {
      createSuccess: "Account '%1' created.",
      renameSuccess: "Account renamed to '%1'.",
      checkAccount: "Account: %1, Balance: %2",
      depositSuccess: "Deposited 💵 %1. New balance: 💰 %2",
      withdrawSuccess: "Withdrew 💵 %1. New balance: 💰 %2",
      transferSuccess: "Transferred 💵 %1 to %2. New balance: 💰 %3",
      noAccount: "No account found. Use '.bank create <name>'.",
      helpMessage: "Use .bank commands to manage your account.",
      historyMessage: "Transaction history: %1",
      loanRequest: "Loan of 💵 %1 requested.",
      investSuccess: "Invested 💵 %1.",
      insuranceSuccess: "Insured 💵 %1. New insurance balance: 💰 %2",
      stealSuccess: "Attempted to steal 💵 %1 from %2. Success: %3",
      closeSuccess: "Account closed.",
      invalidAmount: "Invalid amount. Please enter a valid number.",
      notEnoughFunds: "You don't have enough funds."
    }
  },

  formatNumber: function(num) {
    return num.toLocaleString(); // Format number with commas
  },

  onStart: async function ({ api, args, message, event, getLang }) {
    const bankData = readData();
    const userId = event.senderID;
    const user = bankData[userId];
    const subCmd = args[0] ? args[0].toLowerCase() : null;
    const reply = (key, ...vals) => message.reply(getLang(key).replace(/%(\d+)/g, (_, n) => vals[n - 1]));

    if (!subCmd) return reply("helpMessage");

    switch (subCmd) {
      case 'create': {
        if (user) return reply("createSuccess", user.name);
        const name = args.slice(1).join(' ') || 'Unnamed Account';
        bankData[userId] = { name, balance: 0, history: [], insuranceBalance: 0 };
        writeData(bankData);
        return reply("createSuccess", name);
      }
      case 'rename': {
        if (!user) return reply("noAccount");
        const newName = args.slice(1).join(' ');
        if (!newName) return message.reply("Provide a new name.");
        user.name = newName;
        writeData(bankData);
        return reply("renameSuccess", newName);
      }
      case 'check': {
        if (!user) return reply("noAccount");
        return reply("checkAccount", user.name, this.formatNumber(user.balance));
      }
      case 'deposit': {
        if (!user) return reply("noAccount");
        const amount = args[1] === 'all' ? user.balance : parseInt(args[1]);
        if (isNaN(amount) || amount <= 0) return message.reply(getLang("invalidAmount"));
        user.balance += amount;
        user.history.push({ type: 'deposit', amount });
        writeData(bankData);
        return reply("depositSuccess", this.formatNumber(amount), this.formatNumber(user.balance));
      }
      case 'withdraw': {
        if (!user) return reply("noAccount");
        const amount = args[1] === 'all' ? user.balance : parseInt(args[1]);
        if (isNaN(amount) || amount <= 0 || amount > user.balance) return message.reply(getLang("invalidAmount"));
        user.balance -= amount;
        user.history.push({ type: 'withdraw', amount });
        writeData(bankData);
        return reply("withdrawSuccess", this.formatNumber(amount), this.formatNumber(user.balance));
      }
      case 'transfer': {
        if (!user) return reply("noAccount");
        const amount = args[1] === 'all' ? user.balance : parseInt(args[1]);
        const recipientName = args[2];
        const recipientId = Object.keys(bankData).find(key => bankData[key].name === recipientName);
        if (!recipientId || isNaN(amount) || amount <= 0 || amount > user.balance) return message.reply("Invalid transfer.");
        const recipient = bankData[recipientId];
        user.balance -= amount;
        recipient.balance += amount;
        user.history.push({ type: 'transfer', amount, to: recipient.name });
        recipient.history.push({ type: 'received', amount, from: user.name });
        writeData(bankData);
        return reply("transferSuccess", this.formatNumber(amount), recipient.name, this.formatNumber(user.balance));
      }
      case 'insurance': {
        if (!user) return reply("noAccount");
        const amount = parseInt(args[1]);
        if (isNaN(amount) || amount <= 0) return message.reply(getLang("invalidAmount"));
        if (amount > user.balance) return message.reply(getLang("notEnoughFunds"));
        user.insuranceBalance += amount;
        user.balance -= amount;
        user.history.push({ type: 'insurance', amount });
        writeData(bankData);
        return reply("insuranceSuccess", this.formatNumber(amount), this.formatNumber(user.insuranceBalance));
      }
      case 'steal': {
        if (!user) return reply("noAccount");
        const amount = parseInt(args[1]);
        const targetName = args[2];
        const targetId = Object.keys(bankData).find(key => bankData[key].name === targetName);
        if (!targetId || isNaN(amount) || amount <= 0) return message.reply("Invalid steal attempt.");
        const target = bankData[targetId];
        const success = Math.random() < 0.5; // 50% chance of success
        if (success) {
          const stealAmount = Math.min(amount, target.balance);
          user.balance += stealAmount;
          target.balance -= stealAmount;
          user.history.push({ type: 'steal', amount: stealAmount, from: target.name });
          target.history.push({ type: 'stolen', amount: stealAmount, by: user.name });
          writeData(bankData);
          return reply("stealSuccess", this.formatNumber(stealAmount), target.name, 'successfully');
        } else {
          return message.reply(`Failed to steal 💵 ${this.formatNumber(amount)} from ${targetName}.`);
        }
      }
      case 'history': {
        if (!user) return reply("noAccount");
        const history = user.history.map(h => `${h.type}: ${this.formatNumber(h.amount)}`).join('\n') || "No transactions.";
        return reply("historyMessage", history);
      }
      case 'loan': {
        if (!user) return reply("noAccount");
        const loanAmount = parseInt(args[1]);
        if (isNaN(loanAmount) || loanAmount <= 0) return message.reply(getLang("invalidAmount"));
        user.balance += loanAmount;
        user.history.push({ type: 'loan', amount: loanAmount });
        writeData(bankData);
        return reply("loanRequest", this.formatNumber(loanAmount));
      }
      case 'invest': {
        if (!user) return reply("noAccount");
        const investAmount = parseInt(args[1]);
        if (isNaN(investAmount) || investAmount <= 0 || investAmount > user.balance) return message.reply("Invalid investment.");
        user.balance -= investAmount;
        user.history.push({ type: 'invest', amount: investAmount });
        writeData(bankData);
        return reply("investSuccess", this.formatNumber(investAmount));
      }
      case 'close': {
        if (!user) return reply("noAccount");
        delete bankData[userId];
        writeData(bankData);
        return reply("closeSuccess");
      }
      default:
        return reply("helpMessage");
    }
  },

  getBalance: async function(userId, usersData) {
    const user = await usersData.get(userId);
    return user.balance || 0;
  },

  updateBalance: async function(userId, usersData, amount) {
    const user = await usersData.get(userId);
    user.balance = (user.balance || 0) + amount;
    await usersData.set(userId, user);
  },

  formatNumber: function(num) {
    return num.toLocaleString(); // Format number with commas
  }
};
