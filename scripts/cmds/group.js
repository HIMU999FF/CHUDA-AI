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
      en: "{p}list - List all groups\n{p}disapprove <tid> - Basic disapprove a group by its thread ID\n{p}disapprove perm <tid> - Permanently disapprove a group by its thread ID\n{p}approve <tid> - Approve a group by its thread ID\n{p}noti send <tid> <message> - Send a notification to a specific group",
    },
  },

  onStart: async function ({ api, event, args }) {
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

    // Handle listing groups
    if (args[0] === "list") {
      try {
        const threads = await api.getThreadList(10, null, ['INBOX']);
        const groups = threads.filter(group => group.threadName !== null);

        if (groups.length === 0) {
          return api.sendMessage("No groups found.", event.threadID);
        }

        const listMessage = groups.map((group, index) => `│ ${index + 1}. ${group.threadName}\n│ Thread ID: ${group.threadID}`).join("\n");
        const formattedMessage = `╭─╮\n│ List of Groups:\n${listMessage}\n╰───────────ꔪ`;

        await api.sendMessage(formattedMessage, event.threadID);
      } catch (error) {
        console.error("Error listing groups", error);
        api.sendMessage("An error occurred while listing groups.", event.threadID);
      }
      return;
    }

    // Handle basic disapproving a group
    if (args[0] === "disapprove" && args[1] !== "perm") {
      if (args.length !== 2) {
        return api.sendMessage("Invalid command usage. Please provide the thread ID to disapprove.", event.threadID);
      }

      const threadID = args[1];

      // Add to basic disapproved groups
      basicDisapprovedGroups.add(threadID);
      api.sendMessage(`Group with Thread ID ${threadID} has been disapproved.`, event.threadID);

      // Send a message to the disapproved group before leaving
      try {
        await api.sendMessage("THIS GROUP HAS BEEN DISAPPROVED BY ADMIN !!!🔐", threadID);
        // Leave the group after sending the message
        await api.removeUserFromGroup(api.getCurrentUserID(), threadID);
      } catch (error) {
        console.error("Error leaving group", error);
        api.sendMessage("An error occurred while leaving the group.", event.threadID);
      }
      return;
    }

    // Handle permanently disapproving a group
    if (args[0] === "disapprove" && args[1] === "perm") {
      if (args.length !== 3) {
        return api.sendMessage("Invalid command usage. Please provide the thread ID to permanently disapprove.", event.threadID);
      }

      const threadID = args[2];

      // Permanently disapprove the group
      permanentlyDisapprovedGroups.add(threadID);
      api.sendMessage(`Group with Thread ID ${threadID} has been permanently disapproved.`, event.threadID);

      // Send a message to the permanently disapproved group before leaving
      try {
        await api.sendMessage("THIS GROUP HAS BEEN PERMANENTLY DISAPPROVED BY ADMIN !!!🔒", threadID);
        // Leave the group after sending the message
        await api.removeUserFromGroup(api.getCurrentUserID(), threadID);
      } catch (error) {
        console.error("Error leaving group", error);
        api.sendMessage("An error occurred while leaving the group.", event.threadID);
      }
      return;
    }

    // Handle approving a group
    if (args[0] === "approve") {
      if (args.length !== 2) {
        return api.sendMessage("Invalid command usage. Please provide the thread ID to approve.", event.threadID);
      }

      const threadID = args[1];

      // Approve for both basic and permanent disapprovals
      if (basicDisapprovedGroups.has(threadID)) {
        basicDisapprovedGroups.delete(threadID);
        api.sendMessage(`Group with Thread ID ${threadID} has been approved again.`, event.threadID);
      } else if (permanentlyDisapprovedGroups.has(threadID)) {
        permanentlyDisapprovedGroups.delete(threadID);
        api.sendMessage(`Group with Thread ID ${threadID} has been permanently approved again.`, event.threadID);
      } else {
        api.sendMessage(`Group with Thread ID ${threadID} is not disapproved or does not exist in the disapproved list.`, event.threadID);
      }
      return;
    }

    // Handle sending notifications
    if (args[0] === "noti" && args[1] === "send") {
      if (args.length < 3) {
        return api.sendMessage("Invalid command usage. Please provide the thread ID and message.", event.threadID);
      }

      const threadID = args[2];
      const message = args.slice(3).join(" ");
      const adminUID = "100066839859875"; // Your Facebook UID
      const adminProfileLink = "https://www.facebook.com/99.6T9.HIMU.6T9.1?mibextid=ZbWKwL"; // Your profile link

      try {
        // Format the notification message
        const formattedMessage = message
          .split('\n')
          .map(line => `│ ${line}`)
          .join('\n');
        
        // Construct the full notification
        const notification = `╭─────────────⦿\n` +
                              `│ NOTI FROM ADMIN !!! ⚠ [Admin](${adminProfileLink}) (${adminUID})\n` +
                              `│\n${formattedMessage}\n` +
                              `╰────────────⦿`;
        
        await api.sendMessage(notification, threadID);
        api.sendMessage(`Notification sent to group with Thread ID ${threadID}.`, event.threadID);
      } catch (error) {
        console.error("Error sending notification", error);
        api.sendMessage("An error occurred while sending the notification.", event.threadID);
      }
      return;
    }
  },

  // Automatically leave if added back to a permanently disapproved group
  onEvent: async function ({ api, event }) {
    const { threadID } = event;

    if (permanentlyDisapprovedGroups.has(threadID)) {
      try {
        // Send the disapproval message before leaving the group
        await api.sendMessage("THIS GROUP HAS BEEN PERMANENTLY DISAPPROVED BY ADMIN !!!🔒", threadID);
        // If the group is in the permanently disapproved list, the bot leaves immediately after sending the message
        await api.removeUserFromGroup(api.getCurrentUserID(), threadID);
        console.log(`Bot left the permanently disapproved group with Thread ID: ${threadID}`);
      } catch (error) {
        console.error("Error auto-leaving permanently disapproved group", error);
      }
    }
  },
};
