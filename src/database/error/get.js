import ErrorSchema from "../schemas/Error.js";

export default {
	/**
	 * Get an error from the database
	 * @param query {Object} The query to search for
	 * @returns {Object} The error object
	 */
	by: (query) => {
		if (query.multiple) {
			delete query.multiple;
			return ErrorSchema.find(query);
		} else {
			delete query.multiple;
			return ErrorSchema.findOne(query);
		}
	},

	one: (id) => {
		return ErrorSchema.findOne({ _id: id });
	},

	all: () => {
		// Get all errors
		return ErrorSchema.find({});
	}
}