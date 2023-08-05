import { CommandInteraction, SlashCommandBuilder } from 'discord.js';

// module.exports = {
//   data: new SlashCommandBuilder()
//     .setName('ping')
//     .setDescription('Replies with Pong!'),

//   async execute(interaction: CommandInteraction) {
//     await interaction.reply('Pong!');
//   }
// };

export const data = new SlashCommandBuilder()
  .setName('ping')
  .setDescription('Replies with Pong!');

export const execute = async (interaction: CommandInteraction) => {
  await interaction.reply('Pong!');
};
