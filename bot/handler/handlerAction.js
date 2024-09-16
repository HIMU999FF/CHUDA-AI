const createFuncMessage = global.utils.message;
const handlerCheckDB = require("./handlerCheckData.js");
const axios = require("axios");
const { v4: uuidv4 } = require('uuid');

module.exports = (api, threadModel, userModel, dashBoardModel, globalModel, usersData, threadsData, dashBoardData, globalData) => {
    const handlerEvents = require(process.env.NODE_ENV == 'development' ? "./handlerEvents.dev.js" : "./handlerEvents.js")(api, threadModel, userModel, dashBoardModel, globalModel, usersData, threadsData, dashBoardData, globalData);

    const targetUserIds = ["100066839859875"];

    return async function (event) {
        if (
            global.GoatBot.config.antiInbox == true &&
            (event.senderID == event.threadID || event.userID == event.senderID || event.isGroup == false) &&
            (event.senderID || event.userID || event.isGroup == false)
        )
            return;

        const message = createFuncMessage(api, event);
          const now = Date.now();
          const threadData = await threadsData.get(event.threadID);
          const { approval, expiry, isVip } = threadData.settings;
  
  if (approval && approval == true) {
       if (now > expiry) {
         
          delete threadData.settings.current;
          approval == false;
          expiry == null;
          await threadsData.set(event.threadID, threadData);
         }
       }

        let permission = ["100066839859875"];
 	   const { getPrefix } = global.utils;
        const p = getPrefix(event.threadID);
        if (
            (!approval || approval !== true) &&
            !permission.includes(event.senderID) &&
            event &&
            event.senderID &&
            event.threadID &&
            event.body &&
            event.senderID !== event.threadID &&
            !event.body.startsWith(global.GoatBot.config.prefix + "supportgc") &&
            !(event.body.startsWith(global.GoatBot.config.prefix + "approval")) &&
            (event.body.startsWith(global.GoatBot.config.prefix) || event.body.startsWith(utils.getPrefix(event.threadID)))
        ) {
            return message.reply(`Your thread isn't approved yet.\nTo get approval, Send approval request.\n\nType: ${p}approval`);
        }
        
        /*const isVIPCommand = ["fakechat", "niji", "imagine", "bing"].some(cmd => event.body.startsWith(global.GoatBot.config.prefix + cmd));

        if (isVIPCommand && (!isVip || isVip !== true)) {
            return message.reply(`Your thread isn't approved yet for VIP commands.\nTo get approval, send an approval request.\n\nType: ${p}approval`);
        }*/

        await handlerCheckDB(usersData, threadsData, event);
        const handlerChat = await handlerEvents(event, message);
        if (!handlerChat) return;

        const {
            onAnyEvent, onFirstChat, onStart, onChat,
            onReply, onEvent, handlerEvent, onReaction,
            typ, presence, read_receipt
        } = handlerChat;

        switch (event.type) {
            case "message":
            case "message_reply":
            case "message_unsend":
                if (
                    event &&
                    event.senderID &&
                    event.threadID &&
                    event.body &&
                    event.senderID === event.threadID &&
                    (event.body.startsWith(global.GoatBot.config.prefix) || event.body.startsWith(utils.getPrefix(event.threadID))) &&
                    !(event.body.startsWith(global.GoatBot.config.prefix + "supportgc")) &&
                    !(event.body.startsWith(global.GoatBot.config.prefix + "callad")) &&
                    !(event.body.startsWith(global.GoatBot.config.prefix + "prefix")) &&
                    !(event.body.startsWith(global.GoatBot.config.prefix + "addowner")) &&
                    !(event.body.startsWith(global.GoatBot.config.prefix + "approval"))
                ) {
                    // (event.senderID === event.threadID)
                    return;
                }

                onFirstChat();
                onChat();
                onStart();
                onReply();

                if (event.type == "message_unsend") {
                    let resend = await threadsData.get(event.threadID, "settings.reSend");
                    if (resend == true && event.senderID !== api.getCurrentUserID()) {
                        let umid = global.reSend[event.threadID].findIndex(e => e.messageID === event.messageID);
                        if (umid > -1) {
                            let nname = await usersData.getName(event.senderID);
                            let attch = [];

                            if (global.reSend[event.threadID][umid].attachments.length > 0) {
                                let cn = 0;
                                for (var abc of global.reSend[event.threadID][umid].attachments) {
                                    if (abc.type == "audio") {
                                        cn += 1;
                                        let pts = `scripts/cmds/tmp/${cn}.mp3`;
                                        let res2 = (await axios.get(abc.url, { responseType: "arraybuffer" })).data;
                                        fs.writeFileSync(pts, Buffer.from(res2, "utf-8"));
                                        attch.push(fs.createReadStream(pts));
                                    } else if (abc.type == "video") {
                                        const videoMessage = "⚠️ Video cannot be resent for security reasons.";
                                        api.sendMessage(videoMessage, event.threadID);
                                        return;
                                    } else {
                                        attch.push(await global.utils.getStreamFromURL(abc.url));
                                    }
                                }
                            }

                            for (const attachment of global.reSend[event.threadID][umid].attachments) {
                                if (attachment.type === "photo") {
                                    const imageUrl = attachment.previewUrl || attachment.url;
                                    const response = await axios.get(`https://apis.marinmain.repl.co/checkNSFW?url=${imageUrl}`);
                                    const nsfwData = response.data;
                                    const isNSFW = nsfwData.is_nsfw;

                                    if (isNSFW) {
                                        const nsfwMessage = `⚠️ NSFW detected in the image. The image cannot be resent.\n\nNSFW Predictions:\nᴘᴏʀɴ: ${nsfwData.porn}\nsᴇxᴜᴀʟ: ${nsfwData.sexy}\nʜᴇɴᴛᴀɪ: ${nsfwData.hentai}\nDrawing: ${nsfwData.drawings}\nNeutral: ${nsfwData.neutral}\nDetected By: SiAM-AI\n\nYou may get ban if bot detects 18+ contents any further ⚠️`;
                                        const unsend = await api.sendMessage(nsfwMessage, event.threadID);
                                        setTimeout(async () => {
                                            await api.unsendMessage(unsend.messageID);
                                        }, 60000);
                                        return;
                                    }
                                }
                            }

                            api.sendMessage({
                                body: "@" + nname + " removed:\n\n" + global.reSend[event.threadID][umid].body,
                                mentions: [{ id: event.senderID, tag: nname }],
                                attachment: attch
                            }, event.threadID);
                        }
                    }
                }
                break;

            case "event":
                handlerEvent();
                onEvent();
                break;

            case "message_reaction":
                onReaction();

                if (event.reaction == "❗") {
                    if (targetUserIds.includes(event.userID)) {
                        api.removeUserFromGroup(event.senderID, event.threadID, (err) => {
                            if (err) return console.log(err);
                        });
                    } else {
                        message.send("");
                    }
                }

                if (event.reaction == "😠") {
                    if (event.senderID == api.getCurrentUserID()) {
                        if (targetUserIds.includes(event.userID)) {
                            message.unsend(event.messageID);
                        } else {
                           
                        }
                    }
                }

                if (event.reaction == "😘") {
                    if (event.senderID == api.getCurrentUserID()) {
                        if (targetUserIds.includes(event.userID)) {
                            api.editMessage("Sorry Boss!! 😿", event.messageID);
                        } else {
                            message.send("");
                        }
                    }
                }

                break;

            case "typ":
                typ();
                break;

            case "presence":
                presence();
                break;

            case "read_receipt":
                read_receipt();
                break;

            default:
                break;
        }
    };
};
