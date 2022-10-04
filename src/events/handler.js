import fs	from 'fs';
import path	from 'path';
import {__} from "../utils/polyfill/__.js";
const { __filename, __dirname } = __(import.meta);

// Event handler function
export default async function (client, Discord) {
	// Find all files in this folder
	const eventFiles = fs.readdirSync(__dirname).filter(file => file.endsWith('.js'));

	// Loop through all files, ignoring this file
	for (const file of eventFiles) {
		if (file !== 'handler.js') {
			// Import the event
			const event = await import("./" + file);

			// Get the event name
			const eventName = file.split('.')[0];

			// Add the event to the client
			client.on(eventName, (...args) => {
				global.logger.debug(`Event ${eventName} triggered`);
				event.default(client, Discord, ...args);
			});
		}
	}
}