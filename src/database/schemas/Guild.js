import mongoose from 'mongoose';
import MongooseLong from 'mongoose-long';
MongooseLong(mongoose);
const { Long } = mongoose.Schema.Types;
import fs from "fs";
import path from "path";

import {__} from "../../utils/polyfill/__.js";
const { __filename, __dirname } = __(import.meta);

const config = JSON.parse(fs.readFileSync(path.join(__dirname, '../..', 'config', 'config.json'), 'utf8'));

const GuildSchema = new mongoose.Schema({
	_id: {
		type: Long,
		required: true,
	},
	prefix: {
		type: String,
		default: config.prefix,
	}
});

export default mongoose.model('Guild', GuildSchema);