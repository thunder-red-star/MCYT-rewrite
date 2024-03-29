// Message command paginator (use buttons)

import * as Builders from "@discordjs/builders";

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

export default async function(message, pages) {
	// Message should be a Discord.Message
	// Pages should be an array of Discord.Embeds or Builders.Embed
	let titles = [];
	for (let i = 0; i < pages.length; i++) {
		titles.push(pages[i].data.title || null);
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
		if (page === pages.length - 1 && (i === 3 || i === 4)) {
			button.setDisabled(true);
		}
		actionRow1.addComponents([button]);
	}
	for (let i = 0; i < row2.length; i++) {
		actionRow2.addComponents([row2[i]]);
	}

	// Send the page with the array of buttons
	let msg = await message.reply({
		content: "Loading...",
	})


	// Send the first page
	await msg.edit({
		content: `Page ${page + 1} of ${pages.length}`,
		embeds: [pages[page]],
		components: [actionRow1, actionRow2]
	});

	// Create the button collector
	const filter = (button) => {
		button.user.id === message.author.id;
	};

	const collector = await msg.createMessageComponentCollector(filter, {
		filter,
		timeout: 60000
	});

	// Add the button collector event listeners
	collector.on('collect', async (button) => {
		if (button.user.id !== message.author.id) return;
		collector.resetTimer();
		switch (button.customId) {
			case 'first':
				page = 0;
				break;
			case 'left':
				if (page > 0) {
					page--;
				}
				break;
			case 'delete':
				msg.delete();
				return;
			case 'right':
				if (page < pages.length - 1) {
					page++;
				}
				break;
			case 'last':
				page = pages.length - 1;
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
				let modalSubmission = await button.awaitModalSubmit({ time: 15_000, max: 1 });
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
						// Search for the title
						let found = false;
						for (let i = 0; i < titles.length; i++) {
							if (titles[i].toLowerCase().includes(input.toLowerCase())) {
								page = i;
								found = true;
								break;
							}
						}
						if (!found) {
							await modalSubmission.reply({
								content: "No pages found",
								ephemeral: true
							});
							return;
						}
					} else {
						// Search for the page number
						if (input > pages.length || input < 1) {
							await modalSubmission.reply({
								content: "No pages found",
								ephemeral: true
							});
							return;
						}
						page = input - 1;
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
						if (page === 0 && (i === 0 || i === 1)) {
							button.setDisabled(true);
						}
						if (page === pages.length - 1 && (i === 3 || i === 4)) {
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
					await msg.edit({
						content: `Page ${page + 1} of ${pages.length}`,
						embeds: [pages[page]],
						components: [actionRow1, actionRow2]
					});
				}
				break;
		}

		try {
			await button.deferUpdate();
		} catch (e) {
			// Ignore as we just searched for a page
		}

		// Reset the timeout
		collector.resetTimer();

		let actionRow1 = new Builders.ActionRowBuilder();
		let actionRow2 = new Builders.ActionRowBuilder();
		for (let i = 0; i < row1.length; i++) {
			// Copy the button into a new button
			let button = new Builders.ButtonBuilder()
				.setCustomId(row1[i].data.custom_id)
				.setStyle(row1[i].data.style)
				.setEmoji(row1[i].data.emoji)
			if (page === 0 && (i === 0 || i === 1)) {
				button.setDisabled(true);
			}
			if (page === pages.length - 1 && (i === 3 || i === 4)) {
				button.setDisabled(true);
			}
			actionRow1.addComponents([button]);
		}
		for (let i = 0; i < row2.length; i++) {
			actionRow2.addComponents([row2[i]]);
		}

		// Send the new page
		await msg.edit({
			content: `Page ${page + 1} of ${pages.length}`,
			embeds: [pages[page]],
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
			await msg.edit({
				content: `Page ${page + 1} of ${pages.length}`,
				embeds: [pages[page]],
				components: [actionRow1, actionRow2]
			});
		} catch (e) {
			// Do nothing since message was deleted
		}
	});

	return msg;
}