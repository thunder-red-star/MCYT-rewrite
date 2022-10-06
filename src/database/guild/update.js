import GuildSchema from "../schemas/Guild.js";

export default {
	/**
	 * Update a guild in the database
	 * @param id {Number} The ID of the guild
	 * @param update {Object} The update to make
	 * @returns {Object} The guild object
	 */
	by: (id, update) => {
		let newGuildObject = {
			_id: id,
			...update
		}
		return GuildSchema.findOneAndUpdate({ _id: id }, newGuildObject);
	}
}