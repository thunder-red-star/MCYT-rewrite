// Index.js for MCYT Bot rewrite
// Creates shard manager and runs bot from bot.js.
import "./utils/logger/ignoreTerminalSpam.js";

import { ShardingManager } from 'discord.js';
import Logger from './utils/logger/index.js';
import fs from 'fs';
import path from 'path';
import {__} from "./utils/polyfill/__.js";
const { __filename, __dirname } = __(import.meta);

// Open config file and parse it
const config = JSON.parse(fs.readFileSync(path.join(__dirname, 'config', 'config.json'), 'utf8'));

const manager = new ShardingManager(path.join(__dirname, 'bot.js'), {
	token: config.token,
	totalShards: config.shards,
});

manager.spawn({
	timeout: 30_000,
}).catch((err) => {
	console.error(err);
	process.exit(1);
});

// Log unhandled promise rejections
process.on('unhandledRejection', (err) => {
	console.error(err);
});