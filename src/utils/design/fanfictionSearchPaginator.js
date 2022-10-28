// Message command paginator (use buttons)

import * as Builders from "@discordjs/builders";
import AO3Wrapper from "../api/ao3wrapper.js";

async function getCommandMention (interaction, cmdName) {
	let commands = interaction.guild.commands.cache;
	if (!commands.find(cmd => cmd.name === cmdName && cmd.applicationId === interaction.client.user.id)) {
		commands = await interaction.guild.commands.fetch();
	}
	return `</${cmdName}:${commands.find(cmd => cmd.name === cmdName && cmd.applicationId === interaction.client.user.id) ?.id}>`;
}

const leftButton = new Builders.ButtonBuilder()
	.setCustomId("left")
	.setStyle(1)
	.setEmoji({
		name: "⬅️",
		id: global.config.emojis.paginator.left,
		animated: false
	});
const rightButton = new Builders.ButtonBuilder()
	.setCustomId("right")
	.setStyle(1)
	.setEmoji({
		name: "➡️",
		id: global.config.emojis.paginator.right,
		animated: false
	});
const stopButton = new Builders.ButtonBuilder()
	.setCustomId("delete")
	.setStyle(4)
	.setEmoji({
		name: "⏹️",
		id: global.config.emojis.paginator.delete,
		animated: false
	});
const firstButton = new Builders.ButtonBuilder()
	.setCustomId("first")
	.setStyle(1)
	.setEmoji({
		name: "⏪",
		id: global.config.emojis.paginator.first,
		animated: false
	});
const lastButton = new Builders.ButtonBuilder()
	.setCustomId("last")
	.setStyle(1)
	.setEmoji({
		name: "⏩",
		id: global.config.emojis.paginator.last,
		animated: false
	});
const searchButton = new Builders.ButtonBuilder()
	.setCustomId("search")
	.setStyle(1)
	.setEmoji({
		name: "🔍",
		id: global.config.emojis.paginator.search,
		animated: false
	});
const blankButton1 = new Builders.ButtonBuilder()
	.setLabel(" ")
	.setStyle(2)
	.setCustomId("blank1");

const blankButton2 = new Builders.ButtonBuilder()
	.setLabel(" ")
	.setStyle(2)
	.setCustomId("blank2");

const blankButton3 = new Builders.ButtonBuilder()
	.setLabel(" ")
	.setStyle(2)
	.setCustomId("blank3");

const blankButton4 = new Builders.ButtonBuilder()
	.setLabel(" ")
	.setStyle(2)
	.setCustomId("blank4");

let row1 = [
	firstButton,
	leftButton,
	searchButton,
	rightButton,
	lastButton
]

let row2 = [
	blankButton1,
	blankButton2,
	stopButton,
	blankButton3,
	blankButton4
]

