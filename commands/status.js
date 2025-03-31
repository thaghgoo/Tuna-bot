const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const packageJSON = require("../package.json");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("status")
    .setDescription("Shows bot status information"),
  async execute(interaction) {
    try {
      //version
      const discordJSVersion =
        packageJSON.dependencies["discord.js"]?.replace(/^[\^~]/, "") ||
        "Unknown";
      const nodeVersion = process.version;

      await interaction.editReply({
        content: "Fetching status information...",
        embeds: [],
      });

      const embed = new EmbedBuilder()
        .setColor(0x7289da)
        .setTitle(`${interaction.client.user.username} Status`)
        .addFields(
          { name: "Discord.js", value: discordJSVersion, inline: true },
          { name: "Node.js", value: nodeVersion, inline: true },
          {
            name: "Uptime",
            value: formatUptime(process.uptime()),
            inline: true,
          }
        )
        .setTimestamp();

      await interaction.editReply({
        content: "",
        embeds: [embed],
      });
    } catch (error) {
      console.error("Status command error:", error);
      await interaction.editReply({
        content: "Failed to gather status information!",
        ephemeral: true,
      });
    }
  },
};

function formatUptime(seconds) {
  const days = Math.floor(seconds / 86400);
  seconds %= 86400;
  const hours = Math.floor(seconds / 3600);
  seconds %= 3600;
  const minutes = Math.floor(seconds / 60);
  seconds = Math.floor(seconds % 60);
  return `${days}d ${hours}h ${minutes}m ${seconds}s`;
}
