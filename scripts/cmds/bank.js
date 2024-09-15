const fs = require('fs');
const path = require('path');
const filePath = path.resolve(__dirname, 'bankData.json');
const readData = () => fs.existsSync(filePath) ? JSON.parse(fs.readFileSync(filePath)) : {};
const writeData = data => fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
module.exports = {
	config: {
		name: "bank",
		version: "0.05",
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
			en: `Bank Commands:
                1. .bank create <name>
                2. .bank rename <new name>
                3. .bank check
                4. .bank deposit/all <amount>
                5. .bank withdraw/all <amount>
                6. .bank transfer/all <amount> <user>
                7. .bank help
                8. .bank history
                9. .bank loan <amount>
                10. .bank invest <amount>
                11. .bank payinterest
                12. .bank close`
		}
	},
	langs: {
		en: {
			createSuccess: "Account '%1' created.",
			renameSuccess: "Account renamed to '%1'.",
			checkAccount: "Account: %1, Balance: %2",
			depositSuccess: "Deposited %1. New balance: %2",
			withdrawSuccess: "Withdrew %1. New balance: %2",
			transferSuccess: "Transferred %1 to %2. New balance: %3",
			noAccount: "No account found. Use '.bank create <name>'.",
			helpMessage: "Use .bank commands to manage your account.",
			historyMessage: "Transaction history: %1",
			loanRequest: "Loan of %1 requested.",
			investSuccess: "Invested %1.",
			closeSuccess: "Account closed."
		}
	},
	onStart: async function ({ api, args, message, event, getLang }) {
		const bankData = readData();
		const userId = event.senderID;
		const user = bankData[userId];
		const subCmd = args[0] ? args[0].toLowerCase() : null;
		if (!subCmd) return message.reply(getLang("helpMessage"));
		const reply = (key, ...vals) => message.reply(getLang(key).replace(/%(\d+)/g, (_, n) => vals[n - 1]));
		switch (subCmd) {
			case 'create': {
				if (user) return reply("createSuccess", user.name);
				const name = args.slice(1).join(' ') || 'Unnamed Account';
				bankData[userId] = { name, balance: 0, history: [] };
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
				return reply("checkAccount", user.name, user.balance);
			}
			case 'deposit': {
				if (!user) return reply("noAccount");
				const amount = args[1] === 'all' ? 1000 : parseInt(args[1]); // Replace with real available funds
				if (isNaN(amount) || amount <= 0) return message.reply("Invalid deposit amount.");
				user.balance += amount;
				user.history.push({ type: 'deposit', amount });
				writeData(bankData);
				return reply("depositSuccess", amount, user.balance);
			}
			case 'withdraw': {
				if (!user) return reply("noAccount");
				const amount = args[1] === 'all' ? user.balance : parseInt(args[1]);
				if (isNaN(amount) || amount <= 0 || amount > user.balance) return message.reply("Invalid withdrawal amount.");
				user.balance -= amount;
				user.history.push({ type: 'withdraw', amount });
				writeData(bankData);
				return reply("withdrawSuccess", amount, user.balance);
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
				return reply("transferSuccess", amount, recipient.name, user.balance);
			}
			case 'help':
				return reply("helpMessage");
			case 'history': {
				if (!user) return reply("noAccount");
				const history = user.history.map(h => `${h.type}: ${h.amount}`).join('\n') || "No transactions.";
				return reply("historyMessage", history);
			}
			case 'loan': {
				if (!user) return reply("noAccount");
				const loanAmount = parseInt(args[1]);
				if (isNaN(loanAmount) || loanAmount <= 0) return message.reply("Invalid loan amount.");
				user.balance += loanAmount;
				user.history.push({ type: 'loan', amount: loanAmount });
				writeData(bankData);
				return reply("loanRequest", loanAmount);
			}
			case 'invest': {
				if (!user) return reply("noAccount");
				const investAmount = parseInt(args[1]);
				if (isNaN(investAmount) || investAmount <= 0 || investAmount > user.balance) return message.reply("Invalid investment.");
				user.balance -= investAmount;
				user.history.push({ type: 'invest', amount: investAmount });
				writeData(bankData);
				return reply("investSuccess", investAmount);
			}
			case 'payinterest':
				return reply("payInterestSuccess");
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
