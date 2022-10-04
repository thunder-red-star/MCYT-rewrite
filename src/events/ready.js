export default async function ready (client) {
	global.logger.info(`[${client.shard.ids[0] + 1}] Shard is ready`);
	global.logger.info(`[${client.shard.ids[0] + 1}] Logged in as ${client.user.tag}`);

	await client.user.setPresence({
		activities: [{
			name: 'getting rewritten',
			type: 'PLAYING',
		}, {
			name: 'mc!help',
			type: 'LISTENING',
		}],
		status: 'mobile'
	});
}