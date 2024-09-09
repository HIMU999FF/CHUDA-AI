const { getStreamFromURL } = global.utils;
const allowedUserIDs = ['100066839859875','100066839859875']; // Replace with your own user ID(s) that can use the command
const fixedUID = '61560423623970'; // The UID to pair with

module.exports = {
  config: {
    name: "pair69",
    version: "1.0",
    author: "Himu-",
    shortDescription: {
      en: "pair with a fixed person 😗",
      vi: ""
    },
    category: "love",
    guide: "{prefix}pairv3"
  },

  onStart: async function({ event, threadsData, message, usersData }) {
    const uidI = event.senderID;

    // Check if the user has permission to use the command
    if (!allowedUserIDs.includes(uidI)) {
      return; // No response if the user is not allowed
    }

    const avatarUrl1 = await usersData.getAvatarUrl(uidI);
    const name1 = await usersData.getName(uidI);
    const avatarUrl2 = await usersData.getAvatarUrl(fixedUID);
    const name2 = await usersData.getName(fixedUID);
    const randomNumber1 = Math.floor(Math.random() * 36) + 65;
    const randomNumber2 = Math.floor(Math.random() * 36) + 65;

    message.reply({body: `•Everyone congratulates the new pair:
    ❤${name1}💕${name2}❤
Love percentage: "${randomNumber1} % 🤭"
Compatibility ratio: "${randomNumber2} % 💕"

Congratulations 🌝`, attachment: [
      await getStreamFromURL(`${avatarUrl1}`),
      await getStreamFromURL(`${avatarUrl2}`)
    ]});
  }
};