export default async function(interaction, modal, searchQuery) {
  try {
		await modal.deferReply();
	} catch (e) {
		// ignore
	}
	// Get search results
	const AO3 = new AO3Wrapper();
	const searchResults = await AO3.searchWorks(searchQuery);
	let resultsTotal = searchResults.length;
	let embeds = [];
	let searchPage = 1;

	// Are there any results?
	if (resultsTotal.length === 0) {
		return await modal.editReply({
			content: "No results found.",
			ephemeral: true
		});
	}

	// Create embeds (we'll use 5 results per page)
	let resultsPerPage = 5;
	let pagesTotal = Math.ceil(resultsTotal / resultsPerPage);
	let currentPage = 0;
	for (let i = 0; i < resultsTotal; i += resultsPerPage) {
		let embed = new Builders.EmbedBuilder()
			.setColor(global.config.colors.default)
			.setTitle(`Fanfiction search results`)
			.setDescription("Read a fanfiction by using " + await getCommandMention(interaction, "read") + " <id>.")

		// Add results to embed
		for (let j = i; j < i + resultsPerPage; j++) {
			let result = searchResults[j];
			if (result) {
				embed.addFields({
					name: `${result.title} by ${result.author || "Anonymous"}`,
					// Try to get summary, if no summary then say "No summary available". If summary too long (256), trim it, and trim newlines from beginning and end.
					value: "ID: `" + result.id + "`\n" + "[Read online](https://archiveofourown.org/works/" + result.id + ")\n" + (result.summary ? (result.summary.length > 256 ? result.summary.trim().substring(0, 253) + "..." : result.summary.trim()) : "No summary available.")
				});
			}
		}

		embeds.push(embed);
	}

	let actionRow1 = new Builders.ActionRowBuilder();
	let actionRow2 = new Builders.ActionRowBuilder();
	let page = 0;
	for (let i = 0; i < row1.length; i++) {
		// Copy the button into a new button
		let button = new Builders.ButtonBuilder()
			.setCustomId(row1[i].data.custom_id)
			.setStyle(row1[i].data.style)
			.setEmoji(row1[i].data.emoji)
		if (page === 0 && (i === 0 || i === 1)) {
			button.setDisabled(true);
		}
		if (page === embeds.length - 1 && (i === 3 || i === 4)) {
			button.setDisabled(true);
		}
		actionRow1.addComponents([button]);
	}
	for (let i = 0; i < row2.length; i++) {
		actionRow2.addComponents([row2[i]]);
	}

	// Create message
	let message = await modal.editReply({
		content: `Page ${currentPage + 1} of ${pagesTotal}`,
		embeds: [
			embeds[currentPage]
		],
		components: [
			actionRow1,
			actionRow2
		]
	});

	// Create collector
	const filter = i => i.user.id === interaction.user.id

	const collector = message.createMessageComponentCollector({
		filter,
		time: 60000
	});

	collector.on("collect", async button => {
		if (button.user.id !== interaction.user.id) return;
		// Reset the button collector timeout
		collector.resetTimer();
		switch (button.customId) {
			case 'first':
				currentPage = 0;
				break;
			case 'left':
				if (currentPage > 0) {
					currentPage--;
				}
				break;
			case 'delete':
				await modal.deleteReply();
				return;
			case 'right':
				currentPage++;
				if (currentPage > pagesTotal - 1) {
					// Load next 20 results
					await button.deferUpdate();
					let newSearchQuery = searchQuery;
					newSearchQuery["page"] = searchPage + 1;
					searchPage++;
					await modal.editReply({
						content: `Loading pages ${currentPage + 1} through ${currentPage + 4}...`,
						embeds: [],
						components: []
					});
					const newSearchResults = await AO3.searchWorks(newSearchQuery);
					if (newSearchResults.length === 0) {
						currentPage--;
						return await button.editReply({
							content: "No more results found.",
							ephemeral: true
						});
					} else {
						// Add new results to searchResults
						searchResults.push(...newSearchResults);
						resultsTotal = searchResults.length;
						pagesTotal = Math.ceil(resultsTotal / resultsPerPage);
						// Create new embeds
						for (let i = 0; i < newSearchResults.length; i += resultsPerPage) {
							let embed = new Builders.EmbedBuilder()
								.setColor(global.config.colors.default)
								.setTitle(`Fanfiction search results`)
								.setDescription("Read a fanfiction by using " + await getCommandMention(interaction, "read") + " <id>.")

							// Add results to embed
							for (let j = i; j < i + resultsPerPage; j++) {
								let result = newSearchResults[j];
								if (result) {
									embed.addFields({
										name: `${result.title} by ${result.author || "Anonymous"}`,
										// Try to get summary, if no summary then say "No summary available". If summary too long (256), trim it, and trim newlines from beginning and end.
										value: "ID: `" + result.id + "`\n" + "[Read online](https://archiveofourown.org/works/" + result.id + ")\n" + (result.summary ? (result.summary.length > 256 ? result.summary.trim().substring(0, 253) + "..." : result.summary.trim()) : "No summary available.")
									});
								}
							}

							embeds.push(embed);
						}
					}
				}
				break;
			case 'last':
				currentPage = embeds.length - 1;
				break;
			case 'search':
				// Build a modal
				let searchModal = new Builders.ModalBuilder()
					.setTitle("Search for a page")
					.setCustomId("searchModal")
					.addComponents([
						new Builders.ActionRowBuilder()
							.addComponents(
								new Builders.TextInputBuilder()
									.setCustomId("searchInput")
									.setPlaceholder("Page number or title")
									.setMinLength(1)
									.setMaxLength(100)
									.setLabel("Type in a page number or your query")
									.setStyle(1)
							)
					])

				// Send the modal
				await button.showModal(searchModal);
				let modalSubmission = await button.awaitModalSubmit({time: 15_000, max: 1});
				if (!modalSubmission) {
					await button.reply({
						content: "Timed out",
						ephemeral: true
					});
					return;
				} else {
					// Get the input
					let input = modalSubmission.fields.getTextInputValue("searchInput");
					if (isNaN(input)) {
						// Search for the query in the embeds
						let query = input.toLowerCase();
						let found = false;
						for (let i = 0; i < embeds.length; i++) {
							if (embeds[i].description.toLowerCase().includes(query) || embeds[i].title.toLowerCase().includes(query)) {
								currentPage = i;
								found = true;
								break;
							}
						}
						if (!found) {
							await modalSubmission.reply({
								content: "No page found",
								ephemeral: true
							});
							return;
						}
					} else {
						// Search for the page number
						if (input > embeds.length || input < 1) {
							await modalSubmission.reply({
								content: "No page found",
								ephemeral: true
							});
							return;
						}
						currentPage = input - 1;
					}
					// Update the page
					let actionRow1 = new Builders.ActionRowBuilder();
					let actionRow2 = new Builders.ActionRowBuilder();
					for (let i = 0; i < row1.length; i++) {
						// Copy the button into a new button
						let button = new Builders.ButtonBuilder()
							.setCustomId(row1[i].data.custom_id)
							.setStyle(row1[i].data.style)
							.setEmoji(row1[i].data.emoji)
						if (currentPage === 0 && (i === 0 || i === 1)) {
							button.setDisabled(true);
						}
						if (currentPage === embeds.length - 1 && (i === 4)) {
							button.setDisabled(true);
						}
						actionRow1.addComponents([button]);
					}
					for (let i = 0; i < row2.length; i++) {
						actionRow2.addComponents([row2[i]]);
					}

					await modalSubmission.reply({
						content: `Gotcha!`,
						ephemeral: true
					});

					// Send the new page
					await modal.editReply({
						content: `Page ${currentPage + 1} of ${embeds.length}`,
						embeds: [embeds[page]],
						components: [actionRow1, actionRow2]
					});
				}
				break;
		}

		try {
			await button.deferUpdate();
		} catch (e) {
			// Ignore
		}

		// Update the page
		let actionRow1 = new Builders.ActionRowBuilder();
		let actionRow2 = new Builders.ActionRowBuilder();
		for (let i = 0; i < row1.length; i++) {
			// Copy the button into a new button
			let button = new Builders.ButtonBuilder()
				.setCustomId(row1[i].data.custom_id)
				.setStyle(row1[i].data.style)
				.setEmoji(row1[i].data.emoji)
			if (currentPage === 0 && (i === 0 || i === 1)) {
				button.setDisabled(true);
			}
			if (currentPage === embeds.length - 1 && (i === 4)) {
				button.setDisabled(true);
			}
			actionRow1.addComponents([button]);
		}
		for (let i = 0; i < row2.length; i++) {
			actionRow2.addComponents([row2[i]]);
		}

		// Send the new page
		await modal.editReply({
			content: `Page ${currentPage + 1} of ${embeds.length}`,
			embeds: [embeds[currentPage]],
			components: [actionRow1, actionRow2]
		});
	});

	collector.on('end', async (collected, reason) => {
		// If message was deleted, do nothing
		try {
			// Create a new action row, but with all buttons disabled
			let actionRow1 = new Builders.ActionRowBuilder();
			let actionRow2 = new Builders.ActionRowBuilder();
			for (let i = 0; i < row1.length; i++) {
				// Copy the button into a new button
				let button = new Builders.ButtonBuilder()
					.setCustomId(row1[i].data.custom_id)
					.setStyle(row1[i].data.style)
					.setEmoji(row1[i].data.emoji)
					.setDisabled(true);
				actionRow1.addComponents([button]);
			}
			for (let i = 0; i < row2.length; i++) {
				actionRow2.addComponents([button.setDisabled(true)]);
			}

			// Send the new page
			await modal.editReply({
				content: `Page ${page + 1} of ${embeds.length}`,
				embeds: [embeds[page]],
				components: [actionRow1, actionRow2]
			});
		} catch (e) {
			// Do nothing since message was deleted
		}
	});
}
