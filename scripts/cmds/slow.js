function delayResponse(min, max) {
    // Function to generate a random delay time between min and max seconds
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Modify your bot's message sending function
async function sendMessageWithDelay(api, threadID, message) {
    // Random delay between 2 to 10 seconds (2000 to 10000 milliseconds)
    let delayTime = delayResponse(2000, 5000);

    // Log the delay time (optional)
    console.log(`Delaying response by ${delayTime / 1000} seconds...`);

    // Wait for the random delay before sending the message
    await new Promise(resolve => setTimeout(resolve, delayTime));

    // Now send the actual message after the delay
    api.sendMessage(message, threadID);
}

// Example usage in a command
module.exports = {
    name: "yourCommand",
    description: "Command with delayed response to avoid detection",
    execute: async function ({ api, event }) {
        const message = "This is a delayed response.";
        sendMessageWithDelay(api, event.threadID, message);
    }
};
