import * as Builders from "discord.js";
import fanfictionSearchPaginator from "../../../utils/design/fanfictionSearchPaginator.js";

export default {
	name: "read",
	enabled: true,
	ownerOnly: false,
	guildOnly: false,
	shortDescription: "Read a fanfiction on AO3",
	longDescription: "Read a fanfiction, all in your Discord server!",
	arguments: [],
	botPermissions: ["SEND_MESSAGES", "EMBED_LINKS"],
	userPermissions: [],
	cooldown: 5_000,
	execute: async function (interaction, client, args, Discord) {
		await interaction.reply({
			content: "temp",
		});
	},
}