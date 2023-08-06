import { CommandInteraction, CommandInteractionOptionResolver, SlashCommandBuilder } from 'discord.js';
import axios from 'axios';
import fs from 'fs';
import path from 'path';

interface image {
  url: string;
}

interface VsStages {
  vsStageId: number;
  name: string;
  image: image;
  id: string;
}

interface VsRule {
  name: string;
  rule: string;
  id: string;
}

interface MatchSetting {
  __isVsSetting: string;
  __typename: string;
  vsStages: VsStages[];
  vsRule: VsRule;
  festMatchSetting?: any;
  mode?: string;
}

interface EventMatchSetting extends MatchSetting {
  leagueMatchEvent: {
    leagueMatchEventId: string;
    name: string;
    desc: string;
    regulationUrl: string;
    regulation: string;
    id: string;
  };
}

interface CoopSetting {
  __typename: string;
  coopStage: {
    name: string;
    thumbnailImage: image;
    image: image;
    id: string;
  };
  __isCoopSetting: string;
  weapons: {
    __splatoon3ink_id: string;
    name: string;
    image: image;
  }[];
}

interface Node {
  startTime: string;
  endTime: string;
  regularMatchSetting?: MatchSetting;
  bankaraMatchSettings?: MatchSetting[];
  xMatchSetting?: MatchSetting;
  setting?: CoopSetting;
  __splatoon3ink_king_salmonid_guess?: string;
  leagueMatchSetting?: EventMatchSetting;
  timePeriods?: {
    startTime: string;
    endTime: string;
  }[];
}

interface Nodes {
  nodes: Node[];
}

interface Data {
  data: {
    regularSchedules: Nodes;
    bankaraSchedules: Nodes;
    xSchedules: Nodes;
    eventSchedules: Nodes;
    coopGroupingSchedule: {
      regularSchedules: Nodes;
    };
  }
}

enum Modes {
  REGULAR = 'REGULAR',
  CHALLENGE = 'CHALLENGE',
  OPENS = 'OPENS',
  X = 'X',
  EVENT = 'EVENT',
  COOP = 'COOP',
  ALL = 'ALL'
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('schedule')
    .setDescription('Get the current stage schedule for Splatoon 3.')
    .addStringOption(option =>
      option.setName('mode')
        .setDescription('Select a mode to get the rotation for.')
        .addChoices(
          { name: 'Turf', value: Modes.REGULAR },
          { name: 'Series', value: Modes.CHALLENGE },
          { name: 'Opens', value: Modes.OPENS },
          { name: 'X Battle', value: Modes.X },
          { name: 'Challenge', value: Modes.EVENT },
          { name: 'Salmon', value: Modes.COOP }
        )),

  async execute(interaction: CommandInteraction) {
    const schedule: Data = await getSchedule();
    const choice = (<CommandInteractionOptionResolver>interaction.options).getString('mode') ?? Modes.ALL;
    await interaction.reply(generateRotation(schedule, choice));
  }
};

async function getSchedule() {
  const schedulePath = path.join(__dirname, '../../cache/schedules.json');
  let scheduleData: any = {};
  try {
    if (fs.statSync(schedulePath).mtimeMs < Date.now() - 2 * 60 * 60 * 1000) throw new Error('Outdated files');
    scheduleData = JSON.parse(fs.readFileSync(schedulePath, { encoding: 'utf-8' }));
  } catch (error) {
    await axios.get('https://splatoon3.ink/data/schedules.json')
      .then(res => {
        fs.writeFileSync(schedulePath, JSON.stringify(res.data, null, 2));
        scheduleData = res.data;
      })
      .catch(err => {
        console.log(err);
      });
  }
  return scheduleData;
}

interface Compile {
  timePeriods: {
    startTime: number;
    endTime: number;
  }[];
  mode: string;
  rule?: string;
  stages: string[];
  weapons?: string[];
  king?: string;
  internal: Modes;
}

