import { CommandInteraction, SlashCommandBuilder } from 'discord.js';
import axios from 'axios';
import fs from 'fs';
import path from 'path';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('schedule')
    .setDescription('Get the current stage schedule for Splatoon 3.'),

  execute(interation: CommandInteraction) {
    getSchedule();
    interation.reply('Come back later, work in progress');
  }
};

function getSchedule() {
  const schedulePath = path.join(__dirname, '../../cache/schedules.json');
  let scheduleData = {};
  try {
    scheduleData = JSON.parse(fs.readFileSync(schedulePath, { encoding: 'utf-8' }));
    console.log(scheduleData);
  } catch (error) {
    axios.get('https://splatoon3.ink/data/schedules.json')
      .then(res => {
        fs.writeFileSync(schedulePath, JSON.stringify(res.data, null, 2));
        console.log(res.data);
      })
      .catch(err => {
        console.log(err);
      });
  }
}
