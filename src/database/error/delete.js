import ErrorSchema from "../schemas/Error.js";

/**
 * Delete an error from the database
 * @param id {Number} The ID of the guild to delete
 */
export default function (id) {
	return ErrorSchema.deleteOne({ _id: id });
}