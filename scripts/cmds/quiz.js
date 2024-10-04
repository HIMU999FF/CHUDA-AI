const axios = require("axios");

module.exports = {
  config: {
    name: "quiz",
    aliases: ["qz"],
    version: "1.0",
    author: "asif",
    countDown: 0,
    role: 0,
    category: "game",
    guide: "{p}quiz2 \n{pn}quiz2 bn \n{p}quiz2 en",
  },

  onStart: async function ({ api, event, usersData, args }) {
    const input = args.join('').toLowerCase() || "bn";
    let timeout = 300;
    let category = "bangla";
    if (input === "bn" || input === "bangla") {
      category = "bangla";
    } else if (input === "en" || input === "english") {
      category = "english";
    }

    try {
      const response = await axios.get(
        `https://www.noobs-api.000.pe/dipto/quiz2?category=${category}&q=random`
      );

      const quizData = response.data.question;
      const { question, correctAnswer, options } = quizData;
      const { a, b, c, d } = options;
      const namePlayerReact = await usersData.getName(event.senderID);
      const quizMsg = {
        body: `\n╭──✦ ${question}\n├‣ 𝗔) ${a}\n├‣ 𝗕) ${b}\n├‣ 𝗖) ${c}\n├‣ 𝗗) ${d}\n╰──────────────────‣\n𝚁𝚎𝚙𝚕𝚢 𝚝𝚘 𝚝𝚑𝚒𝚜 𝚖𝚎𝚜𝚜𝚊𝚐𝚎 𝚠𝚒𝚝𝚑 𝚢𝚘𝚞𝚛 𝚊𝚗𝚜𝚠𝚎𝚛.`,
      };

      api.sendMessage(
        quizMsg,
        event.threadID,
        (error, info) => {
          global.GoatBot.onReply.set(info.messageID, {
            type: "reply",
            commandName: this.config.name,
            author: event.senderID,
            messageID: info.messageID,
            dataGame: quizData,
            correctAnswer,
            nameUser: namePlayerReact,
            attempts: 0
          });
          setTimeout(() => {
            api.unsendMessage(info.messageID);
          }, timeout * 1000);
        },
        event.messageID,
      );
    } catch (error) {
      console.error("❌ | Error occurred:", error);
      api.sendMessage(error.message, event.threadID, event.messageID);
    }
  },

  onReply: async ({ event, api, Reply, usersData }) => {
    const { correctAnswer, nameUser } = Reply;
    const maxAttempts = 2;

    // Allow any user to answer the quiz
    const answeringUser = event.senderID;
    const answeringUserName = await usersData.getName(answeringUser);

    if (Reply.attempts >= maxAttempts) {
      await api.unsendMessage(Reply.messageID);
      const incorrectMsg = `🚫 | ${answeringUserName}, you have reached the maximum number of attempts (2).\nThe correct answer is: ${correctAnswer}`;
      return api.sendMessage(incorrectMsg, event.threadID, event.messageID);
    }

    let userReply = event.body.toLowerCase();
    if (userReply === correctAnswer.toLowerCase()) {
      api.unsendMessage(Reply.messageID).catch(console.error);
      let rewardCoins = 10000000000;
      let rewardExp = 100;
      let userData = await usersData.get(answeringUser);
      await usersData.set(answeringUser, {
        money: userData.money + rewardCoins,
        exp: userData.exp + rewardExp,
        data: userData.data,
      });
      let correctMsg = `Congratulations, ${answeringUserName}! 🌟🎉\n\nYou're a Quiz Champion! 🏆\n\nYou've earned ${rewardCoins} Coins 💰 and ${rewardExp} EXP 🌟\n\nKeep up the great work! 🚀`;
      api.sendMessage(correctMsg, event.threadID, event.messageID);
    } else {
      Reply.attempts += 1;
      global.GoatBot.onReply.set(Reply.messageID, Reply);
      api.sendMessage(
        `❌ | Wrong Answer. You have ${maxAttempts - Reply.attempts} attempts left.\n✅ | Try Again!`,
        event.threadID,
        event.messageID,
      );
    }
  },
};
