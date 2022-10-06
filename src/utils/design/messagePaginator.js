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
		id: global.config.emojis.paginator.stop,
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

export default async function(message, pages) {
	// Message should be a Discord.Message
	// Pages should be an array of Discord.Embeds or Builders.Embed

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
				// Ask for the page number
				await button.reply({
					content: "What page do you want to go to? Send a number between 1 and " + pages.length + " or type `cancel` to cancel.",
				});
				// Await a message (don't use a message collector)
				let response = await message.channel.awaitMessages({
					filter: (m) => m.author.id === message.author.id,
				});

				// Check if the message is a number
				if (isNaN(response.first().content)) {
					if (response.first().content.toLowerCase() === "cancel") {
						await button.reply({
							content: "Cancelled.",
							ephemeral: true
						});
						return;
					}
					await button.reply({
						content: "That's not a number!",
						ephemeral: true
					});
					return;
				} else {
					// Check if the number is in range
					if (response.first().content > pages.length || response.first().content < 1) {
						await button.reply({
							content: "That number is out of range!",
							ephemeral: true
						});
						return;
					}
					// Set the page
					page = response.first().content - 1;
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