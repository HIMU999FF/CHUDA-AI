const fs = require('fs');
const path = require('path');
const filePath = path.resolve(__dirname, 'bankData.json');

const readData = () => fs.existsSync(filePath) ? JSON.parse(fs.readFileSync(filePath)) : {};
const writeData = data => fs.writeFileSync(filePath, JSON.stringify(data, null, 2));

module.exports = {
    config: {
        name: "bank",
        version: "0.1",
        author: "UPoL🐔",
        countDown: 5,
        role: 0,
        shortDescription: {
            en: "Manage your bank account."
        },
        description: {
            en: "Banking commands for creating, renaming, checking balance, deposits, withdrawals, transfers, loans, and more."
        },
        category: "finance",
        guide: {
            en: `**Bank Commands:**
                1. \`.bank create <name>\` - Create a new account with the specified name. 💼
                2. \`.bank rename <new name>\` - Rename your current account. ✏️
                3. \`.bank check\` - Check your account details and balance. 💰
                4. \`.bank deposit/all <amount>\` - Deposit a specific amount or all your available funds. 💵
                5. \`.bank withdraw/all <amount>\` - Withdraw a specific amount or all your balance. 💸
                6. \`.bank transfer/all <amount> <user>\` - Transfer a specific amount or all your balance to another user. 💳
                7. \`.bank help\` - Show this help message. 🆘
                8. \`.bank history\` - View your transaction history. 🗃️
                9. \`.bank loan <amount>\` - Request a loan of a specific amount. 💳
                10. \`.bank invest <amount>\` - Invest a specific amount. 📈
                11. \`.bank payinterest\` - Pay interest on your account. 💼
                12. \`.bank close\` - Close your bank account. 🚪`
        }
    },
    langs: {
        en: {
            createSuccess: "🎉 Account '%1' created successfully!",
            renameSuccess: "✏️ Account renamed to '%1'.",
            checkAccount: "💼 Account: %1\n💰 Balance: %2",
            depositSuccess: "💵 Deposited %1. New balance: %2",
            withdrawSuccess: "💸 Withdrew %1. New balance: %2",
            transferSuccess: "💳 Transferred %1 to %2. New balance: %3",
            noAccount: "❌ No account found. Use '.bank create <name>' to create one.",
            helpMessage: "🆘 Use '.bank <command>' to manage your account. Type '.bank help' for a list of commands.\n\n![Help Image](https://i.ibb.co.com/ZhrSwzR/Yellow-Modern-World-Bank-Day-Instagram-Post-20240915-000015-0000.png)",
            historyMessage: "🗃️ Transaction history:\n%1",
            loanRequest: "💳 Loan of %1 requested and added to your balance.",
            investSuccess: "📈 Invested %1 successfully.",
            closeSuccess: "🚪 Account closed successfully.",
            helpCommand: `**Bank Commands:**
                1. \`.bank create <name>\` - Create a new account with the specified name. 💼
                2. \`.bank rename <new name>\` - Rename your current account. ✏️
                3. \`.bank check\` - Check your account details and balance. 💰
                4. \`.bank deposit/all <amount>\` - Deposit a specific amount or all your available funds. 💵
                5. \`.bank withdraw/all <amount>\` - Withdraw a specific amount or all your balance. 💸
                6. \`.bank transfer/all <amount> <user>\` - Transfer a specific amount or all your balance to another user. 💳
                7. \`.bank help\` - Show this help message. 🆘
                8. \`.bank history\` - View your transaction history. 🗃️
                9. \`.bank loan <amount>\` - Request a loan of a specific amount. 💳
                10. \`.bank invest <amount>\` - Invest a specific amount. 📈
                11. \`.bank payinterest\` - Pay interest on your account. 💼
                12. \`.bank close\` - Close your bank account. 🚪`
        }
    },
    onStart: async function ({ api, args, message, event, getLang }) {
        const bankData = readData();
        const userId = event.senderID;
        const user = bankData[userId];
        const subCmd = args[0] ? args[0].toLowerCase() : null;
        const subCmdArg = args.slice(1).join(' ');

        const reply = (key, ...vals) => message.reply(getLang(key).replace(/%(\d+)/g, (_, n) => vals[n - 1]));
        
        if (!subCmd) return reply("helpMessage");

        switch (subCmd) {
            case 'help': {
                return reply("helpCommand");
            }
            case 'create': {
                if (user) return reply("createSuccess", user.name);
                const name = subCmdArg || 'Unnamed Account';
                bankData[userId] = { name, balance: 0, history: [] };
                writeData(bankData);
                return reply("createSuccess", name);
            }
            case 'rename': {
                if (!user) return reply("noAccount");
                if (!subCmdArg) return message.reply("📝 Please provide a new name.");
                user.name = subCmdArg;
                writeData(bankData);
                return reply("renameSuccess", subCmdArg);
            }
            case 'check': {
                if (!user) return reply("noAccount");
                return reply("checkAccount", user.name, user.balance);
            }
            case 'deposit': {
                if (!user) return reply("noAccount");
                const amount = subCmdArg === 'all' ? 1000 : parseInt(subCmdArg); // Replace with real available funds
                if (isNaN(amount) || amount <= 0) return message.reply("🚫 Invalid deposit amount.");
                user.balance += amount;
                user.history.push({ type: 'deposit', amount });
                writeData(bankData);
                return reply("depositSuccess", amount, user.balance);
            }
            case 'withdraw': {
                if (!user) return reply("noAccount");
                const amount = subCmdArg === 'all' ? user.balance : parseInt(subCmdArg);
                if (isNaN(amount) || amount <= 0 || amount > user.balance) return message.reply("🚫 Invalid withdrawal amount.");
                user.balance -= amount;
                user.history.push({ type: 'withdraw', amount });
                writeData(bankData);
                return reply("withdrawSuccess", amount, user.balance);
            }
            case 'transfer': {
                if (!user) return reply("noAccount");
                const [amount, recipientName] = subCmdArg.split(' ');
                const transferAmount = amount === 'all' ? user.balance : parseInt(amount);
                const recipientId = Object.keys(bankData).find(key => bankData[key].name === recipientName);
                if (!recipientId || isNaN(transferAmount) || transferAmount <= 0 || transferAmount > user.balance) return message.reply("🚫 Invalid transfer.");
                const recipient = bankData[recipientId];
                user.balance -= transferAmount;
                recipient.balance += transferAmount;
                user.history.push({ type: 'transfer', amount: transferAmount, to: recipient.name });
                recipient.history.push({ type: 'received', amount: transferAmount, from: user.name });
                writeData(bankData);
                return reply("transferSuccess", transferAmount, recipient.name, user.balance);
            }
            case 'history': {
                if (!user) return reply("noAccount");
                const history = user.history.map(h => `${h.type}: ${h.amount}`).join('\n') || "🗃️ No transactions.";
                return reply("historyMessage", history);
            }
            case 'loan': {
                if (!user) return reply("noAccount");
                const loanAmount = parseInt(subCmdArg);
                if (isNaN(loanAmount) || loanAmount <= 0) return message.reply("🚫 Invalid loan amount.");
                user.balance += loanAmount;
                user.history.push({ type: 'loan', amount: loanAmount });
                writeData(bankData);
                return reply("loanRequest", loanAmount);
            }
            case 'invest': {
                if (!user) return reply("noAccount");
                const investAmount = parseInt(subCmdArg);
                if (isNaN(investAmount) || investAmount <= 0 || investAmount > user.balance) return message.reply("🚫 Invalid investment.");
                user.balance -= investAmount;
                user.history.push({ type: 'invest', amount: investAmount });
                writeData(bankData);
                return reply("investSuccess", investAmount);
            }
            case 'payinterest': {
                    if (!user) return reply("noAccount");
                    // Implement your interest payment logic here
                    return message.reply("💼 Interest paid successfully.");
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
    }
};
