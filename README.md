# new-discord-bot

As it says on the box, trial run of a Discord bot using the guts of an old bot, hence new-discord-bot.  Written in TypeScript so hopefully, ideally, maybe, type safe (no guarantees). This thing is also just running on my laptop so it's going to have zero uptime. Don't expect me to host this bot any time soon.

## Commands

- /ping is your basic echo command.
- /user gets your username and join date.
- /server gets your server name and member count.
- /schedule powered by [splatoon3.ink](https://splatoon3.ink)'s API for Splatoon 3 schedule. Returns details about the current/upcoming rotations for Turf/Series/Opens/X/Challenge/Salmon.

## Deployment

- Run `npm install` to install any dependencies.
- Use your own `.env` file with `TOKEN` (bot token), `CLIENTID` (bot id) and `GUILDID` (server id).
- Edit `deploy.ts` to change deployment for one server or all servers.
- Run `npm run deploy` to register the commands for use.
- Run `npm start` to start the bot.

## Other

I hope I haven't leaked any env files or tokens cause that would be a very big problem.
