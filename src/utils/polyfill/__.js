import os from 'node:os';

function deleteFirstChar(str) {
	return str.slice(1);
}

export function __({ url = import.meta.url }) {
	const u = new URL(url);
	const f = u.protocol === 'file:' ? u.pathname : url;
	const d = f.replace(/[/][^/]*$/, '');
	return {
		d,
		f,
		dirname: (os.platform() === 'win32' ? deleteFirstChar(d) : d),
		filename: (os.platform() === 'win32' ? deleteFirstChar(f) : f),
		__dirname: (os.platform() === 'win32' ? deleteFirstChar(d) : d),
		__filename: (os.platform() === 'win32' ? deleteFirstChar(f) : f),
	};
}

export function dirname(meta) {
	return __(meta).__dirname;
}

export function filename(meta) {
	return __(meta).__filename;
}