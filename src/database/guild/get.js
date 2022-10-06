import GuildSchema from "../schemas/Guild.js";

export default {
	/**
	 * Get a guild from the database
	 * @param query {Object} The query to search for
	 * @returns {Object} The guild object
	 */
	by: (query) => {
		return GuildSchema.findOne(query);
	},

	one: (id) => {
		return GuildSchema.findOne({ _id: id });
	}
}