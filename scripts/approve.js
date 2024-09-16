module.exports = {
  config: {
    name: "approval",
    aliases: ["approve", "approved"],
    version: "1.0",
    author: "Akash",
    countDown: 20,
    role: 0,
    longDescription: "S",
    category: "𝗦𝗨𝗣𝗣𝗢𝗥𝗧",
    guide: { 
      en: "{pn}"
    },
  },

  onStart: async function ({ args, event, message, threadsData, api, usersData }) {
    //-----------------------//
    const senderData = await usersData.get(event.senderID);
    senderData.settings = senderData.settings || {};
    senderData.settings.request = senderData.settings.request || {};
    //-------------------------//
    const supportGroupId = "7114134812011099";
    const threadInfo = await api.getThreadInfo(supportGroupId);
    const threadMem = threadInfo.participantIDs;

    const targetThreadID = args[1] || event.threadID;
    const threadData = await threadsData.get(targetThreadID);
    const getThreadInfo = await api.getThreadInfo(targetThreadID);
    const threadName = getThreadInfo.threadName;
    const threadAdmins = getThreadInfo.adminIDs.length;
    const valuesMember = Object.values(threadData.members).filter(item => item.inGroup);
    const totalBoy = valuesMember.filter(item => item.gender == "MALE").length;
    const totalGirl = valuesMember.filter(item => item.gender == "FEMALE").length;
    const totalMessage = valuesMember.reduce((i, item) => i += item.count, 0);
    const getUserInfo = await api.getUserInfo(event.senderID);
    const userName = getUserInfo[event.senderID].name;
    const { members } = await threadsData.get(supportGroupId);
    const usersInGroup = (await api.getThreadInfo(supportGroupId)).participantIDs;
    const totalMessages = members.filter(user => usersInGroup.includes(user.userID)).reduce((acc, user) => acc + user.count, 0);
    const arraySort = members.filter(user => usersInGroup.includes(user.userID)).sort((a, b) => b.count - a.count);
    const findMemberIndex = arraySort.findIndex(user => user.userID === event.senderID);

    if (findMemberIndex === -1) {
      return message.reply('❌');
    }

    const position = findMemberIndex + 1;

    
    threadData.settings.current = threadData.settings.current || {};

    const approval = threadData.settings.approval;
    
   //------------------------------//

    if (args[0] && args[1].length !== 0 && event.senderID === '100082247235177') {
      if (args[0] === 'add') {
        const now = new Date();
        const oneMonthLater = new Date(now);
        oneMonthLater.setMonth(oneMonthLater.getMonth() + 1);
        const expiryTimestamp = oneMonthLater.getTime();

        const targetThreadData = await threadsData.get(args[1]);
        targetThreadData.settings = { 
          approval: true,
          expiry: expiryTimestamp
        };
        targetThreadData.settings.current = { status: 'approved' };
        await threadsData.set(args[1], targetThreadData);

        const options = { timeZone: "Asia/Dhaka", day: "2-digit", month: "2-digit", year: "numeric" };
        const BDTime = new Date().toLocaleDateString("en-US", options).replace(/(\d+)\/(\d+)\/(\d+)/, "$2-$1-$3");
        const expiryDate = new Date(expiryTimestamp).toLocaleDateString("en-US", options).replace(/(\d+)\/(\d+)\/(\d+)/, "$2-$1-$3");
        message.reply('Thread Approved: ' + args[1]);
        const approvalMessage = `🎉 This thread has been approved by Admin! \nValidity: 30 days\nCurrent Date: ${BDTime}\nExpiry Date: ${expiryDate}`;
        return api.sendMessage(approvalMessage, args[1]);
      } else if (args[0] === 'delete') {
        const targetThreadData = await threadsData.get(args[1]);
        targetThreadData.settings = { 
          approval: false,
          expiry: null
        }; 
        await threadsData.set(args[1], targetThreadData);

        targetThreadData.settings.current = { status: null };
        await threadsData.set(args[1], targetThreadData);
        message.reply('Thread disapproved: ' + args[1]);
        return api.sendMessage('❌ This thread has been disapproved by admin.', args[1]);
      }
    } else {
      const isSupportMember = threadMem.includes(event.senderID);
      if (isSupportMember !== true) {
        return message.reply('You must have to join support group for approval!');
      }
      const now = Date.now();
      const oneWeekLater = new Date(now);
      oneWeekLater.setDate(oneWeekLater.getDate() + 7);
      const oneWeekLaterTimestamp = oneWeekLater.getTime();

      if (!approval || approval !== true) {
        const reqSettings = threadData.settings.current || { status: 'no_request'};
        if (reqSettings.status === 'pending') {
          return message.reply('⏳ Thread approval request already pending.');
        } else if (reqSettings.status === 'approved') {
          return message.reply('✅ This thread already approved.');
        }
        //------------------------//
        const lastRequestTime = senderData.settings.request[event.senderID]?.time || 0;
        if (now < lastRequestTime) {
          return message.reply("⚠ You can only request approval once a week.");
        } else if (now > lastRequestTime) {
          delete senderData.settings.request[event.senderID];
          await usersData.set(event.senderID, senderData);
        }
        //-----------------------/?

        const request = {
          user: event.senderID,
          time: oneWeekLaterTimestamp
        };
        senderData.settings.request[event.senderID] = request;
        threadData.settings.current = { status: 'pending' };
        await usersData.set(event.senderID, senderData);
        await threadsData.set(targetThreadID, threadData);

        const adminMessage = `📝 Approval request for thread\n\n𝐆𝐫𝐨𝐮𝐩 𝐈𝐧𝐟𝐨𝐫𝐦𝐚𝐭𝐢𝐨𝐧\n━━━━━━━━━━━━━━━━━━━\n⇒ 𝐓𝐡𝐫𝐞𝐚𝐝𝐈𝐃: ${targetThreadID}\n⇒ 𝐓𝐡𝐫𝐞𝐚𝐝 𝐍𝐚𝐦𝐞: ${threadName}\n⇒ 𝐓𝐡𝐫𝐞𝐚𝐝 𝐀𝐝𝐦𝐢𝐧𝐬: ${threadAdmins}\n⇒ 𝐓𝐡𝐫𝐞𝐚𝐝 𝐌𝐞𝐦𝐛𝐞𝐫𝐬: ${valuesMember.length}: (🙋 ${totalBoy} / 🙋‍♀ ${totalGirl})\n⇒ 𝐓𝐨𝐭𝐚𝐥 𝐌𝐞𝐬𝐬𝐚𝐠𝐞: ${totalMessage}\n\nChecking Request Sender Information...\n\n𝐑𝐞𝐪𝐮𝐞𝐬𝐭 𝐒𝐞𝐧𝐝𝐞𝐫 𝐈𝐧𝐟𝐨𝐫𝐦𝐚𝐭𝐢𝐨𝐧\n━━━━━━━━━━━━━━━━━━━\n⇒ 𝐒𝐞𝐧𝐝𝐞𝐫 𝐍𝐚𝐦𝐞: ${userName}\n⇒ 𝐢𝐬𝐒𝐮𝐩𝐩𝐨𝐫𝐭𝐠𝐜𝐌𝐞𝐦𝐛𝐞𝐫: ${isSupportMember}\n⇒ 𝐑𝐚𝐧𝐤 𝐈𝐧 𝐒𝐮𝐩𝐩𝐨𝐫𝐭𝐠𝐜: Rank ${position}. with ${arraySort[findMemberIndex].count} Messages.`;
        const adSend = await api.sendMessage(adminMessage, 7460263894092397);
        const approvalMessage = await message.reply(`📝 𝐑𝐞𝐪𝐮𝐞𝐬𝐭 𝐑𝐞𝐜𝐞𝐢𝐯𝐞𝐝: Checking Group Information`);
        setTimeout(async () => {
          await api.editMessage(`📝 𝐑𝐞𝐪𝐮𝐞𝐬𝐭 𝐑𝐞𝐜𝐞𝐢𝐯𝐞𝐝: Checking Group Information.`, approvalMessage.messageID);
        }, 1000);
        setTimeout(async () => {
          await api.editMessage(`📝 𝐑𝐞𝐪𝐮𝐞𝐬𝐭 𝐑𝐞𝐜𝐞𝐢𝐯𝐞𝐝: Checking Group Information..`, approvalMessage.messageID);
        }, 2000);
        setTimeout(async () => {
          await api.editMessage(`📝 𝐑𝐞𝐪𝐮𝐞𝐬𝐭 𝐑𝐞𝐜𝐞𝐢𝐯𝐞𝐝: Checking Group Information...`, approvalMessage.messageID);
        }, 3000);
        setTimeout(async () => {
          const text = `📝 𝐑𝐞𝐪𝐮𝐞𝐬𝐭 𝐑𝐞𝐜𝐞𝐢𝐯𝐞𝐝: Checking Group Information...\n\n𝐆𝐫𝐨𝐮𝐩 𝐈𝐧𝐟𝐨𝐫𝐦𝐚𝐭𝐢𝐨𝐧\n━━━━━━━━━━━━━━━━━━━\n⇒ 𝐓𝐡𝐫𝐞𝐚𝐝𝐈𝐃: ${targetThreadID}\n⇒ 𝐓𝐡𝐫𝐞𝐚𝐝 𝐍𝐚𝐦𝐞: ${threadName}\n⇒ 𝐓𝐡𝐫𝐞𝐚𝐝 𝐀𝐝𝐦𝐢𝐧𝐬: ${threadAdmins}\n⇒ 𝐓𝐡𝐫𝐞𝐚𝐝 𝐌𝐞𝐦𝐛𝐞𝐫𝐬: ${valuesMember.length}: (🙋 ${totalBoy} / 🙋‍♀ ${totalGirl})\n⇒ 𝐓𝐨𝐭𝐚𝐥 𝐌𝐞𝐬𝐬𝐚𝐠𝐞: ${totalMessage}\n\nChecking Request Sender Information...\n\n𝐑𝐞𝐪𝐮𝐞𝐬𝐭 𝐒𝐞𝐧𝐝𝐞𝐫 𝐈𝐧𝐟𝐨𝐫𝐦𝐚𝐭𝐢𝐨𝐧\n━━━━━━━━━━━━━━━━━━━\n⇒ 𝐒𝐞𝐧𝐝𝐞𝐫 𝐍𝐚𝐦𝐞: ${userName}\n⇒ 𝐢𝐬𝐒𝐮𝐩𝐩𝐨𝐫𝐭𝐠𝐜𝐌𝐞𝐦𝐛𝐞𝐫: ${isSupportMember}\n⇒ 𝐑𝐚𝐧𝐤 𝐈𝐧 𝐒𝐮𝐩𝐩𝐨𝐫𝐭𝐠𝐜: Rank ${position}. with ${arraySort[findMemberIndex].count} Messages.`;
          await api.editMessage(text, approvalMessage.messageID);
        }, 5000);

        global.GoatBot.onReply.set(adSend.messageID, {
          commandName: this.config.name,
          messageID: adSend.messageID,
          tid: targetThreadID
        });
      }
    }
  },

  onReply: async function ({ event, Reply, message, api, threadsData }) {
    const { tid } = Reply;
    const { senderID, body } = event;

    if (senderID !== '100082247235177') {
      return;
    }

    const now = new Date();
    const oneMonthLater = new Date(now);
    oneMonthLater.setMonth(oneMonthLater.getMonth() + 1);
    const expiryTimestamp = oneMonthLater.getTime();

    const threadData = await threadsData.get(tid);
      
    threadData.settings = { 
      approval: true,
      expiry: expiryTimestamp
    };
    
    const reqSettings = threadData.settings.current;
    threadData.settings.current = { status: 'approved' };
    await threadsData.set(tid, threadData);

    const options = { timeZone: "Asia/Dhaka", day: "2-digit", month: "2-digit", year: "numeric" };
    const BDTime = new Date().toLocaleDateString("en-US", options).replace(/(\d+)\/(\d+)\/(\d+)/, "$2-$1-$3");
    const expiryDate = new Date(expiryTimestamp).toLocaleDateString("en-US", options).replace(/(\d+)\/(\d+)\/(\d+)/, "$2-$1-$3");

    const approvalMessage = `🎉 This thread has been approved by Admin! \nValidity: 30 days\nCurrent Date: ${BDTime}\nExpiry Date: ${expiryDate}`;
    api.sendMessage(approvalMessage, tid);
  }
};
