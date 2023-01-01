const { executionAsyncResource } = require("async_hooks");
const ytdl = require("ytdl-core"); //import ytdl-core
const { YTSearcher } = require("ytsearcher");
const { Client, Intents } = require("discord.js"); //import discord.js
const fs = require("fs"); //import fs
const { EmbedBuilder } = require('discord.js');

const searcher = new YTSearcher({
  //use ytsearcher and google api key for search on youtube
  key: "AIzaSyDe1RX3kxAheSg2AoP2IvmQHOTXHQKkOU8",
  revealed: true,
});

require("dotenv").config(); //initialize dotenv

const client = new Client({
  intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES], //initialize discord.js
}); //create new client

const queue = new Map(); //create new map for queues

client.on("ready", () => {
  console.log(`Tuna: im online!`);
});

client.login(process.env.CLIENT_TOKEN); //login bot using token
//time
const currenttime = Date(); //get current time

const time = new Date(currenttime).toLocaleTimeString("en", {
  timeStyle: "short",
  hour12: true,
});

//date
const currentdate = new Date();
const date =
  currentdate.getFullYear() +
  "-" +
  (currentdate.getMonth() + 1) +
  "-" +
  currentdate.getDate();

client.on("message", (msg) => {
  //when message is received

  switch (msg.content) {
    case "!date":
      msg.reply(date);
      break;
    case "!time":
      msg.reply(time);
      break;
    case "play":
      msg.reply("You mean !Play ?");
      break;
    case "stop":
      msg.reply("you mean !stop ?");
      break;
    case "leave":
      msg.reply("you mean !leave ?");
      break;
  }
});

client.on("message", (msg) => {
//   if (msg.content.startsWith("!avatar")) {
//     var avuser = msg.mentions.members.first() || msg.member;
//     const avatar = msg.author.avatarURL() 
//     msg.channel.send(`Here is ${avuser}'s avatar :`);
// }
  if (msg.content === "!avatar") {
    const exampleEmbed = new EmbedBuilder()
	  .setColor(0x0099FF)
	  .setTitle('here is your avatar')
	  .setAuthor({ name: msg.author.username, iconURL: msg.author.avatarURL, url: '#' })
	  // .setDescription('')
	  .setImage(msg.author.avatarURL())
	  .setTimestamp()
	  // .setFooter({ text: ''});
    
    msg.reply({ embeds: [exampleEmbed] });
  }
  if (msg.content.startsWith("!play")) {
    const voiceChannel = msg.member.voiceChannel; //get voice channel
    console.log(msg.member)
    if (!voiceChannel) {
      //if no voice channel
      msg.channel.send("You need to be in a voice channel to play music!");
      return;
    }
    const permissions = voiceChannel.permissionsFor(msg.client.user); //get permissions for bot
    if (!permissions.has("CONNECT") || !permissions.has("SPEAK")) {
      //if no permissions
      msg.channel.send(
        "I need the permissions to join and speak in your voice channel!"
      );
      return;
    }
    if (queue.has(msg.guild.id)) {
      //if queue has guild id
      queue.get(msg.guild.id).push(msg.content.substring(6)); //add song to queue
      msg.channel.send(`Added to queue: ${msg.content.substring(6)}`);
    } else {
      //if no queue
      queue.set(msg.guild.id, [msg.content.substring(6)]); //create queue
      msg.channel.send(`Added to queue: ${msg.content.substring(6)}`);
    }
    if (!client.voice.connections.has(msg.guild.id)) {
      //if no connection
      voiceChannel.join().then((connection) => {
        //join voice channel
        play(connection, msg); //play song
      });
    }
  } else if (msg.content.startsWith("!skip")) {
    //if message starts with !skip
    if (!queue.has(msg.guild.id)) {
      //if no queue
      msg.channel.send("There is nothing playing.");
      return;
    }
    queue.get(msg.guild.id).shift(); //skip song
    msg.channel.send("Skipped song.");
    if (queue.get(msg.guild.id).length === 0) {
      //if no songs in queue
      queue.delete(msg.guild.id); //delete queue
      msg.channel.send("Queue is empty.");
    }
  } else if (msg.content.startsWith("!queue")) {
    //if message starts with !queue
    if (!queue.has(msg.guild.id)) {
      //if no queue
      msg.channel.send("There is nothing playing.");
      return;
    }
    msg.channel.send(
      `Queue: ${queue
        .get(msg.guild.id)
        .map((song) => `**${song}**`)
        .join("\n")}`
    );
  } else if (msg.content.startsWith("!pause")) {
    //if message starts with !pause
    if (!queue.has(msg.guild.id)) {
      //if no queue
      msg.channel.send("There is nothing playing.");
      return;
    }
    queue.get(msg.guild.id).pause(); //pause song
    msg.channel.send("Paused song.");
  } else if (msg.content.startsWith("!resume")) {
    //if message starts with !resume
    if (!queue.has(msg.guild.id)) {
      //if no queue
      msg.channel.send("There is nothing playing.");
      return;
    }
    queue.get(msg.guild.id).resume(); //resume song
    msg.channel.send("Resumed song.");
  } else if (msg.content.startsWith("!stop")) {
    //if message starts with !stop
    if (!queue.has(msg.guild.id)) {
      //if no queue
      msg.channel.send("There is nothing playing.");
      return;
    }
    queue.get(msg.guild.id).stop(); //stop song
    msg.channel.send("Stopped song.");
  } else if (msg.content.startsWith("!volume")) {
    //if message starts with !volume
    if (!queue.has(msg.guild.id)) {
      //if no queue
      msg.channel.send("There is nothing playing.");
      return;
    }
    queue.get(msg.guild.id).volume = msg.content.substring(8); //set volume
    msg.channel.send(`Volume set to ${msg.content.substring(8)}`);
  } else if (msg.content.startsWith("!search")) {
    //if message starts with !search
    searcher.search(msg.content.substring(8)).then((results) => {
      //search youtube
      msg.channel.send(results[0].url); //send url
    });
  } else if (msg.content.startsWith("!help")) {
    //if message starts with !help
    msg.channel.send(`
    !play <song name> - play song
    !skip - skip song
    !queue - show queue
    !pause - pause song
    !resume - resume song
    !stop - stop song
    !volume <volume> - set volume
    !search <song name> - search song
    !help - show help
    `);
  }
  var data = {};
  data.content = [];

  /*  client.on("message", async (message) => {
      data.content.push(msg.author.username, msg.author.id, message.content);

    fs.writeFile("result.json", JSON.stringify(data), function (err) {
      if (err) throw err;
      console.log("complete");

    });
  });
  */
});