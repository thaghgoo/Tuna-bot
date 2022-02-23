const lib = require("lib")({ token: process.env.STDLIB_SECRET_TOKEN });

if (context.params.event.content.startsWith("!time")) {
  let timeZone =
    context.params.event.content.split(" ")[1] || "Asia/Tehran";
  let timeString;
  try {
    timeString = new Date().toLocaleString("en-US", {
      timeZone: timeZone,
    });
  } catch (e) {
    await lib.discord.channels["@0.1.1"].messages.create({
      channel_id: `${context.params.event.channel_id}`,
      content: [
        `Please enter a valid time zone. Examples include "UTC", "America/Los_Angeles", or "Asia/Tokyo".`,
        `See https://en.wikipedia.org/wiki/List_of_tz_database_time_zones for a full list`,
      ].join("\n"),
    });
    return;
  }
  await lib.discord.channels["@0.1.1"].messages.create({
    channel_id: `${context.params.event.channel_id}`,
    content: `The current time in ${timeZone} is ${timeString}!`,
  });
}
