const axios = require("axios");

// Store permanently disapproved and basic disapproved groups
const permanentlyDisapprovedGroups = new Set();
const basicDisapprovedGroups = new Set();

module.exports = {
  config: {
    name: "group",
    version: "2.0",
    author: "404",
    countDown: 5,
    role: 2,
    shortDescription: "List, manage, disapprove, and approve groups.",
    longDescription: "",
    category: "box",
    guide: {
      en: "{p}list - List all groups\n{p}disapprove <tid> - Disapprove a group by its thread ID\n{p}disapprove perm <tid> - Permanently disapprove a group by its thread ID\n{p}approve <tid> - Approve a group by its thread ID\n{p}noti send <tid> <message> - Send a notification to a specific group",
    },
  },

  onStart: async function ({ api, event, args }) {
    // Validate command arguments
    if (!args.length || !["list", "disapprove", "approve", "noti"].includes(args[0])) {
      return api.sendMessage(
        `Invalid command. Please use one of the following commands:\n\n` +
        `1. {p}list - List all groups\n` +
        `2. {p}disapprove <tid> - Disapprove a group by its thread ID\n` +
        `3. {p}disapprove perm <tid> - Permanently disapprove a group by its thread ID\n` +
        `4. {p}approve <tid> - Approve a group by its thread ID\n` +
        `5. {p}noti send <tid> <message> - Send a notification to a specific group`,
        event.threadID
      );
    }

    // Handle group listing
    if (args[0] === "list") {
      const groupList = await api.getThreadList(100, null, ["INBOX"]);
      let message = "List of groups:\n";
      for (const group of groupList) {
        message += `\n- ${group.name || "Unnamed Group"} (Thread ID: ${group.threadID})`;
      }
      return api.sendMessage(message, event.threadID);
    }

    // Handle disapprove (basic or permanent)
    if (args[0] === "disapprove") {
      const threadID = args[1];
      if (!threadID) {
        return api.sendMessage("Please provide the thread ID of the group to disapprove.", event.threadID);
      }
      if (args[1] === "perm") {
        permanentlyDisapprovedGroups.add(threadID);
        return api.sendMessage(`Group with Thread ID ${threadID} permanently disapproved.`, event.threadID);
      } else {
        basicDisapprovedGroups.add(threadID);
        return api.sendMessage(`Group with Thread ID ${threadID} disapproved.`, event.threadID);
      }
    }

    // Handle approve group
    if (args[0] === "approve") {
      const threadID = args[1];
      if (!threadID) {
        return api.sendMessage("Please provide the thread ID of the group to approve.", event.threadID);
      }
      permanentlyDisapprovedGroups.delete(threadID);
      basicDisapprovedGroups.delete(threadID);
      return api.sendMessage(`Group with Thread ID ${threadID} approved.`, event.threadID);
    }

    // Handle sending notifications
    if (args[0] === "noti" && args[1] === "send") {
      if (args.length < 3) {
        return api.sendMessage("Invalid command usage. Please provide the thread ID and message.", event.threadID);
      }

      const threadID = args[2];
      const message = args.slice(3).join(" ");

      try {
        // Ensure the formatting does not break lines
        const formattedMessage = `╭─────────────⦿\n│ NOTI FROM ADMIN !!! ⚠ γουπ ΗιΜυ (100066839859875)\n│\n│ ${message}\n╰────────────⦿`;

        await api.sendMessage(formattedMessage, threadID);
        api.sendMessage(`Notification sent to group with Thread ID ${threadID}.`, event.threadID);
      } catch (error) {
        console.error("Error sending notification", error);
        api.sendMessage("An error occurred while sending the notification.", event.threadID);
      }
      return;
    }
  },
};
