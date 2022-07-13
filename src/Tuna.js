const { executionAsyncResource } = require("async_hooks");
const ytdl = require("ytdl-core");
const { YTSearcher } = require("ytsearcher");
const { Client, Intents } = require("discord.js"); //import discord.js
var fs = require("fs"); //import fs

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

client.on("message", async (message) => {
  if (message.author.bot) return;
  if (message.content.startsWith("!play")) {
    const voiceChannel = message.member.voice.channel;
    if (!voiceChannel)
      return message.channel.send(
        "You need to be in a voice channel to play music!"
      );
    const permissions = voiceChannel.permissionsFor(message.client.user);
    if (!permissions.has("CONNECT") || !permissions.has("SPEAK")) {
      return message.channel.send(
        "I need the permissions to join and speak in your voice channel!"
      );
    }
    const args = message.content.split(" ").slice(1);
    const searchString = args.join(" ");
    const url = args[0] ? args[0].replace(/<(.+)>/g, "$1") : "";
    const queue = message.client.queue;
    let songInfo = await searcher.search(searchString);
    let song = {
      id: songInfo.id,
      title: songInfo.title,
      url: songInfo.url,
      duration: songInfo.duration,
    };
    if (!queue.has(message.guild.id)) {
      queue.set(message.guild.id, {
        textChannel: message.channel,
        voiceChannel: voiceChannel,
        connection: null,
        songs: [],
        volume: 5,
      });
    }
    queue.get(message.guild.id).songs.push(song);
    if (!message.guild.voiceConnection) {
      message.member.voice.channel.join().then((connection) => {
        play(message.guild.id, message);
      });
    }
  } else if (message.content.startsWith("!stop")) {
    const queue = message.client.queue;
    if (queue.has(message.guild.id)) {
      queue.get(message.guild.id).songs = [];
      queue.get(message.guild.id).connection.disconnect();
      queue.delete(message.guild.id);
      message.channel.send("Queue stopped!");
    }
  } else if (message.content.startsWith("!leave")) {
    const queue = message.client.queue;
    if (queue.has(message.guild.id)) {
      queue.get(message.guild.id).songs = [];
      queue.get(message.guild.id).connection.disconnect();
      queue.delete(message.guild.id);
      message.channel.send("Queue stopped!");
    }
  }
});

function play(guildID, message) {
  const queue = message.client.queue;
  const song = queue.get(guildID).songs[0];
  const voiceChannel = queue.get(guildID).voiceChannel;
  const connection = queue.get(guildID).connection;
  const dispatcher = connection.play(ytdl(song.url));
  dispatcher
    .on("finish", () => {
      queue.get(guildID).songs.shift();
      play(guildID, message);
    })
    .on("error", (err) => {
      console.log(err);
    })
    .setVolumeLogarithmic(queue.get(guildID).volume / 5);
  message.channel.send(`Now playing: **${song.title}**`);
}