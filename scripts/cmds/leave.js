module.exports = {
  config: {
    name: "leave",
    version: "1.2",
    author: "NTKhang",
    countDown: 5,
    role: 1,
    shortDescription: {
      vi: "Rời khỏi nhóm chat",
      en: "Leave the group chat"
    },
    longDescription: {
      vi: "Rời khỏi nhóm chat hiện tại",
      en: "Leave the current group chat"
    },
    category: "box chat",
    guide: {
      vi: "Sử dụng {pn} để bot tự rời khỏi nhóm chat",
      en: "Use {pn} to make the bot leave the group chat"
    }
  },

  langs: {
    vi: {
      leaveMessage: "Tạm biệt! Bot hiện đang rời khỏi cuộc trò chuyện này.",
      leaveSuccess: "Bot đã rời khỏi nhóm thành công.",
      leaveError: "Đã xảy ra lỗi khi bot cố gắng rời khỏi nhóm. Vui lòng thử lại sau."
    },
    en: {
      leaveMessage: "Goodbye! The bot is now leaving this conversation.",
      leaveSuccess: "The bot has successfully left the group.",
      leaveError: "An error occurred while attempting to leave the group. Please try again later."
    }
  },

  onStart: async function ({ message, event, api, getLang }) {
    const botID = api.getCurrentUserID();

    // Send goodbye message before leaving
    await message.reply(getLang("leaveMessage"));

    // Attempt to leave the group
    try {
      await api.removeUserFromGroup(botID, event.threadID);
      return message.reply(getLang("leaveSuccess"));
    } catch (error) {
      console.error(error);
      return message.reply(getLang("leaveError"));
    }
  }
};
