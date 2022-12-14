import { EmbedBuilder, ButtonBuilder, ActionRowBuilder } from "@discordjs/builders";

export default {
	name: "invite",
	enabled: true,
	ownerOnly: false,
	guildOnly: false,
	shortDescription: "Get an invite link for the bot",
	longDescription: "Get an invite link for the bot",
	arguments: [],
	cooldown: 1_000,
	userPermissions: [],
	botPermissions: [
		"SEND_MESSAGES",
		"EMBED_LINKS"
	],
	async execute(message, client, args, Discord) {
		let embed = new EmbedBuilder()
			.setColor(global.config.colors.default)
			.setDescription(`There's an invite button in my About me! But if you want to invite me manually, click the button below!`);

		let button = new ButtonBuilder()
			.setLabel("Invite me!")
			.setStyle(5)
			.setURL(`https://discord.com/api/oauth2/authorize?client_id=${client.user.id}&permissions=${global.config.invitePermissions}&scope=bot%20applications.commands`);

		let row = new ActionRowBuilder()
			.addComponents(button);

		return message.reply({ embeds: [embed], components: [row] });
	}
}