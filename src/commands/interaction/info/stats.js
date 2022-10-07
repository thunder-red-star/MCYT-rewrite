import { EmbedBuilder } from '@discordjs/builders';
import * as os from 'node:os';
import ms from 'ms';
import * as fs from 'node:fs';
import * as path from 'node:path';

// Polyfill for __dirname
import { __ } from '../../../utils/polyfill/__.js';
const { __filename, __dirname } = __(import.meta);

function buildGaugeString (value, max) {
	// Max gauge width excluding the side borders is 20.
	const gaugeWidth = 20;
	const gaugeFill = "█";
	const gaugeEmpty = " ";
	let calculatedValue = value / max * gaugeWidth;
	let string = "`";
	for (let i = 0; i < gaugeWidth; i++) {
		if (i < calculatedValue) {
			string += gaugeFill;
		} else {
			string += gaugeEmpty;
		}
	}
	return string + "`";
}

function calculateLoadPercentAndReturnAString() {
	// The string will be formatted as "<average load>% <gauge>"
	const load = os.loadavg();
	const averageLoad = Math.round(load[0] * 100);
	const gauge = buildGaugeString(averageLoad, 100);
	return `${averageLoad}% ${gauge}`;
}

function calculateMemoryUsageAndReturnAString() {
	const memoryUsage = process.memoryUsage();
	const totalMemory = Math.round(memoryUsage.heapTotal / 1024 / 1024);
	const usedMemory = Math.round(memoryUsage.heapUsed / 1024 / 1024);
	const gauge = buildGaugeString(usedMemory, totalMemory);
	return `${usedMemory}/${totalMemory}MB ${gauge}`;
}

function calculateSystemMemoryUsageAndReturnAString() {
	const memoryUsage = os.freemem();
	const totalMemory = Math.round(os.totalmem() / 1024 / 1024);
	const usedMemory = Math.round(memoryUsage / 1024 / 1024);
	const gauge = buildGaugeString(usedMemory, totalMemory);
	return `${usedMemory}/${totalMemory}MB ${gauge}`;
}

export default {
	name: 'stats',
	enabled: true,
	ownerOnly: false,
	guildOnly: false,
	shortDescription: 'Get bot stats',
	longDescription: 'Get the bot\'s stats, including uptime, memory usage, and more.',
	arguments: [],
	botPermissions: [
		'SEND_MESSAGES',
		'EMBED_LINKS',
	],
	userPermissions: [],
	cooldown: 5_000,
	execute: async function(interaction, client, args, Discord) {
		// Get package.json
		const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, '../../../../package.json'), 'utf8'));
		
		let totalUsers = 0;
		for (let guild of client.guilds.cache.values()) {
			totalUsers += guild.memberCount;
		}
		// Create a statistics embed.
		let discordJSVersion = packageJson.dependencies["discord.js"].replace(/^(\d+\.\d+\.\d+).*$/, "$1");
		let otherDependencies = Object.keys(packageJson.dependencies).filter(dependency => dependency !== "discord.js");
		let otherDependenciesString = "";
		if (otherDependencies.length > 0) {
			// Create a string of other dependencies. Each line should look like this:
			// "name@version"
			otherDependenciesString = otherDependencies.map(dependency => `•  ${dependency}: \`${packageJson.dependencies[dependency].replace(/^(\d+\.\d+\.\d+).*$/, "$1").replace("^", "").replace("~", "")}\``).join("\n");
		}
		const statsEmbed = new EmbedBuilder()
			.setTitle("Statistics")
			.addFields([
				{
					name: "Development statistics",
					value: `Node Version: ${process.version}
					Library: discord.js v${discordJSVersion.replace("^", "")}
					Depends on: 
					${otherDependenciesString}
					`
				},
				{
					name: "System statistics",
					value: `
					OS: ${os.type()} ${os.release()}
					CPU: ${os.cpus()[0].model} (${os.cpus()[0].speed} MHz) x${os.cpus().length}
					System Load: ${calculateLoadPercentAndReturnAString()}
					System Memory: ${calculateSystemMemoryUsageAndReturnAString()}
				  `
				},
				{
					name: "Bot statistics",
					value: `
					Uptime: ${ms(client.uptime)}
					Memory Usage: ${calculateMemoryUsageAndReturnAString()}
					Number of guilds: ${client.guilds.cache.size}
					Number of users: ${totalUsers}
					Number of cached users: ${client.users.cache.size}
					`
				}
			])
			.setColor(global.config.colors.default)
			.setFooter({
				text: `${client.user.username} v${packageJson.version}`
			})
			.setTimestamp()

		await interaction.deferReply();

		return interaction.editReply({
			embeds: [statsEmbed]
		});
	}
}