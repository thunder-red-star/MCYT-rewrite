import * as Discord from 'discord.js';

export default async function ready (client) {
	global.logger.info(`[${client.shard.ids[0] + 1}] Shard is ready`);
	global.logger.info(`[${client.shard.ids[0] + 1}] Logged in as ${client.user.tag}`);

	client.user.setPresence({
		activities: [
			{
				name: 'mc!help | /help',
				type: Discord.ActivityType.Listening,
			},
			{
				name: 'GitHub Copilot',
				type: Discord.ActivityType.Watching,
			},
		],
		status: 'online',
	});

	global.logger.info(`[${client.shard.ids[0] + 1}] Presence set`);
}
