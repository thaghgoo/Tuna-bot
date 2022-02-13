const lib = require("lib")({ token: process.env.STDLIB_SECRET_TOKEN });

if (context.params.event.content.includes("!setstatus")) {
  lib.discord.users["@0.2.0"].me.status.update({
    activity_name: `Your favorite music`,
    activity_type: "GAME",
    status: "ONLINE",
  });

  return lib.discord.channels["@0.2.0"].messages.create({
    channel_id: `${context.params.event.channel_id}`,
    content: `the Tuna's status was set!`,
  });
}

if (context.params.event.content.includes("!clearstatus")) {
  lib.discord.users["@0.1.5"].me.status.clear();

  return lib.discord.channels["@0.2.0"].messages.create({
    channel_id: `${context.params.event.channel_id}`,
    content: `The Tuna's status was cleared!`,
  });
}
