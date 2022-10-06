// Database library for MCYT Rewrite

import mongoose from 'mongoose';

import GuildGet from './guild/get.js';
import GuildCreate from './guild/create.js';
import GuildDelete from './guild/delete.js';
import GuildUpdate from './guild/update.js';

import ErrorGet from './error/get.js';
import ErrorCreate from './error/create.js';
import ErrorDelete from './error/delete.js';
import ErrorUpdate from './error/update.js';

class Database {
	constructor(connectionString) {
		this.connectionString = connectionString;
		this.connection = mongoose.connection;

		this.guild = {
			get: GuildGet,
			create: GuildCreate,
			delete: GuildDelete,
			update: GuildUpdate
		}

		this.error = {
			get: ErrorGet,
			create: ErrorCreate,
			delete: ErrorDelete,
			update: ErrorUpdate
		}
	}

	async connect() {
		await mongoose.connect(this.connectionString, {
			useNewUrlParser: true, useUnifiedTopology: true
		});

		this.connection.once('open', () => {
			global.logger.info("Database connection established");
		});

		this.connection.on('disconnected', () => {
			global.logger.warn("Database connection lost, attempting to reconnect");
			this.connect();
		});
	}

	async disconnect() {
		await mongoose.disconnect();

		this.connection.on('disconnected', () => {
			global.logger.info("Database connection closed");
		});
	}
}

export default Database;