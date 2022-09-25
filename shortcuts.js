export default function (node, opts = {}){
	if (typeof opts === "string"){
		opts = {location: "anywhere", shortcut: opts, callback: () => node.click()};
	}
	
	opts = {
		location: "anywhere",
		shortcut: null,
		callback: () => node.click(),
		keys: {},
		destroy: () => {
			console.log("Destroying");
			listenerEl.removeEventListener("keydown", onkeydown);
			listenerEl.removeEventListener("keyup", onkeyup);
			listenerEl.removeEventListener("keypress", handler);
		},
		update: (opts) => {
			console.log("Updated")
			opts.destroy();
			this(node, opts);
		},
		...opts,
	}
	if (!opts.shortcut){
		return console.warn("No shortcut passed")
	}
	
	const onkeyup = set(false);
	const onkeydown = set(true);
	
	const handler = (e) => {
		let keys = [];
		if (Array.isArray(opts.shortcut)){
			keys = opts.shortcut.map(i => i.trim().toLowerCase());
		} else {
			keys = opts.shortcut.split("+").map(i => i.trim().toLowerCase());
		}
		const replacements = {
			"⌘": "Control",
			"⌥": "Alt",
			"⇧": "Shift",
		}
		keys = keys.map(i => replacements[i] || i);
		opts.keys.Alt = e.altKey;
		opts.keys.Shift = e.shiftKey;
		opts.keys.Control = e.ctrlKey || e.metaKey;
		opts.keys.Command = e.metaKey;
		opts.keys.Meta = e.metaKey;
		opts.keys = Object.fromEntries(Object.entries(opts.keys).map(i => [i[0].toLowerCase(), i[1]]))
		console.log("Before updating keys: ", Object.keys(opts.keys).filter(a => opts.keys[a]))
		if (keys.every(key => opts.keys[key])){
			opts.callback({event: e, keys: opts.keys, shortcut: opts.shortcut, opts, element: node})
		}
	}
	
	function debounce(n,t,u){var e;return function(){var i=this,o=arguments,a=function(){e=null,u||n.apply(i,o)},c=u&&!e;clearTimeout(e),e=setTimeout(a,t),c&&n.apply(i,o)}}
	
	function set(upordown){
		console.log(opts)
		return (e) => {
			//Fix shift errors, e.g. "Control+Shift+1" not working with "Control+Shift+!"
			if (e.code.includes("Digit")){
				opts.keys[e.code.replace("Digit", "")] = upordown;
			}
			opts.keys[e.key] = upordown;
		}
	}
	let listenerEl = (() => {
		if (typeof opts.location === "string" && opts.location.toLowerCase() === "anywhere"){
			return document.documentElement;
		}
		if (opts.location instanceof HTMLElement){
			return opts.location;
		}
		console.log(opts.location)
		throw new Error("Invalid location in shortcut helper")
	})();
	listenerEl.addEventListener("keydown", onkeydown);
	listenerEl.addEventListener("keyup", onkeyup);
	listenerEl.addEventListener("keypress", handler);
	
	return {
		destroy: opts.destroy,
	}
}