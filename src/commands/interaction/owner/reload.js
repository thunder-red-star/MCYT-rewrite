import * as Builders from '@discordjs/builders';
import fs from 'fs';
import path from 'path';
import { __ } from '../../../utils/polyfill/__.js';
const { __filename, __dirname } = __(import.meta);

export default {
	name: "reload",
	enabled: true,
	ownerOnly: true,
	guildOnly: false,
	shortDescription: "Reload a command",
	longDescription: "Reload a command file, updating the command's backend without restarting the bot.",
	arguments: [{
		name: "command", description: "The command to reload", type: "string", required: true
	}],
	botPermissions: ["SEND_MESSAGES", "EMBED_LINKS"],
	userPermissions: ["MANAGE_GUILD"],
	cooldown: 5_000,
	execute: async function (interaction, client, args, Discord) {
		// Get command
		const command = interaction.options.getString("command");
		// Check if command exists
		if (!client.interactionCommands.has(command)) {
			const embed = new Builders.EmbedBuilder()
				.setColor(global.config.colors.error)
				.setDescription(`<:error:${global.config.emojis.error}> Command \`${command}\` does not exist.`);
			return interaction.reply({embeds: [embed]});
		}
		try {
			// Find command file
			let commandFile = null;
			let directories = fs.readdirSync(path.join(__dirname, ".."));
			for (let i = 0; i < directories.length; i++) {
				const directory = directories[i];
				const files = fs.readdirSync(path.join(__dirname, "..", directory));
				for (let j = 0; j < files.length; j++) {
					const file = files[j];
					if (file === `${command}.js`) {
						commandFile = path.join(__dirname, "..", directory, file);
						break;
					}
				}
				if (commandFile) break;
			}
			if (!commandFile) {
				const embed = new Builders.EmbedBuilder()
					.setColor(global.config.colors.error)
					.setDescription(`<:error:${global.config.emojis.error}> Command \`${command}\` does not exist.`);
				return interaction.reply({embeds: [embed]});
			}

		} catch (error) {
			global.logger.logRaw(error);
			const embed = new Builders.EmbedBuilder()
				.setColor(global.config.colors.error)
				.setDescription(`<:error:${global.config.emojis.error}> An error occurred while reloading command \`${command}\`.`);
			return interaction.reply({embeds: [embed]});
		}
	}
}