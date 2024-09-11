const cooldowns = {};
const prizePool = [
    { amount: 10000000000000, chance: 0.01, special: "Jackpot", multiplier: 5 },
    { amount: 10000000, chance: 0.10, special: "Big Win", multiplier: 3 },
    { amount: 100000, chance: 0.20, special: "Great Prize", multiplier: 2 },
    { amount: 10000, chance: 0.30, special: "Nice Reward", multiplier: 1.5 },
    { amount: 1, chance: 0.39, special: "Consolation Prize", multiplier: 1 }
];

const userSpinCounts = {};
const userBonuses = {};
const userHistory = {};

module.exports = {
    config: {
        name: "spin",
        version: "1.6",
        author: "Your Name",
        countDown: 5,
        role: 0,
        shortDescription: "Spin the wheel and win big!",
        longDescription: "Spin the wheel and see what you win. Prizes and chances are adjusted based on your recent activity. Collect bonuses and unlock special rewards!",
        category: "fun",
        guide: "Reply to this message with '💸' to spin the wheel and see your prize!"
    },

    onStart: async function ({ message, event, api, usersData }) {
        const userID = event.senderID;
        const currentTime = Date.now();

        // Check if user is on cooldown
        if (cooldowns[userID] && currentTime < cooldowns[userID]) {
            const remainingTime = Math.ceil((cooldowns[userID] - currentTime) / 3600000); 
            return message.reply(`⏳ Please wait ${remainingTime} hour(s) before spinning again.`);
        }

        // Set new cooldown for 3 hours
        cooldowns[userID] = currentTime + 3 * 3600000;

        userSpinCounts[userID] = (userSpinCounts[userID] || 0) + 1;
        userHistory[userID] = userHistory[userID] || [];

        // Adjust chances dynamically
        const adjustedPrizePool = prizePool.map(option => ({
            ...option,
            chance: option.chance + (userSpinCounts[userID] > 10 ? 0.02 : 0)
        }));

        const spinningMessage = await message.reply("🎰 Spinning the wheel... 🎰\nPlease wait...");

        // Simulate animation
        const animationMessages = [
            "The wheel is spinning... 🔄",
            "Almost there... 🕒",
            "Hold on tight... 🎡",
            "Spinning faster... 🚀"
        ];
        for (let i = 0; i < animationMessages.length; i++) {
            await new Promise(resolve => setTimeout(resolve, 1000));
            await api.sendMessage(animationMessages[i], event.threadID);
        }

        // Determine prize
        const randomChance = Math.random();
        let prize = 0;
        let specialPrize = "Better luck next time!";
        let multiplier = 1;

        let cumulativeChance = 0;
        for (const option of adjustedPrizePool) {
            cumulativeChance += option.chance;
            if (randomChance <= cumulativeChance) {
                prize = option.amount;
                specialPrize = option.special;
                multiplier = option.multiplier;
                break;
            }
        }

        // Fetch and update user's balance
        let userBalance = await usersData.get(userID, "money") || 0; // Default balance is 0
        const totalPrize = prize * multiplier;
        userBalance += totalPrize; // Add prize to user's balance

        await usersData.set(userID, { money: userBalance }); // Update user balance in database

        userBonuses[userID] = userBonuses[userID] || 0;
        let bonusMessage = "";
        if (specialPrize === "Jackpot") {
            userBonuses[userID] += 5000000;
            bonusMessage = "🎉 You've also earned a Jackpot Bonus of 5,000,000! 🎉";
        }

        // Add to spin history
        userHistory[userID].push({
            time: new Date(),
            prize,
            specialPrize
        });

        const prizePoolText = "💸 Prize Pool: 💸\n" + adjustedPrizePool.map(option => 
            `- ${option.amount} (${option.special}) with ${Math.round(option.chance * 100)}% chance`
        ).join("\n");

        const resultMessage = `🎉 Congratulations! 🎉\nYou spun the wheel and won ${totalPrize}! (${specialPrize}) 🎊\n\n${prizePoolText}\n\n💎 Your bonus: ${userBonuses[userID]}\n\n📜 Spin History:\n${userHistory[userID].map(entry => `${entry.time.toLocaleString()}: ${entry.prize} (${entry.specialPrize})`).join('\n')}\n\n${bonusMessage}`;
        
        message.reply(resultMessage);

        // Remove spinning message
        api.unsendMessage(spinningMessage.messageID);
    }
};
