import { CommandInteraction, GuildMember, SlashCommandBuilder } from 'discord.js';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('user')
    .setDescription('Provides information about the user.'),

  async execute(interaction: CommandInteraction) {
    await interaction.reply(`This command was run by ${interaction.user.username}, who joined on ${(<GuildMember>interaction.member).joinedAt}`);
  },
};
