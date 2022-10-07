import ErrorSchema from "../schemas/Error.js";

export default function create (options = {}) {
	return ErrorSchema.create(options);
}