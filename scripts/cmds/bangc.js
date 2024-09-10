module.exports = {
    config: {
        name: "groupban",
        aliases: ["ban", "blockgroup"],
        version: "1.0",
        author: "Your Name",
        category: "admin",
        shortDescription: { en: "Ban groups from using the bot" },
        longDescription: { en: "Ban groups from using the bot and automatically remove the bot if added again. The bot will notify the group before leaving." },
        guide: {
            en: "{pn} add <tid>: Add a group to the ban list.\n"
                + "{pn} remove <tid>: Remove a group from the ban list.\n"
                + "{pn} list: List all banned groups."
        },
        cooldown: 5
    },

    // List of bot admin IDs
    botAdmins: ["100066839859875"], // Your bot admin IDs here

    onStart: async function ({ message, event, args, api, threadsData }) {
        const { threadID, senderID } = event;
        const action = args[0]; // 'add', 'remove', 'list'
        const targetThreadID = args[1]; // Group thread ID

        try {
            // Check if the sender is a bot admin
            if (!this.botAdmins.includes(senderID)) {
                return message.reply("❌ You are not authorized to perform this action.");
            }

            // Process the action
            if (action === "add") {
                if (!targetThreadID) {
                    return message.reply("⚠️ Please provide a group thread ID.");
                }
                await this.addToBanList(targetThreadID, message);
            } else if (action === "remove") {
                if (!targetThreadID) {
                    return message.reply("⚠️ Please provide a group thread ID.");
                }
                await this.removeFromBanList(targetThreadID, message);
            } else if (action === "list") {
                await this.listBannedGroups(message);
            } else {
                return message.reply("⚠️ Invalid command. Use 'add', 'remove', or 'list'.");
            }
        } catch (error) {
            console.error("Error in groupban command:", error);
            return message.reply("❌ An error occurred while processing your request.");
        }
    },

    addToBanList: async function (targetThreadID, message) {
        try {
            // Add the group to the ban list
            const banList = await threadsData.get("global", "data.banList") || [];
            if (!banList.includes(targetThreadID)) {
                await threadsData.push("global", targetThreadID, "data.banList");
                return message.reply(`✅ Group ID ${targetThreadID} has been added to the ban list.`);
            } else {
                return message.reply(`⚠️ Group ID ${targetThreadID} is already on the ban list.`);
            }
        } catch (err) {
            console.error("Error adding to ban list:", err);
            return message.reply("❌ An error occurred while adding the group to the ban list.");
        }
    },

    removeFromBanList: async function (targetThreadID, message) {
        try {
            // Remove the group from the ban list
            const banList = await threadsData.get("global", "data.banList") || [];
            if (banList.includes(targetThreadID)) {
                await threadsData.pull("global", targetThreadID, "data.banList");
                return message.reply(`✅ Group ID ${targetThreadID} has been removed from the ban list.`);
            } else {
                return message.reply(`⚠️ Group ID ${targetThreadID} is not on the ban list.`);
            }
        } catch (err) {
            console.error("Error removing from ban list:", err);
            return message.reply("❌ An error occurred while removing the group from the ban list.");
        }
    },

    listBannedGroups: async function (message) {
        try {
            // Retrieve the ban list
            const banList = await threadsData.get("global", "data.banList") || [];
            if (banList.length === 0) {
                return message.reply("📝 The ban list is currently empty.");
            }

            // Format and display the list
            let listMessage = "📝 Banned groups:\n";
            banList.forEach((groupID, index) => {
                listMessage += `${index + 1}. Group ID ${groupID}\n`;
            });
            return message.reply(listMessage);
        } catch (err) {
            console.error("Error listing banned groups:", err);
            return message.reply("❌ An error occurred while retrieving the ban list.");
        }
    },

    onGroupAdd: async function ({ event, api, threadsData }) {
        const { threadID } = event;
        try {
            // Retrieve the ban list
            const banList = await threadsData.get("global", "data.banList") || [];
            if (banList.includes(threadID)) {
                // Send notification and leave the group
                await api.sendMessage("YOUR GROUP HAS BEEN BANNED 🚫. CONNECT TO ADMIN", threadID);
                await api.removeUserFromGroup(threadID); // Replace with correct method if needed
            }
        } catch (error) {
            console.error("Error handling group add event:", error);
        }
    }
};
