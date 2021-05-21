/*
    download and install node.js
    npm install discord.js // discord api (install all manual dependencies)
    npm install weather-js // weather api
    npm install yt-search // youtube search api
    npm install ytdl-core // youtube downloader api
    npm install ffmpeg-static // multimedia framework for voice commands
    npm install @discordjs/opus // encoder for voice commands
    
    Command example: !youtube https://www.youtube.com/watch?v=dQw4w9WgXcQ
    Prefix - ! 
    Command keyword - youtube
    Argument - https://www.youtube.com/watch?v=ZlAU_w7-Xp8
    
    TODO:
    pause, resume, record VC audio
*/

// libraries and other files
require('dotenv').config(); //  .env config file
const fs = require('fs'); // file system module
const ytdl = require('ytdl-core'); 
const ytSearch = require('yt-search');
const Discord = require('discord.js');
const weather = require('weather-js');

// setup
const bot = new Discord.Client();
const token = process.env.TOKEN;
const prefix = process.env.PREFIX;
const main_channel_id = process.env.MAIN_CHANNEL_ID;
const ignore_channels = process.env.IGNORE_CHANNEL_ID.split(",");
bot.login(token);

// on connect
bot.on('ready', async message => {
    console.info(`${bot.user.tag} logged in`);
    bot.channels.get(main_channel_id).send('Hello there! I am now active!');
});

// on reconnect
bot.once('reconnecting', async message => {
    console.log(`${bot.user.tag} reconnecting`);
    bot.channels.get(main_channel_id).send('Oops, had some trouble. Reconnecting now!');
});

// on disconnect
bot.once('disconnect', async message => {
    console.log(`${bot.user.tag} disconnected`);
    bot.channels.get(main_channel_id).send('Disconnecting now. Bye, bye!');
});

// command handler
bot.on('message', async message => {
    if (!message.guild) return;
    if (!message.content.startsWith(prefix)) return;
    if (ignore_channels.includes(message.channel.id)) return;
    
    const arguments = message.content.slice(prefix.length).split(/ +/);
    const command = arguments.shift().toLowerCase();

    switch(command){
        case 'ping':
            message.channel.send('Pong.');
            break;
        case 'help':
        case 'commands':
        case 'commandlist':
            get_commands(message);
            break;
        case 'sounds':
            get_sounds(message);
            break;
        case 'play':
            file_play(message, arguments);
            break;
        case 'youtube':
            youtube_play(message, arguments);
            break;
        case 'weather':
            weather_function(message, arguments);
            break;
        case 'leave':
            leave(message);
            break;
        default:
            message.reply("Sorry, no such command!");
    }
});

// prints a list of commands with explanations
function get_commands(message){
    const embed_msg = new Discord.RichEmbed()
    .setTitle("Command List")
    .setColor("#E96A00")
    .addField("!weather -arg", 'Shows current weather')
    .addField("!sounds", 'Shows available sound files')
    .addField("!play +arg", 'Plays available sound files')
    .addField("!youtube +arg", 'Plays/searches youtube');
    
    message.channel.send(embed_msg);
}

// prints a list of available sound files to play
function get_sounds(message){
    var files = fs.readdirSync('./sounds/');
    var names = "```fix\n";
    files.forEach(file => {
        names = names.concat(file).concat('\n');
    });
    names = names.concat("```");
    message.channel.send(names);
}

// prints embed of weather for given location (default=Vilnius)
async function weather_function(message, args){
    arg = args.join(' ');
    if (arg === "") arg = "Vilnius, Lithuania";
    weather.find({search: arg, degreeType: 'C'}, function(err, result) {
                if(err) console.log(err);
                
                const embed_msg = new Discord.RichEmbed()
                .setTitle(`Weather - ${result[0].location.name}`)
                .setColor('#ff2050')
                .setDescription("Might not be accurate")
                .setThumbnail(result[0].current.imageUrl)
                .addField("Temperature", result[0].current.temperature, true)
                .addField("Sky", result[0].current.skytext, false);
                
                message.channel.send(embed_msg);
                
    });
}

// plays a sound file
async function file_play(message, args){
    const voiceChannel = message.member.voiceChannel;
 
    if (!voiceChannel) return message.channel.send('Join a channel first!');
    if (!args.length) return message.channel.send('Second argument needed!');
    
    const permissions = voiceChannel.permissionsFor(message.client.user);
    if (!permissions.has('CONNECT')) return message.channel.send('Missing "Connect" permission');
    if (!permissions.has('SPEAK')) return message.channel.send('Missing "Speak" permission');
    
    var fileToPlay = args.join(' ');
    const connection = await voiceChannel.join();
    connection.playFile('./sounds/'.concat(fileToPlay))
            .on('finish', () =>{
                voiceChannel.leave();
                message.channel.send('leaving channel');
            });
}

// plays a youtube url or first search result if given not url
// example url: https://www.youtube.com/watch?v=dQw4w9WgXcQ
async function youtube_play(message, args) {
    const voiceChannel = message.member.voiceChannel;
 
    if (!voiceChannel) return message.channel.send('Join a channel first!');
    if (!args.length) return message.channel.send('Second argument needed!');
    
    const permissions = voiceChannel.permissionsFor(message.client.user);
    if (!permissions.has('CONNECT')) return message.channel.send('Missing "Connect" permission');
    if (!permissions.has('SPEAK')) return message.channel.send('Missing "Speak" permission');
    
    const validURL = (str) =>{
        var regex = /^((?:https?:)?\/\/)?((?:www|m)\.)?((?:youtube\.com|youtu.be))(\/(?:[\w\-]+\?v=|embed\/|v\/)?)([\w\-]+)(\S+)?$/;
        if(!regex.test(str)){
            return false;
        }else{
            return true;
        }
    }
 
    if(validURL(args[0])){
        const connection = await voiceChannel.join();
        const stream  = ytdl(args[0], {filter: 'audioonly'});
 
        connection.playStream(stream, {seek: 0, volume: 1})
            .on('finish', () =>{
                voiceChannel.leave();
                message.channel.send('Leaving channel');
            });
 
        await message.reply(`Now playing your link`)
 
        return
    }
 
        
    const connection = await voiceChannel.join();
 
    const videoFinder = async (query) => {
        const videoResult = await ytSearch(query);
        return (videoResult.videos.length > 1) ? videoResult.videos[0] : null;
    }
 
    const video = await videoFinder(args.join(' '));
 
    if(video){
        const stream  = ytdl(video.url, {filter: 'audioonly'});
        connection.playStream(stream, {seek: 0, volume: 1})
            .on('finish', () =>{
                voiceChannel.leave();
            });
            
        await message.reply(`Now Playing: ***${video.title}***`)
    }else{
        message.channel.send('No results found');
    }
}
    
// leaves voice chat
async function leave(message) {
    const voiceChannel = message.member.voiceChannel;
    if(!voiceChannel) return message.channel.send("You need to be in a voice channel to stop the music!");  
    await voiceChannel.leave();
    await message.channel.send('Leaving channel :smiling_face_with_tear:')
}