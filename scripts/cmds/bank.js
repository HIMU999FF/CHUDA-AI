const fs = require('fs');
const path = require('path');
const filePath = path.resolve(__dirname, 'bankData.json');
const readData = () => fs.existsSync(filePath) ? JSON.parse(fs.readFileSync(filePath)) : {};
const writeData = data => fs.writeFileSync(filePath, JSON.stringify(data, null, 2));

module.exports = {
	config: {
		name: "bank",
		version: "0.07",
		author: "UPoL🐔",
		countDown: 5,
		role: 0,
		shortDescription: {
			en: "💰 Manage your bank account like a pro!"
		},
		description: {
			en: "💳 Banking commands for creating, renaming, checking balance, deposits, withdrawals, transfers, loans, and more. 💸"
		},
		category: "finance",
		guide: {
			en: `🤖 **Bank Commands:**
                1. 💼 **.bank create <name>** - Open a shiny new bank account!
                2. ✏️ **.bank rename <new name>** - Give your account a fancy new name!
                3. 💵 **.bank check** - Check your account balance and feel rich!
                4. 💸 **.bank deposit/all <amount>** - Deposit some cash into your account.
                5. 🏧 **.bank withdraw/all <amount>** - Withdraw that hard-earned money!
                6. 🔄 **.bank transfer/all <amount> <user>** - Send some love (and money) to a friend!
                7. ❓ **.bank help** - Get help with all the commands.
                8. 📝 **.bank history** - Review your glorious transaction history.
                9. 💰 **.bank loan <amount>** - Need a loan? Get some quick cash here!
                10. 📈 **.bank invest <amount>** - Invest in virtual stocks, become a mogul!
                11. 🏦 **.bank payinterest** - Pay interest on your balance. 
                12. 🚪 **.bank close** - Close your bank account (😢).
                13. 🎁 **.bank daily** - Claim your daily reward! 💸
                14. 🧠 **.bank trivia** - Answer some fun banking trivia to win prizes!
                15. 🚀 **.bank upgrade** - Upgrade your bank account for exclusive benefits!
                16. 🎮 **.bank challenge** - Take on challenges to earn extra rewards!
                17. 🐾 **.bank mascot** - Meet your cute virtual bank mascot! 😍
                18. 🎡 **.bank spin** - Spin the lucky wheel and win cool prizes!`
		}
	},
	langs: {
		en: {
			createSuccess: "🎉 Account '%1' created! You're ready to go!",
			renameSuccess: "🔄 Account renamed to '%1'. Nice choice!",
			checkAccount: "🏦 Account: %1 | 💰 Balance: %2",
			depositSuccess: "✅ Deposited %1! Your new balance is: %2",
			withdrawSuccess: "🏧 Withdrew %1! Your new balance is: %2",
			transferSuccess: "💸 Transferred %1 to %2! Your new balance is: %3",
			noAccount: "🚫 No account found! Create one with '.bank create <name>'.",
			helpMessage: `🤖 **Bank Commands** to manage your virtual wealth! 💰:
1. **Create** your own bank account.
2. **Rename** your account to something cool!
3. **Check** your balance whenever you need to flex. 💪
4. **Deposit** money to save up!
5. **Withdraw** when you need to spend!
6. **Transfer** to help a friend out!
7. **View** your transaction history.
8. **Loan** money to help with your big dreams.
9. **Invest** in virtual stocks to grow your fortune!
10. **Pay** interest to keep your account healthy.
11. **Close** your account (but why would you? 😢).
12. **Claim** your daily reward for being awesome!
13. **Play** a trivia game to test your banking knowledge!
14. **Upgrade** your account to VIP status!
15. **Challenge** yourself for extra rewards!
16. **Meet** your virtual mascot, it's super cute! 😍
17. **Spin** the lucky wheel to win amazing prizes! 🎁`,
			historyMessage: "📜 Transaction history: %1",
			loanRequest: "💵 Loan of %1 requested!",
			investSuccess: "📈 Invested %1! Watch your fortune grow!",
			closeSuccess: "🚪 Account closed. We'll miss you! 😢",
			dailyReward: "🎉 Claimed your daily reward of %1! You're on a roll! 🎁",
			triviaQuestion: "🧠 Trivia Time! 🎉: %1",
			triviaCorrect: "✅ Correct! 🎉 You've earned %1.",
			triviaWrong: "❌ Oops! 😢 The correct answer was %1.",
			upgradeSuccess: "🚀 Account upgraded! Enjoy those new benefits!",
			challengeSuccess: "💪 Challenge completed! You've earned %1!",
			mascotIntroduction: "🐾 Meet your virtual bank mascot! Say hello to %1. 🏦",
			spinWin: "🎉 Congratulations! You've won %1 from the lucky spin! 🍀",
			spinLose: "🙁 No win this time, better luck next spin! 🍀"
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
				if (!newName) return message.reply("✏️ Please provide a new name!");
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
				if (isNaN(amount) || amount <= 0) return message.reply("💸 Invalid deposit amount.");
				user.balance += amount;
				user.history.push({ type: 'deposit', amount });
				writeData(bankData);
				return reply("depositSuccess", amount, user.balance);
			}
			case 'withdraw': {
				if (!user) return reply("noAccount");
				const amount = args[1] === 'all' ? user.balance : parseInt(args[1]);
				if (isNaN(amount) || amount <= 0 || amount > user.balance) return message.reply("🏧 Invalid withdrawal amount.");
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
				if (!recipientId || isNaN(amount) || amount <= 0 || amount > user.balance) return message.reply("🔄 Invalid transfer.");
				const recipient = bankData[recipientId];
				user.balance -= amount;
				recipient.balance += amount;
				user.history.push({ type: 'transfer', amount, to: recipient.name });
				recipient.history.push({ type: 'received', amount, from: user.name });
				writeData(bankData);
				return reply("transferSuccess", amount, recipient.name, user.balance);
			}
			case 'help':
				return message.reply(getLang("helpMessage"));
			case 'history': {
				if (!user) return reply("noAccount");
				const history = user.history.map(h => `${h.type}: ${h.amount}`).join('\n') || "📜 No transactions yet.";
				return reply("historyMessage", history);}
			case 'loan': {
				if (!user) return reply("noAccount");
				const loanAmount = parseInt(args[1]);
				if (isNaN(loanAmount) || loanAmount <= 0) return message.reply("💵 Invalid loan amount.");
				user.balance += loanAmount;
				user.history.push({ type: 'loan', amount: loanAmount });
				writeData(bankData);
				return reply("loanRequest", loanAmount);
			}
			case 'invest': {
				if (!user) return reply("noAccount");
				const investAmount = parseInt(args[1]);
				if (isNaN(investAmount) || investAmount <= 0 || investAmount > user.balance) return message.reply("📈 Invalid investment amount.");
				user.balance -= investAmount;
				const gain = investAmount * 1.1; // Example investment return
				user.balance += gain;
				user.history.push({ type: 'invest', amount: investAmount, gain });
				writeData(bankData);
				return reply("investSuccess", gain);
			}
			case 'payinterest': {
				if (!user) return reply("noAccount");
				const interest = user.balance * 0.05;
				user.balance -= interest;
				user.history.push({ type: 'interest', amount: interest });
				writeData(bankData);
				return reply("investSuccess", interest);
			}
			case 'close': {
				if (!user) return reply("noAccount");
				delete bankData[userId];
				writeData(bankData);
				return reply("closeSuccess");
			}
			case 'daily': {
				if (!user) return reply("noAccount");
				const dailyReward = 100; // Example reward
				user.balance += dailyReward;
				user.history.push({ type: 'daily', amount: dailyReward });
				writeData(bankData);
				return reply("dailyReward", dailyReward);
			}
			case 'trivia': {
				const questions = [
					{ q: "What is the interest rate of a typical savings account?", a: "0.01%" },
					{ q: "What does 'APR' stand for?", a: "Annual Percentage Rate" },
				];
				const randomQuestion = questions[Math.floor(Math.random() * questions.length)];
				message.reply(getLang("triviaQuestion", randomQuestion.q));

				const filter = (msg) => msg.senderID === event.senderID;
				api.listenMqtt((err, eventMsg) => {
					if (err || eventMsg.body.toLowerCase() !== randomQuestion.a.toLowerCase()) {
						return reply("triviaWrong", randomQuestion.a);
					}
					const reward = 50;
					user.balance += reward;
					user.history.push({ type: 'trivia', reward });
					writeData(bankData);
					return reply("triviaCorrect", reward);
				});
				break;
			}
			case 'upgrade': {
				if (!user) return reply("noAccount");
				const upgradeCost = 500;
				if (user.balance < upgradeCost) return message.reply("🚀 Not enough funds to upgrade.");
				user.balance -= upgradeCost;
				user.history.push({ type: 'upgrade', amount: upgradeCost });
				writeData(bankData);
				return reply("upgradeSuccess");
			}
			case 'challenge': {
				const reward = 200;
				user.balance += reward;
				user.history.push({ type: 'challenge', reward });
				writeData(bankData);
				return reply("challengeSuccess", reward);
			}
			case 'mascot': {
				if (!user) return reply("noAccount");
				const mascots = ['🐱', '🐶', '🦊', '🐻'];
				const randomMascot = mascots[Math.floor(Math.random() * mascots.length)];
				return reply("mascotIntroduction", randomMascot);
			}
			case 'spin': {
				if (!user) return reply("noAccount");
				const prizes = [0, 100, 1000, 10000];
				const prize = prizes[Math.floor(Math.random() * prizes.length)];
				if (prize === 0) return reply("spinLose");
				user.balance += prize;
				user.history.push({ type: 'spin', prize });
				writeData(bankData);
				return reply("spinWin", prize);
			}
			default:
				return message.reply(getLang("helpMessage"));
		}
	}
};
