import mongoose from 'mongoose';
import MongooseLong from 'mongoose-long';
MongooseLong(mongoose);
const { Long } = mongoose.Schema.Types;

const ErrorSchema = new mongoose.Schema({
	guildId: {
		type: Long,
		required: true,
	},
	userId: {
		type: Long,
		required: true,
	},
	channelId: {
		type: Long,
		required: true,
	},
	messageId: {
		type: Long,
		required: true,
	},
	commandName: {
		type: String,
		required: true,
	},
	message: {
		type: String,
		required: true,
	},
	error: {
		type: String,
		required: true,
	},
	stack: {
		type: String,
		required: true,
	},
	time: {
		type: Date,
		default: Date.now,
	},
	status: {
		type: String,
		default: "open",
	}
});

export default mongoose.model('Error', ErrorSchema);