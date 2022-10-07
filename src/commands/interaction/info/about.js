import * as Builders from '@discordjs/builders';

function turnArrayIntoSentence(array) {
	let sentence = "";
	if (array.length === 1) {
		sentence = array[0];
	} else {
		for (let i = 0; i < array.length; i++) {
			if (i === array.length - 1) {
				sentence += `and ${array[i]}`;
			} else {
				sentence += `${array[i]}, `;
			}
		}
	}
	return sentence;
}

export default {
	name: "about",
	enabled: true,
	ownerOnly: false,
	guildOnly: false,
	shortDescription: "About the bot",
	longDescription: "Sends an embed with information and background about the bot.",
	arguments: [],
	botPermissions: ["SEND_MESSAGES", "EMBED_LINKS"],
	userPermissions: [],
	cooldown: 5_000,
	execute: async function (interaction, client, args, Discord) {
		let embed = new Builders.EmbedBuilder()
			.setColor(global.config.colors.default)
			.setTitle("About")
			.setDescription(`MCYT Bot was originally created by ${turnArrayIntoSentence(global.config.owners.map(owner => `<@${owner}>`))} in 2021. It was originally created because of the owner's need to read fanfiction of AO3 when his parents blocked the site. Since then, it has received a lot of updates and improvements.`)
			.addFields([{
				name: "Rewrite info",
				value: `This bot was already written in Discord.js v12, but is currently being rewritten in v14 this year.`

			}]);

		await interaction.reply({embeds: [embed]});
	}


}