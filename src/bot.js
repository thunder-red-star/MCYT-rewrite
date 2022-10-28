// Bot code for each shard of MCYT rewrite
import "./utils/logger/ignoreTerminalSpam.js";

import * as Discord from 'discord.js';
import Logger from './utils/logger/index.js';
import fs from 'fs';
import path from 'path';
import {__} from "./utils/polyfill/__.js";
import Database from "./database/index.js";
import commandLoader from "./commands/index.js";
import eventHandler from './events/handler.js';
const { __filename, __dirname } = __(import.meta);

global.logger = new Logger(path.join(__dirname, 'logs'));
global.config = JSON.parse(fs.readFileSync(path.join(__dirname, 'config', 'config.json'), 'utf8'));
global.database = new Database(global.config.mongodbConnectionString);

global.database.connect();

// Create client
const client = new Discord.Client({
	intents: new Discord.IntentsBitField(3276541),
	partials: ['MESSAGE', 'CHANNEL', 'REACTION', "GUILD_MEMBER", "GUILD"],
	allowedMentions: { parse: ['users', 'roles'], repliedUser: true },
})

// Load events
eventHandler(client, Discord);
// Load commands
commandLoader(client, Discord);

// Login
client.login(config.token);

// Log unhandled promise rejections
process.on('unhandledRejection', (err) => {
	global.logger.error(`[${client.shard.ids[0] + 1}] Bot encountered an unhandled promise rejection`);
	console.error(err.stack);
});

// Log uncaught exceptions
process.on('uncaughtException', (err) => {
	global.logger.error(`[${client.shard.ids[0] + 1}] Bot encountered an uncaught exception`);
	global.logger.logRaw(err.stack);
});