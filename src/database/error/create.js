import ErrorSchema from "../schemas/Error.js";

export default function create (guildId, channelId, messageId, userId, commandName, message, error, stack) {
	let newErrorObject = {
		guildId: guildId,
		channelId: channelId,
		messageId: messageId,
		userId: userId,
		commandName: commandName,
		message: message,
		error: error,
		stack: stack
	}
	return ErrorSchema.create(newErrorObject);
}