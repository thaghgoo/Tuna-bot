const lib = require('lib')({token: process.env.STDLIB_SECRET_TOKEN});
const ytdl = require('ytdl-core');
const ytSearch = require('yt-search');

let VOICE_CHANNEL = '937076437112979526';
let message = context.params.event.content;
// play function
if (message.startsWith('!play')) {
  let searchString = message.split(' ').slice(1).join(' ');
  //serach in youtube 
  try {
    let youtubeLink;
    if (!searchString) {
        return lib.discord.channels['@0.2.0'].messages.create({
        channel_id: `${context.params.event.channel_id}`,
        content: `No search string provided!`,
      });
    }
    if (!searchString.includes('youtube.com')) {
      let results = await ytSearch(searchString);
        if (!results?.all?.length) {
          return lib.discord.channels['@0.2.0'].messages.create({
          channel_id: `${context.params.event.channel_id}`,
          content: `No results found for your search string. Please try a different one.`,
        });
      }
      youtubeLink = results.all[0].url;
    } else {
      youtubeLink = searchString;
    }
    let downloadInfo = await ytdl.getInfo(youtubeLink);
    await lib.discord.voice['@0.0.1'].tracks.play({
      channel_id: `${VOICE_CHANNEL}`,
      guild_id: `${context.params.event.guild_id}`,
      download_info: downloadInfo
    });
    return lib.discord.channels['@0.2.0'].messages.create({
      channel_id: `${context.params.event.channel_id}`,
      content: `Tuna Now playing **${downloadInfo.videoDetails.title}**`,
    });
  } catch (e) {
    return lib.discord.channels['@0.2.0'].messages.create({
      channel_id: `${context.params.event.channel_id}`,
      content: `Failed to play track!`,
    });
    }
    // stop command function
} else if (message.startsWith('!leave')) {
    await lib.discord.voice['@0.0.1'].channels.disconnect({
    guild_id: `${context.params.event.guild_id}`
  });
    await lib.discord.channels['@0.2.0'].messages.create({
    channel_id: `${context.params.event.channel_id}`,
    content: `Tuna Disconnected from <#${VOICE_CHANNEL}>!`,
  });
  //pause command function
} else if (message.startsWith('!pause')) {
    await lib.discord.voice['@0.0.1'].tracks.pause({
    guild_id: `${context.params.event.guild_id}`
  });
    return lib.discord.channels['@0.2.0'].messages.create({
    channel_id: `${context.params.event.channel_id}`,
    content: `Tuna paused the song.`,
  });
} else if (message.startsWith('!resume')) {
    await lib.discord.voice['@0.0.1'].tracks.resume({
    guild_id: `${context.params.event.guild_id}`
  });
    return lib.discord.channels['@0.2.0'].messages.create({
    channel_id: `${context.params.event.channel_id}`,
    content: `Tuna resumed the song.`,
  });
}