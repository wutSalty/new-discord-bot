// USE THIS SPARINGLY SO I DON'T GET BANNED
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { REST, Routes } from 'discord.js';

dotenv.config();

const commands: string[] = [];

const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

commandFolders.forEach(folder => {
  const commandsPath = path.join(foldersPath, folder);
  const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.ts'));
  commandFiles.forEach(file => {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    if ('data' in command && 'execute' in command) {
      commands.push(command.data.toJSON());
    } else {
      console.log(`[WARNING] The command at ${filePath} is missing "data" or "execute".`);
    }
  });
});

const rest = new REST().setToken(process.env.TOKEN);

const refresh = async () => {
  try {
    console.log(`Started refreshing ${commands.length} application (/) commands.`);

    await rest.put(
      Routes.applicationGuildCommands(process.env.CLIENTID, process.env.GUILDID),
      // Routes.applicationCommands(process.env.CLIENTID),
      { body: commands }
    );

    console.log(`Successfully reloaded ${commands.length} application (/) commands.`);
  } catch (error) {
    console.error(error);
  }
};
refresh();
