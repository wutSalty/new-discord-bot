import { CommandInteraction, CommandInteractionOptionResolver, SlashCommandBuilder } from 'discord.js';

module.exports = {
  cooldown: 5,
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Replies with Pong!')
    .addStringOption(option =>
      option.setName('input')
        .setDescription('The input to echo back')
        .setMaxLength(2000))
    .addBooleanOption(option =>
      option.setName('ephemeral')
        .setDescription('Whether or not the echo should be ephemeral')),

  async execute(interaction: CommandInteraction) {
    const input = (<CommandInteractionOptionResolver>interaction.options).getString('input') ?? 'Pong!';
    const ephemeral = (<CommandInteractionOptionResolver>interaction.options).getBoolean('ephemeral') ?? false;
    await interaction.reply({ content: input, ephemeral: ephemeral });
  },
};
