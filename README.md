# discord_bot

# How to use:
  1. Download and install node.js (https://nodejs.org/)
  2. Install dependencies with npm (and any manual dependencies that come up)
 
    npm install discord.js
    npm install weather-js
    npm install yt-search
    npm install ytdl-core
    npm install ffmpeg-static
    npm install @discordjs/opus

  3. Follow https://www.freecodecamp.org/news/create-a-discord-bot-with-javascript-nodejs/ to create application/bot on https://discord.com/developers
  4. Change example.env to .env and fill in values
## Commands:
  * **!help | !commands | ! commandlist** -> list commands
  * **!weather -arg** -> return weather for location (default-Vilnius)
  * **!sounds** -> returns all files in ./sounds/ folder
  * **!play +arg** -> plays a file from a sounds folder
  * **!youtube +arg** -> plays a youtube url or searches youtube and plays first result 
  * **!leave** -> stops playing and quits voice chat
 
## TO-DO:
  * Upgrade to discord-js v12
  * Pause/Resume playing
  * Queue
  * Record VC audio
## Useful sources for future work:
  * https://www.freecodecamp.org/news/create-a-discord-bot-with-javascript-nodejs/
  * https://discord.js.org/#/docs/main/stable/topics/voice
  * https://github.com/chebro/discord-voice-recorder
  * https://discordjs.guide/
  * https://github.com/TannerGabriel/discord-bot
