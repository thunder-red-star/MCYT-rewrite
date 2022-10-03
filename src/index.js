// Index.js for MCYT Bot rewrite
// Creates shard manager and runs bot from bot.js.

import { ShardingManager } from 'discord.js';
import { token } from './config/config.json';

const manager = new ShardingManager('./bot.js', { token: token });

manager.on('shardCreate', ()