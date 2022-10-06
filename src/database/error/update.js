import ErrorSchema from "../schemas/Error.js";

export default {
	/**
	 * Update an error in the database
	 * @param id {Number} The ID of the guild
	 * @param update {Object} The update to make
	 * @returns {Object} The guild object
	 */
	by: (id, update) => {
		let newGuildObject = {
			_id: id,
			...update
		}
		return ErrorSchema.findOneAndUpdate({ _id: id }, newGuildObject, { upsert: true, new: true });
	}
}