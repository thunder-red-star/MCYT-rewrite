import * as Builders from "@discordjs/builders";
import Turndown from "turndown";
import AO3 from "ao3";

const turndownService = new Turndown();

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

function generateBlankButton() {
	return new Builders.ButtonBuilder()
		.setCustomId(Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15))
		.setStyle(2)
		.setLabel("\u200b")
		.setDisabled(true);
}

let row1 = [
	firstButton,
	leftButton,
	searchButton,
	rightButton,
	lastButton
]

let row2 = [
	generateBlankButton(),
	generateBlankButton(),
	stopButton,
	generateBlankButton(),
	generateBlankButton()
]

let tagsToEmojis = {
	"Not Rated": "no_tags",
	"General Audiences": "general_audiences",
	"Teen And Up Audiences": "teen_and_up",
	"Mature": "mature",
	"Explicit": "explicit",
	"F/M": "female_male",
	"F/F": "female_female",
	"Gen": "no_relationships",
	"M/M": "male_male",
	"Multi": "multiple_relationships",
	"Other": "no_tags"
}

function buildAO3Emoji(emojiName) {
	return global.config.emojis.ao3[emojiName] ? "<:" + emojiName + ":" + global.config.emojis.ao3[emojiName] + ">" : null;
}

export default async function(interaction, work) {
	let embeds = [];
	await work.reload(false);
	await work.loadChapters(false);
	let author = work.authors[0];
	await author.reload();
	// Build title page embed.
	let authorObject = {
		name: author.name,
		url: author.url,
	}
	if (author.avatar && author.avatar !== "/images/skins/iconsets/default/icon_user.png") {
		authorObject.icon_url = author.avatar;
	}
	let titleEmbed = new Builders.EmbedBuilder()
		.setTitle(work.title)
		.setURL(work.url)
		.setColor(global.config.colors.default)
		.setTimestamp()
		.setAuthor(authorObject);
	// Build a field that contains the four icons for content rating, relationship, content warnings, and work status.
	let icons = [];
	if (work.ratings) {
		icons.push(buildAO3Emoji(tagsToEmojis[work.ratings[0]]));
	}
	if (work.categories && work.categories.length > 0) {
		icons.push(buildAO3Emoji(tagsToEmojis[work.categories[0]]));
	} else {
		icons.push(buildAO3Emoji("no_relationships"));
	}
	if (work.warnings) {
		// If No Archive Warnings Apply, add "no_tags" emoji.
		if (work.warnings.length === 1 && work.warnings[0] === "No Archive Warnings Apply") {
			icons.push(buildAO3Emoji("no_tags"));
		}
		// If Creator Chose Not To Use Archive Warnings, add "maybe_warnings" emoji.
		else if (work.warnings.length === 1 && work.warnings[0] === "Creator Chose Not To Use Archive Warnings") {
			icons.push(buildAO3Emoji("maybe_warnings"));
		}
		// If there are warnings, add "warnings" emoji.
		else {
			icons.push(buildAO3Emoji("warnings"));
		}
	}
	if (work.status) {
		// If work.status is "Completed", add "work_complete" emoji.
		if (work.status === "Completed") {
			icons.push(buildAO3Emoji("work_complete"));
		} else {
			icons.push(buildAO3Emoji("work_in_progress"));
		}
	}
	titleEmbed.addFields([{
		name: "Tags",
		value: icons.slice(0, 2).join("") + "\n" + icons.slice(2, 4).join(""),
		inline: true
	}]);
	titleEmbed.setDescription(work.summary);
	// Build a field that contains the number of chapters, words
	let contentStats = [];
	if (work.nChapters) {
		contentStats.push(work.nChapters + " chapters");
	}
	if (work.wordCount) {
		contentStats.push(work.wordCount + " words");
	}
	titleEmbed.addFields([{
		name: "Content Stats",
		value: contentStats.join("\n"),
		inline: true
	}]);
	// Build a field that contains the number of kudos, bookmarks, and hits.
	let stats = [];
	if (work.kudos) {
		stats.push(work.kudos + " kudos");
	}
	if (work.bookmarks) {
		stats.push(work.bookmarks + " bookmarks");
	}
	if (work.hits) {
		stats.push(work.hits + " hits");
	}
	titleEmbed.addFields([{
		name: "Stats",
		value: stats.join("\n"),
		inline: true
	}]);
	// Add the title embed to the embeds array.
	embeds.push(titleEmbed);

	let currentPage = 0;
	let nChaptersLoaded = 0;
	let pagesTotal = 1;

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
		if (page === embeds.length - 1 && (i === 4)) {
			button.setDisabled(true);
		}
		actionRow1.addComponents([button]);
	}
	for (let i = 0; i < row2.length; i++) {
		actionRow2.addComponents([row2[i]]);
	}

	// Create message
	let message = await interaction.editReply({
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
				await interaction.deleteReply();
				return;
			case 'right':
				currentPage++;
				if (currentPage > pagesTotal - 1) {
					// Load next 20 results
					await button.deferUpdate();
					// Load next chapter
					if (nChaptersLoaded < work.nChapters) {
						let nextChapter = work.chapters[nChaptersLoaded];
						await nextChapter.reload();
						nChaptersLoaded++;
						// Now build embeds for the chapter. The first embed will have the title and summary.
						let chapterEmbed = new Builders.EmbedBuilder()
							.setTitle(nextChapter.title)
							.setDescription(nextChapter.summary ? (nextChapter.summary.length > 2000 ? nextChapter.summary.substring(0, 2000) + "..." : nextChapter.summary) : "No summary available.")
							.setFooter({
								text: `Chapter ${nChaptersLoaded} of ${work.nChapters}`
							})
							.setColor(global.config.colors.default)
						embeds.push(chapterEmbed);
						// Now build embeds for the chapter content. We'll replace \n\n with \n, then split on \n.
						let chapterContent = nextChapter.text.replace(/\n\n/g, "\n").split("\n");
						// Now we'll build embeds for the chapter content. Each embed can only store 2048 characters in the description.
						// What we'll do is add paragraphs to the embed, check if adding the next paragraph will exceed 2048 characters, and if it does, we'll push the embed to the embeds array.
						let nParagraphs = 0;
						while (nParagraphs < chapterContent.length) {
							let currentTextLength = 0;
							let paragraph = turndownService.turndown(chapterContent[nParagraphs]);
							let currentText = paragraph;
							let paragraphEmbed = new Builders.EmbedBuilder()
								.setTitle(nextChapter.title)
								.setColor(global.config.colors.default)
								.setFooter({
									text: `Chapter ${nChaptersLoaded} of ${work.nChapters}`
								})
							while (currentText.length + paragraph.length < 2048) {
								paragraphEmbed.setDescription(currentText);
								nParagraphs++;
								if (nParagraphs < chapterContent.length) {
									paragraph = chapterContent[nParagraphs];
									currentText += "\n\n" + turndownService.turndown(paragraph);
								}
								else {
									break;
								}
							}
							embeds.push(paragraphEmbed);
						}
					}
					// Update the total number of pages
					pagesTotal = embeds.length;
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
							if (embeds[i].data.description.toLowerCase().includes(query) || embeds[i].title.toLowerCase().includes(query)) {
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
					await interaction.editReply({
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
		await interaction.editReply({
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
			await interaction.editReply({
				content: `Page ${page + 1} of ${embeds.length}`,
				embeds: [embeds[page]],
				components: [actionRow1, actionRow2]
			});
		} catch (e) {
			// Do nothing since message was deleted
		}
	});
}