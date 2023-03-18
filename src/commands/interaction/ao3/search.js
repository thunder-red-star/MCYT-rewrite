import * as Builders from "discord.js";
import fanfictionSearchPaginator from "../../../utils/design/fanfictionSearchPaginator.js";

export default {
	name: "search",
	enabled: true,
	ownerOnly: false,
	guildOnly: false,
	shortDescription: "Search for fanfiction on AO3",
	longDescription: "Search for fanfiction on AO3 and list the results.",
	arguments: [],
	botPermissions: ["SEND_MESSAGES", "EMBED_LINKS"],
	userPermissions: [],
	cooldown: 5_000,
	execute: async function (interaction, client, args, Discord) {
		// Build modal display it
		return await interaction.reply({
			content: "We have disabled this function because we are rewriting an entire core library of AO3. Check back soon!",
		});
		// we don't have to get to this code yet.
		const modal = new Builders.ModalBuilder()
			.setTitle("AO3 Search")
			.setCustomId("ao3search")
			.addComponents([
				new Builders.ActionRowBuilder()
					.addComponents(new Builders.TextInputBuilder()
						.setCustomId("allFields")
						.setPlaceholder("DreamNotFound")
						.setRequired(false)
						.setLabel("All fields")
						.setStyle(1))
			])
			.addComponents([
				new Builders.ActionRowBuilder()
					.addComponents(new Builders.TextInputBuilder()
						.setCustomId("title")
						.setPlaceholder("Helium")
						.setLabel("Title")
						.setRequired(false)
						.setStyle(1))
			])
			.addComponents([
				new Builders.ActionRowBuilder()
					.addComponents(new Builders.TextInputBuilder()
						.setCustomId("author")
						.setPlaceholder("ThunderRedStar")
						.setLabel("Author")
						.setRequired(false)
						.setStyle(1))
			])
			.addComponents([
				new Builders.ActionRowBuilder()
					.addComponents(new Builders.TextInputBuilder()
						.setCustomId("character")
						.setPlaceholder("Dream")
						.setLabel("Characters")
						.setRequired(false)
						.setStyle(1))
			])
			.addComponents([
				new Builders.ActionRowBuilder()
					.addComponents(new Builders.TextInputBuilder()
						.setCustomId("relationship")
						.setPlaceholder("Dream and George")
						.setLabel("Relationships")
						.setRequired(false)
						.setStyle(1))
			])
		// Show the modal
		await interaction.showModal(modal);

		// Wait for the user to submit the modal
		let modalSubmission = await interaction.awaitModalSubmit({time: 15_000, max: 1});

		if (!modalSubmission) {
			return interaction.editReply({
				content: "You took too long to respond!",
				ephemeral: true
			});
		}

		// Get the values from the modal
		let allFields = modalSubmission.fields.getTextInputValue("allFields");
		let title = modalSubmission.fields.getTextInputValue("title");
		let author = modalSubmission.fields.getTextInputValue("author");
		let character = modalSubmission.fields.getTextInputValue("character");
		let relationship = modalSubmission.fields.getTextInputValue("relationship");

		// If they are all empty, return
		if (!allFields && !title && !author && !character && !relationship) {
			if (allFields.length === 0 && title.length === 0 && author.length === 0 && character.length === 0 && relationship.length === 0) {
				return interaction.editReply({
					content: "You didn't provide any search terms!",
					ephemeral: true
				});
			}
		}

		await fanfictionSearchPaginator(interaction, modalSubmission, {
			allFields: allFields,
			title: title,
			author: author,
			character: character,
			relationship: relationship
		})
	}
}