import {REST} from '@discordjs/rest' ;
import {Routes} from 'discord-api-types/v9' ;
import {SlashCommandBuilder} from '@discordjs/builders';

function convertToSlashCommand(command) {
	const slashCommand = new SlashCommandBuilder()
		.setName(command.name)
		.setDescription(command.shortDescription)
	for (const arg of command.arguments) {
		if (arg.type === "string") {
			slashCommand.addStringOption((option) => {
				option.setName(arg.name)
					.setDescription(arg.description)
					.setRequired(arg.required);
				/*
				if (arg.choices.length > 0) {
					for (const choice of arg.choices) {
						option.addChoice(choice.name, choice.value);
					}
				}
				 */
				return option;
			});
		} else if (arg.type === "number") {
			slashCommand.addIntegerOption(option => option
				.setName(arg.name)
				.setDescription(arg.description)
				.setRequired(arg.required)
				.addChoices(arg.choices.map(choice => [choice.name, choice.value])));
		} else if (arg.type === "boolean") {
			slashCommand.addBooleanOption(option => option
				.setName(arg.name)
				.setDescription(arg.description)
				.setRequired(arg.required));
		} else if (arg.type === "user") {
			slashCommand.addUserOption(option => option
				.setName(arg.name)
				.setDescription(arg.description)
				.setRequired(arg.required));
		} else if (arg.type === "channel") {
			slashCommand.addChannelOption(option => option
				.setName(arg.name)
				.setDescription(arg.description)
				.setRequired(arg.required));
		} else {
			slashCommand.addStringOption((option) => {
				option.setName(arg.name)
					.setDescription(arg.description)
					.setRequired(arg.required);
				if (arg.choices) {
					option.addChoices(arg.choices.map(choice => [choice.name, choice.value]));
				}
				return option;
			});
		}
	}
	return slashCommand;
}

export async function deployAll(client) {
	// Assuming client contains interactionCommands collection
	let commands = client.interactionCommands.map(command => convertToSlashCommand(command).toJSON());
	const rest = new REST({version: '9'}).setToken(client.token);

	try {
		await rest.put(Routes.applicationCommands(client.user.id), {body: commands},);

		global.logger.info(`[${client.shard.ids[0] + 1}] Successfully registered application commands.`);
	} catch (error) {
		global.logger.error(`[${client.shard.ids[0] + 1}] Could not register application commands: ${error}`);
	}
}

export async function deployGuild(client, guildId) {
	// Assuming client contains interactionCommands collection
	const commands = client.interactionCommands.map(command => convertToSlashCommand(command).toJSON());
	const rest = new REST({version: '9'}).setToken(client.token);

	try {
		await rest.put(Routes.applicationGuildCommands(client.user.id, guildId), {body: commands},);

		global.logger.info(`[${client.shard.ids[0] + 1}] Successfully registered application commands for guild ${guildId}.`);
	} catch (error) {
		global.logger.error(`[${client.shard.ids[0] + 1}] Could not register application commands for guild ${guildId}: ${error}`);
	}
}
