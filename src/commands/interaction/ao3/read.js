import * as Builders from "discord.js";
import fanfictionReadPaginator from "../../../utils/design/fanfictionReadPaginator.js";
import AO3 from "ao3";

export default {
	name: "read",
	enabled: true,
	ownerOnly: false,
	guildOnly: false,
	shortDescription: "Read a fanfiction on AO3",
	longDescription: "Read a fanfiction, all in your Discord server!",
	arguments: [{
		name: "id",
		description: "The work ID of the fanfiction you want to read (use /search to find IDs).",
		type: "string",
		required: true,
		choices: []
	}],
	botPermissions: ["SEND_MESSAGES", "EMBED_LINKS"],
	userPermissions: [],
	cooldown: 5_000,
	execute: async function (interaction, client, args, Discord) {
		// Get command
		await interaction.deferReply();
		const workId = interaction.options.getString("id");
		const work = new AO3.Work(workId, { load: false });

		// Pass the work to the paginator
		await fanfictionReadPaginator(interaction, work);
	},
}