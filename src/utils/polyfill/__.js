export function __({ url = import.meta.url }) {
	const u = new URL(url);
	const f = u.protocol === 'file:' ? u.pathname : url;
	const d = f.replace(/[/][^/]*$/, '');
	return {
		d,
		f,
		dirname: d.split("").slice(1).join(""),
		filename: f.split("").slice(1).join(""),
		__dirname: d.split("").slice(1).join(""),
		__filename: f.split("").slice(1).join(""),
	};
}

export function dirname(meta) {
	return __(meta).__dirname;
}

export function filename(meta) {
	return __(meta).__filename;
}