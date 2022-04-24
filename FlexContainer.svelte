<script>
	export let margin = true;
	export let direction = 'row';
</script>

<div id="flex_container" style:margin={margin ? `6rem 0` : ''} style:flexDirection={direction}>
	<slot />
</div>

<style>
	#flex_container {
    display: flex;
    width: 100%;
    justify-content: center;
    align-items: center;
	}
</style>
