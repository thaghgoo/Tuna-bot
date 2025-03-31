const ytdl = require("ytdl-core");
const { YTSearcher } = require("ytsearcher");
const {
  Client,
  Events,
  Collection,
  GatewayIntentBits,
  Partials,
} = require("discord.js");
const fs = require("node:fs");
const { EmbedBuilder } = require("discord.js");
const packageJSON = require("./package.json");
const {
  ApplicationCommandType,
  ApplicationCommandOptionType,
} = require("discord.js");
const path = require("node:path");

const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v9");
const { joinVoiceChannel, getVoiceConnection } = require("@discordjs/voice");

require("dotenv").config(); //initialize dotenv
const searcher = new YTSearcher({
  //use ytsearcher and google api key for search on youtube
  key: process.env.GOOGLE_API_KEY,
  revealed: true,
});

const client = new Client({
  intents: [
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildBans,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
  partials: [Partials.Channel],
}); //create new client

const queue = new Map(); //create new map for queues

client.login(process.env.CLIENT_TOKEN); //login bot using token

client.commands = new Collection();

const commandFiles = fs
  .readdirSync("./commands")
  .filter((file) => file.endsWith(".js"));

for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  client.commands.set(command.data.name, command);
}
//this section is for updating slashcommands on every start

client.on("ready", async () => {
  console.log(`${client.user.tag} is online!`);
  const rest = new REST({ version: "9" }).setToken(process.env.CLIENT_TOKEN);

  try {
    const commands = await client.application.commands.fetch();
    console.log(
      "Registered commands:",
      commands.map((cmd) => cmd.name)
    );
  } catch (err) {
    console.error("Failed to fetch commands:", err);
  }
  try {
    await rest.put(
      Routes.applicationCommands(client.user.id, process.env.SERVER_ID),
      {
        body: [...client.commands.values()].map((cmd) => cmd.data.toJSON()),
      }
    );
    console.log("Commands registered successfully");
  } catch (error) {
    console.error("Command registration failed:", error);
  }
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const command = client.commands.get(interaction.commandName);

  if (!command) return;

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);
    await interaction.reply({
      content: "There was an error while executing this command!",
      ephemeral: true,
    });
  }
});

client.on("messageCreate", async (msg) => {
  if (msg.author.bot) {
    return;
  }
  if (msg.content == "!ping") {
    msg.reply("pong");
  }
  if (msg.content == "!serverid") {
    msg.reply(msg.guild.id);
  }
  if (msg.content == "!userinfo") {
    if (msg.author.bot == true) {
      msg.author.bot = "true";
    } else msg.author.bot == false;
    {
      msg.author.bot = "false";
    }
    if (msg.member.nickname == null) {
      msg.member.nickname = "null";
    }
    const userinfoEmbed = new EmbedBuilder()
      .setColor(255, 0, 255)
      .setTitle("user info report")
      .setAuthor({ name: "Tuna", url: "https://discord.gg/zhPfWXvb" })
      .addFields(
        { name: "user-name", value: msg.author.tag, inline: true },
        { name: "nick-name", value: msg.member.nickname, inline: true },
        { name: "\u200B", value: "\u200B" },
        { name: "user-id", value: msg.author.id, inline: true },
        { name: "is-bot", value: msg.author.bot, inline: true }
      )
      .setImage(msg.author.avatarURL())
      .setTimestamp()
      .setFooter({ text: "by Tuna <3" });

    msg.channel.send({ embeds: [userinfoEmbed] });
  }
  if (msg.content == "!serverinfo") {
    const serverinfoEmbed = new EmbedBuilder()
      .setColor(255, 0, 255)
      .setTitle(`${msg.guild.name} information`)
      .setAuthor({ name: "Tuna" })
      .setThumbnail(msg.guild.iconURL())
      .addFields(
        { name: "server-id", value: msg.guild.id, inline: true },
        {
          name: "verification-Level",
          value: msg.guild.verificationLevel,
          inline: true,
        },
        { name: "\u200B", value: "\u200B" },
        { name: "nsfw-level", value: msg.guild.nsfwLevel, inline: true },
        {
          name: "total-member",
          value: msg.guild.memberCount.toString(),
          inline: true,
        },
        { name: "\u200B", value: "\u200B" },
        {
          name: "max-member",
          value: msg.guild.maximumMembers.toString(),
          inline: true,
        },
        {
          name: "ownerID",
          value: msg.guild.ownerId,
          inline: true,
        }
      )
      .setTimestamp()
      .setFooter({ text: "by Tuna <3" });

    msg.channel.send({ embeds: [serverinfoEmbed] });
  }
  if (msg.content.startsWith("!play")) {
    const voiceChannel = msg.member.voice.channel;
    console.log(voiceChannel);
    if (!voiceChannel) {
      msg.channel.send("You need to be in a voice channel to play music!");
      return;
    }
    const permissions = voiceChannel.permissionsFor(msg.client.user);
    if (!permissions.has("CONNECT") || !permissions.has("SPEAK")) {
      msg.channel.send(
        "I need the permissions to join and speak in your voice channel!"
      );
      return;
    }

    const connection = getVoiceConnection(msg.guild.id);
    if (connection) {
      queue.get(msg.guild.id).push(msg.content.substring(6));
      msg.channel.send(`Added to queue: ${msg.content.substring(6)}`);
    } else {
      queue.set(msg.guild.id, [msg.content.substring(6)]);
      msg.channel.send(`Added to queue: ${msg.content.substring(6)}`);

      // Join the voice channel using joinVoiceChannel
      const connection = joinVoiceChannel({
        channelId: voiceChannel.id,
        guildId: msg.guild.id,
        adapterCreator: msg.guild.voiceAdapterCreator,
      });
      play(connection, msg);
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
  // var data = {};
  // data.content = [];

  /*  client.on("message", async (message) => {
      data.content.push(msg.author.username, msg.author.id, message.content);

    fs.writeFile("result.json", JSON.stringify(data), function (err) {
      if (err) throw err;
      console.log("complete");

    });
  });
  */
});
