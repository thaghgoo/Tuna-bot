const { SlashCommandBuilder } = require("discord.js");
const packageJSON = require("../package.json");
const { EmbedBuilder } = require("discord.js");

const discordJSVersion = packageJSON.dependencies["discord.js"];
const statusembed = new EmbedBuilder()
  .setColor(255, 0, 255)
  .setTitle('Bot stats - ${client.user.tag}')
  .addFields({ name: "Discord.js version", value: discordJSVersion });

module.exports = {
  data: new SlashCommandBuilder()
    .setName("status")
    .setDescription("reply bot status"),
  async execute(interaction) {
    return interaction.reply({
      embeds: [statusembed],
    });
  },
};
