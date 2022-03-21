const { Client, Intents } = require("discord.js");
require("dotenv").config();

const client = new Client({
  intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES],
});

client.login(process.env.CLIENT_TOKEN);

client.on("ready", () => {
  console.log("Bot is now ready to communicate with discord server");
});

client.on("message", (receivedMessage) => {
  if (receivedMessage.author == client.user) {
    return;
  }

  if (receivedMessage.content.includes(client.user.toString())) {
    if (receivedMessage.content == "!date") {
      let date = new Date();

      let content =
        date.getDate() + "/" + date.getMonth() + "/" + date.getFullYear();
      receivedMessage.channel.send(content);
    }
    if (receivedMessage.content == "!time") {
      let date = new Date();
      let content =
        date.getHours() + ":" + date.getMinutes() + ";" + date.getSeconds();
      receivedMessage.channel.send(content);
    }
  }
});
