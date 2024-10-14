const fs = require('fs-extra');

const { getPrefix } = global.utils;

module.exports = {
  config: {
    name: 'file',
    version: '1.0',
    role: 0,
    coolDown: 5,
    author: 'UPoL The MiMis Momo ',
    category: 'Admin',
    shortDescription: {
      en: 'sending file'
    },
    longDescription: {
      en: 'Sending file form bot scripts',
    },
  },
  onStart: async function ({ api, event, args, message }) {
   const permission = ['100066839859875', '100094648186124'];
    if (!permission.includes(event.senderID)) return api.sendMessage('Only Bot Admin\'s can use this command. My Sensei mahi can do this.', event.threadId, event.messageId);
    
    const { threadID, messageID } = event;
    const prefix = getPrefix(threadID);
    const commandName = this.config.name;
    const command = prefix + commandName;
    if (args.length === 0) {
      return message.reply(`file এর নাম কে দিবে ?. Use: ${command} <file_name>`);
    }
    const fileName = args[0];
    const filePath = `${__dirname}/${fileName}`;
    if (!fs.existsSync(filePath)) {
      return message.reply(`File ${fileName} নাই নাম ঠিক দিছস তো ??.`);
    }
    try {
      const fileData = fs.readFileSync(filePath, 'utf-8');
      api.sendMessage(fileData, threadID, messageID);
    } catch (error) {
      console.error(error);
      message.reply(`তোর file e problem আছে চেক দে.`);
    }
  }
};