function generateRotation(rot: Data, choice: string) {
  let index = 0;
  let dummy: Node = rot.data.regularSchedules.nodes[index];
  while (Date.parse(dummy.endTime) < Date.now()) {
    index++;
    dummy = rot.data.regularSchedules.nodes[index];
  }

  const compile: Compile[] = [];

  if (choice === Modes.REGULAR || choice === Modes.ALL) {
    const regular: Node = rot.data.regularSchedules.nodes[index];
    compile.push({
      timePeriods: [{
        startTime: Math.round(Date.parse(regular.startTime) / 1000),
        endTime: Math.round(Date.parse(regular.endTime) / 1000),
      }],
      mode: regular.regularMatchSetting.vsRule.name,
      stages: [regular.regularMatchSetting.vsStages[0].name, regular.regularMatchSetting.vsStages[1].name],
      internal: Modes.REGULAR
    });
  }

  if (choice === Modes.CHALLENGE || choice === Modes.ALL) {
    const challenge: Node = rot.data.bankaraSchedules.nodes[index];
    compile.push({
      timePeriods: [{
        startTime: Math.round(Date.parse(challenge.startTime) / 1000),
        endTime: Math.round(Date.parse(challenge.endTime) / 1000),
      }],
      mode: 'Anarchy Series',
      rule: challenge.bankaraMatchSettings[0].vsRule.name,
      stages: [challenge.bankaraMatchSettings[0].vsStages[0].name, challenge.bankaraMatchSettings[0].vsStages[1].name],
      internal: Modes.CHALLENGE
    });
  }

  if (choice === Modes.OPENS || choice === Modes.ALL) {
    const open: Node = rot.data.bankaraSchedules.nodes[index];
    compile.push({
      timePeriods: [{
        startTime: Math.round(Date.parse(open.startTime) / 1000),
        endTime: Math.round(Date.parse(open.endTime) / 1000),
      }],
      mode: 'Anarchy Opens',
      rule: open.bankaraMatchSettings[1].vsRule.name,
      stages: [open.bankaraMatchSettings[1].vsStages[0].name, open.bankaraMatchSettings[1].vsStages[1].name],
      internal: Modes.OPENS
    });
  }

  if (choice === Modes.X || choice === Modes.ALL) {
    const x: Node = rot.data.xSchedules.nodes[index];
    compile.push({
      timePeriods: [{
        startTime: Math.round(Date.parse(x.startTime) / 1000),
        endTime: Math.round(Date.parse(x.endTime) / 1000),
      }],
      mode: 'X Battle',
      rule: x.xMatchSetting.vsRule.name,
      stages: [x.xMatchSetting.vsStages[0].name, x.xMatchSetting.vsStages[1].name],
      internal: Modes.X
    });
  }

  if (choice === Modes.EVENT || choice === Modes.ALL) {
    let eventindex = 0;
    if (Date.parse(rot.data.eventSchedules.nodes[eventindex].timePeriods[2].endTime) < Date.now()) {
      eventindex++;
    }
    const event: Node = rot.data.eventSchedules.nodes[eventindex];

    compile.push({
      timePeriods: [
        {
          startTime: Math.round(Date.parse(event.timePeriods[0].startTime) / 1000),
          endTime: Math.round(Date.parse(event.timePeriods[0].endTime) / 1000),
        },
        {
          startTime: Math.round(Date.parse(event.timePeriods[1].startTime) / 1000),
          endTime: Math.round(Date.parse(event.timePeriods[1].endTime) / 1000),
        },
        {
          startTime: Math.round(Date.parse(event.timePeriods[2].startTime) / 1000),
          endTime: Math.round(Date.parse(event.timePeriods[2].endTime) / 1000),
        },
      ],
      mode: event.leagueMatchSetting.leagueMatchEvent.name,
      rule: event.leagueMatchSetting.vsRule.name,
      stages: [event.leagueMatchSetting.vsStages[0].name, event.leagueMatchSetting.vsStages[1].name],
      internal: Modes.EVENT
    });
  }

  if (choice === Modes.COOP || choice === Modes.ALL) {
    let coopindex = 0;
    if (Date.parse(rot.data.coopGroupingSchedule.regularSchedules.nodes[coopindex].endTime) < Date.now()) {
      coopindex++;
    }
    const coop: Node = rot.data.coopGroupingSchedule.regularSchedules.nodes[coopindex];

    compile.push({
      timePeriods: [{
        startTime: Math.round(Date.parse(coop.startTime) / 1000),
        endTime: Math.round(Date.parse(coop.endTime) / 1000),
      }],
      mode: 'Salmon Run',
      stages: [coop.setting.coopStage.name],
      king: coop.__splatoon3ink_king_salmonid_guess,
      weapons: [
        coop.setting.weapons[0].name,
        coop.setting.weapons[1].name,
        coop.setting.weapons[2].name,
        coop.setting.weapons[3].name
      ],
      internal: Modes.COOP
    });
  }

  let output = '';
  compile.forEach(m => {
    switch (m.internal) {
      case Modes.X:
      case Modes.CHALLENGE:
      case Modes.OPENS:
        output += `The current stages for ${m.mode} on ${m.rule} is ${m.stages[0]} and ${m.stages[1]}. This rotation will go from <t:${m.timePeriods[0].startTime}:t> to <t:${m.timePeriods[0].endTime}:t>.\n\n`;
        break;
      case Modes.COOP:
        output += `The current weapons for ${m.mode} on ${m.stages[0]} is ${m.weapons[0]}, ${m.weapons[1]}, ${m.weapons[2]}, and ${m.weapons[3]}. There is a forecast for the King Salmonid ${m.king}. This shift will go from <t:${m.timePeriods[0].startTime}:f> to <t:${m.timePeriods[0].endTime}:f>.\n\n`;
        break;
      case Modes.EVENT:
        output += `The upcoming ${m.mode} Challenge will be ${m.rule} on ${m.stages[0]} and ${m.stages[1]}. It will take place over the following timeslots:\n`;
        output += `- <t:${m.timePeriods[0].startTime}:f> to <t:${m.timePeriods[0].endTime}:f>\n`;
        output += `- <t:${m.timePeriods[1].startTime}:f> to <t:${m.timePeriods[1].endTime}:f>\n`;
        output += `- <t:${m.timePeriods[2].startTime}:f> to <t:${m.timePeriods[2].endTime}:f>\n\n`;
        break;
      default:
        output += `The current stages for ${m.mode} is ${m.stages[0]} and ${m.stages[1]}. This rotation will go from <t:${m.timePeriods[0].startTime}:t> to <t:${m.timePeriods[0].endTime}:t>.\n\n`;
        break;
    }
  });
  output.trimEnd();
  return output;
}
