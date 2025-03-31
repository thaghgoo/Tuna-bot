const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ding")
    .setDescription("Check if bot response"),
  async execute(interaction) {
    // const sent = await interaction.reply({
    //   content: "Pinging...",
    //   fetchReply: true,
    // });
    // const latency = sent.createdTimestamp - interaction.createdTimestamp;
    await interaction.editReply("dong");
  },
};
