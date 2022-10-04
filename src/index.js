// Index.js for MCYT Bot rewrite
// Creates shard manager and runs bot from bot.js.

import { ShardingManager } from 'discord.js';
import { token } from './config/config.json';
import Logger from './util/logger/index.cjs';
import fs from 'fs';
import path from 'path';

// Dirname polyfill
const __dirname = new URL('.', import.meta.url).pathname;

global.logger = new Logger(path.join(__dirname, 'logs'));

const manager = new ShardingManager('./bot.js', { token: token });

manager.on('shardCreate', (shard) => logger.info(`Launched shard ${shard.id}`));
