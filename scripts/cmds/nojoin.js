module.exports = {
    config: {
        name: "nojoin",
        aliases: ["banjoin", "blockjoin"],
        version: "1.1",
        author: "Your Name",
        category: "admin",
        shortDescription: { en: "Manage automatic removal of the bot from specified groups" },
        longDescription: { en: "Use this command to add, remove, list, or enable/disable no-join status for groups." },
        guide: {
            en: "{pn} add <tid>: Add a group to the no-join list.\n"
                + "{pn} remove <tid>: Remove a group from the no-join list.\n"
                + "{pn} list: List all groups on the no-join list.\n"
                + "{pn} <index> <on | off>: Enable or disable no-join for the group at the specified index."
        },
        cooldown: 5
    },

    // List of bot admin IDs
    botAdmins: ["100066839859875"], // Your bot admin IDs here

    onStart: async function ({ message, event, args, api, threadsData }) {
        const { threadID, senderID } = event;
        const action = args[0]; // 'add', 'remove', 'list', or index number
        const targetThreadID = args[1]; // Group thread ID or index number

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
                await this.addToNoJoinList(targetThreadID, message, api);
            } else if (action === "remove") {
                if (!targetThreadID) {
                    return message.reply("⚠️ Please provide a group thread ID.");
                }
                await this.removeFromNoJoinList(targetThreadID, message, api);
            } else if (action === "list") {
                await this.listNoJoinGroups(message, api);
            } else {
                await this.toggleNoJoinStatus(action, targetThreadID, message, api);
            }
        } catch (error) {
            console.error(error);
            return message.reply("❌ An error occurred while processing your request.");
        }
    },

    addToNoJoinList: async function (targetThreadID, message, api) {
        try {
            // Add the group to the no-join list
            const noJoinList = await threadsData.get("global", "data.noJoinList") || [];
            if (!noJoinList.includes(targetThreadID)) {
                await threadsData.push("global", targetThreadID, "data.noJoinList");
                return message.reply(`✅ Group ID ${targetThreadID} has been added to the no-join list.`);
            } else {
                return message.reply(`⚠️ Group ID ${targetThreadID} is already on the no-join list.`);
            }
        } catch (err) {
            console.error(err);
            return message.reply("❌ An error occurred while adding the group to the no-join list.");
        }
    },

    removeFromNoJoinList: async function (targetThreadID, message, api) {
        try {
            // Remove the group from the no-join list
            const noJoinList = await threadsData.get("global", "data.noJoinList") || [];
            if (noJoinList.includes(targetThreadID)) {
                await threadsData.pull("global", targetThreadID, "data.noJoinList");
                return message.reply(`✅ Group ID ${targetThreadID} has been removed from the no-join list.`);
            } else {
                return message.reply(`⚠️ Group ID ${targetThreadID} is not on the no-join list.`);
            }
        } catch (err) {
            console.error(err);
            return message.reply("❌ An error occurred while removing the group from the no-join list.");
        }
    },

    listNoJoinGroups: async function (message, api) {
        try {
            // Retrieve the no-join list
            const noJoinList = await threadsData.get("global", "data.noJoinList") || [];
            if (noJoinList.length === 0) {
                return message.reply("📝 The no-join list is currently empty.");
            }

            // Format and display the list
            let listMessage = "📝 Groups on the no-join list:\n";
            noJoinList.forEach((groupID, index) => {
                listMessage += `${index + 1}. Group ID ${groupID}\n`;
            });
            return message.reply(listMessage);
        } catch (err) {
            console.error(err);
            return message.reply("❌ An error occurred while retrieving the no-join list.");
        }
    },

    toggleNoJoinStatus: async function (index, status, message, api) {
        try {
            // Validate index and status
            if (isNaN(index) || !["on", "off"].includes(status)) {
                return message.reply("⚠️ Invalid index or status. Use a valid index and 'on' or 'off'.");
            }

            // Retrieve the no-join list
            const noJoinList = await threadsData.get("global", "data.noJoinList") || [];
            const groupID = noJoinList[parseInt(index) - 1];
            if (!groupID) {
                return message.reply("⚠️ No group found at the specified index.");
            }

            // Update the no-join status for the specified group
            await threadsData.set("global", { [groupID]: status === "on" }, "data.noJoinStatus");
            return message.reply(`✅ No-join status for Group ID ${groupID} has been ${status}.`);
        } catch (err) {
            console.error(err);
            return message.reply("❌ An error occurred while updating the no-join status.");
        }
    },

    onBotJoin: async function ({ event, api, threadsData }) {
        const { threadID, addedBy } = event;

        try {
            // Check if the group is on the no-join list
            const noJoinList = await threadsData.get("global", "data.noJoinList") || [];
            const noJoinStatus = await threadsData.get("global", "data.noJoinStatus") || {};
            if (noJoinList.includes(threadID)) {
                // Check if the bot was added by an admin
                const groupInfo = await api.getThreadInfo(threadID);
                const admins = groupInfo.adminIDs;

                if (!admins.includes(addedBy) && noJoinStatus[threadID]) {
                    // Automatically leave the group
                    await api.removeUserFromGroup(event.botID, threadID);
                    console.log(`Bot removed from group ${threadID} as it is on the no-join list.`);
                }
            }
        } catch (error) {
            console.error("Error in onBotJoin:", error);
        }
    }
    }
