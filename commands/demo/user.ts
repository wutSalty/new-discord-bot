import { CommandInteraction, GuildMember, SlashCommandBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('user')
  .setDescription('Provides information about the user.');

export const execute = async (interaction: CommandInteraction) => {
  await interaction.reply(`This command was run by ${interaction.user.username}, who joined on ${(<GuildMember>interaction.member).joinedAt}`);
};
