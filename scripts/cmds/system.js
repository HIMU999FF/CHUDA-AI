const os = require('os');
const { bold, thin } = require("fontstyles");

module.exports = {
  config: {
    name: 'stats',
    aliases: ['status', 'system'],
    version: '1.0',
    author: 'softrilez',
    countDown: 15,
    role: 0,
    shortDescription: 'Display bot system stats',
    longDescription: {
      id: 'Display bot system stats',
      en: 'Display bot system stats'
    },
    category: 'system',
    guide: {
      id: '{pn}: Display bot system stats',
      en: '{pn}: Display bot system stats'
    }
  },
  onStart: async function ({ message, event, usersData, threadsData, api }) {
    const startTime = Date.now();
    const users = await usersData.getAll();
    const groups = await threadsData.getAll();
    const uptime = process.uptime();
    const sentMessage = await message.reply(thin("🔄 loading…"));
    
    try {
      const days = Math.floor(uptime / (3600 * 24));
      const hours = Math.floor((uptime % (3600 * 24)) / 3600);
      const minutes = Math.floor((uptime % 3600) / 60);
      const seconds = Math.floor(uptime % 60);

      const memoryUsage = process.memoryUsage();
      const totalMemory = os.totalmem();
      const freeMemory = os.freemem();
      const usedMemory = totalMemory - freeMemory;
      const memoryUsagePercentage = (usedMemory / totalMemory * 100).toFixed(2);

      const cpuUsage = os.loadavg();
      const cpuCores = os.cpus().length;
      const cpuModel = os.cpus()[0].model;
      const nodeVersion = process.version;
      const platform = os.platform();
      const networkInterfaces = os.networkInterfaces();

      const networkInfo = Object.keys(networkInterfaces).map(interface => {
        return {
          interface,
          addresses: networkInterfaces[interface].map(info => `${info.family}: ${info.address}`)
        };
      });

      const endTime = Date.now();
      const botPing = endTime - startTime;
      const apiPing = sentMessage.timestamp - startTime;

      const messageContent = `🖥 ${bold("System Statistics")}:\n\n` +
        `• 𝙐𝙋𝙏𝙄𝙈𝙀: ${days}d ${hours}h ${minutes}m ${seconds}s\n` +
        `• 𝙈𝙀𝙈𝙊𝙍𝙔 𝙐𝙎𝘼𝙂𝙀: ${(memoryUsage.rss / 1024 / 1024).toFixed(2)} 𝙈𝘽\n` +
        `• 𝙏𝙊𝙏𝘼𝙇 𝙈𝙀𝙈𝙊𝙍𝙔: ${(totalMemory / 1024 / 1024 / 1024).toFixed(2)} 𝙂𝘽\n` +
        `• 𝙁𝙍𝙀𝙀 𝙈𝙀𝙈𝙊𝙍𝙔: ${(freeMemory / 1024 / 1024 / 1024).toFixed(2)} 𝙂𝘽\n` +
        `• 𝙈𝙀𝙈𝙊𝙍𝙔 𝙐𝙎𝘼𝙂𝙀 𝙋𝙀𝙍𝘾𝙀𝙉𝙏𝘼𝙂𝙀: ${memoryUsagePercentage}%\n` +
        `• 𝘾𝙋𝙐 𝙐𝙎𝘼𝙂𝙀 (1m): ${cpuUsage[0].toFixed(2)}%\n` +
        `• 𝘾𝙋𝙐 𝙐𝙎𝘼𝙂𝙀 (5m): ${cpuUsage[1].toFixed(2)}%\n` +
        `• 𝘾𝙋𝙐 𝙐𝙎𝘼𝙂𝙀 (15m): ${cpuUsage[2].toFixed(2)}%\n` +
        `• 𝘾𝙋𝙐 𝘾𝙊𝙍𝙀𝙎: ${cpuCores}\n` +
        `• 𝘾𝙋𝙐 𝙈𝙊𝘿𝙀𝙇: ${cpuModel}\n` +
        `• 𝙉𝙊𝘿𝙀.𝙅𝙎 𝙑𝙀𝙍𝙎𝙄𝙊𝙉: ${nodeVersion}\n` +
        `• 𝙋𝙇𝘼𝙏𝙁𝙍𝙊𝙈: ${platform}\n` +
        `• 𝙋𝙄𝙉𝙂: ${botPing}ms\n• 𝘼𝙋𝙄: ${apiPing}ms\n• 𝙏𝙊𝙏𝘼𝙇 𝙐𝙎𝙀𝙍𝙎: ${users.length}\n• 𝙏𝙊𝙏𝘼𝙇 𝙂𝙍𝙊𝙐𝙋𝙎: ${groups.length}\n\n` +
        `🌐 ${bold("Network Interfaces")}:\n\n` +
        `${networkInfo.map(info => `• ${info.interface}: ${info.addresses.join(', ')}`).join('\n')}`;

      return api.editMessage(thin(messageContent), sentMessage.messageID);
    } catch (err) {
      console.error(err);
      return api.editMessage("❌ An error occurred while fetching system statistics.", sentMessage.messageID);
    }
  }
};
