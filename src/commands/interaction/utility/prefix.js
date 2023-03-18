import * as Builders from '@discordjs/builders';

export default {
	name: "prefix",
	enabled: true,
	ownerOnly: false,
	guildOnly: false,
	shortDescription: "Set bot prefix",
	longDescription: "Allows you to set the bot's prefix for this server.",
	arguments: [
		{
			name: "prefix",
			description: "The new prefix to set",
			type: "string",
			required: false
		}
	],
	botPermissions: [
		"SEND_MESSAGES",
		"EMBED_LINKS"
	],
	userPermissions: [
		"MANAGE_GUILD"
	],
	cooldown: 5_000,
	execute: async function (interaction, client, args, Discord) {
		// Get prefix
		await interaction.deferReply();
		let prefix;
		let prefixData = await global.database.guild.get.by({_id: interaction.guild.id})
		if (!prefixData || prefixData === null) {
			prefix = global.config.defaultPrefix;
		} else {
			prefix = prefixData.prefix;
		}
		let newPrefix = interaction.options.getString("prefix");
		// Did the database entry not exist?
		if (!prefixData || prefixData === null) {
			/*
			// Check if prefix is the same
		if (newPrefix === null || newPrefix === undefined) {
			// Reset prefix to default
			await global.database.guild.update.by(interaction.guild.id, {prefix: global.config.defaultPrefix});
			// Send interaction
			const embed = new Builders.EmbedBuilder()
				.setColor(global.config.colors.success)
				.setDescription(`<:check:${global.config.emojis.check}> Prefix has been reset to \`${global.config.defaultPrefix}\`.`);
			return interaction.editReply({ embeds: [embed] });
		} else if (prefix === newPrefix) {
			// Reply
			const embed = new Builders.EmbedBuilder()
				.setColor(global.config.colors.warning)
				.setDescription(`<:warning:${global.config.emojis.warning}> No prefix change (new prefix is the same as the old one)`);
			return interaction.editReply({embeds: [embed]});
		}
		Do this but instead of updating, create a new entry
			 */
			// Create new entry
			if (newPrefix === null || newPrefix === undefined) {
				// Create new entry
				await global.database.guild.create(interaction.guild.id, global.config.defaultPrefix);
				// Send interaction
				const embed = new Builders.EmbedBuilder()
					.setColor(global.config.colors.success)
					.setDescription(`<:check:${global.config.emojis.check}> Prefix has been reset to \`${global.config.defaultPrefix}\`.`);
				return interaction.editReply({ embeds: [embed] });
			} else if (prefix === newPrefix) {
				// Reply
				const embed = new Builders.EmbedBuilder()
					.setColor(global.config.colors.warning)
					.setDescription(`<:warning:${global.config.emojis.warning}> No prefix change (new prefix is the same as the old one)`);
				return interaction.editReply({ embeds: [embed] });
			} else {
				// Set prefix
				await global.database.guild.create(interaction.guild.id, newPrefix);
				// Reply
				const embed = new Builders.EmbedBuilder()
					.setColor(global.config.colors.success)
					.setDescription(`<:check:${global.config.emojis.check}> Prefix changed to \`${newPrefix}\``);
				return interaction.editReply({ embeds: [embed] });
			}
		} else {
			// Check if prefix is the same
			if (newPrefix === null || newPrefix === undefined) {
				// Reset prefix to default
				await global.database.guild.update.by(interaction.guild.id, {prefix: global.config.defaultPrefix});
				// Send interaction
				const embed = new Builders.EmbedBuilder()
					.setColor(global.config.colors.success)
					.setDescription(`<:check:${global.config.emojis.check}> Prefix has been reset to \`${global.config.defaultPrefix}\`.`);
				return interaction.editReply({embeds: [embed]});
			} else if (prefix === newPrefix) {
				// Reply
				const embed = new Builders.EmbedBuilder()
					.setColor(global.config.colors.warning)
					.setDescription(`<:warning:${global.config.emojis.warning}> No prefix change (new prefix is the same as the old one)`);
				return interaction.editReply({embeds: [embed]});
			} else {
				// Set prefix
				await global.database.guild.update.by(interaction.guild.id, {prefix: newPrefix});
				// Reply
				const embed = new Builders.EmbedBuilder()
					.setColor(global.config.colors.success)
					.setDescription(`<:check:${global.config.emojis.check}> Prefix changed to \`${newPrefix}\``);
				return interaction.editReply({embeds: [embed]});
			}
		}
	}
}