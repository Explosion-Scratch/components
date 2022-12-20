<script>
	export let left = 100;
	export let top = 100;
	
	let moving = false;
	
	function onMouseDown(e) {
		if (e.target.closest('.content')){return}
		moving = true;
	}
	
	function onMouseMove(e) {
		if (e.target.closest('.content')){return}
		if (moving) {
			left += e.movementX;
			top += e.movementY;
		}
	}
	
	function onMouseUp(e) {
		if (e.target.closest('.content')){return}
		moving = false;
	}
	
// 	$: console.log(moving);
</script>

<style>
	.draggable {
		border: solid 1px gray;
		position: absolute;
	}
	.drag {user-select: none;
		cursor: move;}
</style>

<section on:mousedown={onMouseDown} style="left: {left}px; top: {top}px;" class="draggable">
	<div class="drag"><slot name="draggable"></slot></div>
	<div class="content"><slot name="content"></slot></div>
</section>

<svelte:window on:mouseup={onMouseUp} on:mousemove={onMouseMove} />
