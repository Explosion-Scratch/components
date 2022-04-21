<script>
	export let icon = '';
	export let fill = 'currentColor';
	(async () => {
		if (!icon) {
			return (icon = '');
		}
		icon = await fetch(`https://api.iconify.design/${icon}.svg?color=${encodeURIComponent(fill)}`)
			.then((res) => res.text())
			.catch(() => {
				icon = '';
			});
		if (!icon?.startsWith('<svg')) {
			icon = '';
		}
	})();
</script>

{@html icon}
