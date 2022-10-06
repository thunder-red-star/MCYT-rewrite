import GuildSchema from "../schemas/Guild.js";

/**
 * Delete a guild from the database
 * @param id {Number} The ID of the guild to delete
 */
export default function (id) {
	return GuildSchema.deleteOne({ _id: id });
}