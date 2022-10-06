import GuildSchema from "../schemas/Guild.js";

/**
 * Create a guild in the database
 * @returns {Object} The guild object
 * @param id {Number} The ID of the guild
 * @param prefix {String} The prefix of the guild
 */
export default function create (id, prefix) {
	return GuildSchema.create({
		_id: id,
		prefix: prefix
	});
}