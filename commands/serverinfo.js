const { SlashCommandBuilder } = require("@discordjs/builders");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("serverinfo")
    .setDescription("Displays information about the current server"),
  async execute(interaction) {
    const { guild } = interaction;

    const serverInfo = `
    	Server Name: ${guild.name}
    	Total Members: ${guild.memberCount}
    	Server Region: ${guild.region}
    	Server ID: ${guild.id}
    	Created At: ${guild.createdAt}
  	`;

    await interaction.reply(serverInfo);
  },
};
