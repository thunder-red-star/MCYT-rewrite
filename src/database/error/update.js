import ErrorSchema from "../schemas/Error.js";

export default {
	/**
	 * Update an error in the database
	 * @param id {Number} The ID of the guild
	 * @param update {Object} The update to make
	 * @returns {Object} The guild object
	 */
	by: async (id, update) => {
		// Get old error object
		let oldErrorObject = await ErrorSchema.findOne({ _id: id });
		// Make new error object with old object and new update
		let newErrorObject = {};
		for (let key in oldErrorObject._doc) {
			newErrorObject[key] = oldErrorObject[key];
		}
		for (let key in update) {
			newErrorObject[key] = update[key];
		}
		// Update error in database
		return ErrorSchema.findOneAndUpdate({ _id: id }, newErrorObject, { upsert: true, new: true });
	}
}