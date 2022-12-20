<script>
  /*
  Example items:
  
  Supports type of divider, select, and shortcut. Feel free to add more. This provides a nice template for a custom context menu.
  
  let items = [
		{
			id: "display",
			type: "select",
			options: [
				{
					label: "Bullets",
					id: "bullets",
					icon: `<svg width="32" height="32" viewBox="0 0 256 256"><path fill="currentColor" d="M82 64a6 6 0 0 1 6-6h128a6 6 0 0 1 0 12H88a6 6 0 0 1-6-6Zm134 58H88a6 6 0 0 0 0 12h128a6 6 0 0 0 0-12Zm0 64H88a6 6 0 0 0 0 12h128a6 6 0 0 0 0-12ZM44 54a10 10 0 1 0 10 10a10 10 0 0 0-10-10Zm0 128a10 10 0 1 0 10 10a10 10 0 0 0-10-10Zm0-64a10 10 0 1 0 10 10a10 10 0 0 0-10-10Z"/></svg>`,
				},
				{
					label: "TODO", 
					id: "todo",
					icon: `<svg width="32" height="32" viewBox="0 0 256 256"><path fill="currentColor" d="M222 128a6 6 0 0 1-6 6h-88a6 6 0 0 1 0-12h88a6 6 0 0 1 6 6Zm-94-58h88a6 6 0 0 0 0-12h-88a6 6 0 0 0 0 12Zm88 116h-88a6 6 0 0 0 0 12h88a6 6 0 0 0 0-12ZM87.9 43.6L57.3 71.8L44.1 59.6a6 6 0 0 0-8.2 8.8l17.4 16a5.7 5.7 0 0 0 4 1.6a5.7 5.7 0 0 0 4.1-1.6l34.7-32a6 6 0 1 0-8.2-8.8Zm0 64l-30.6 28.2l-13.2-12.2a6 6 0 0 0-8.2 8.8l17.4 16a5.7 5.7 0 0 0 4 1.6a5.7 5.7 0 0 0 4.1-1.6l34.7-32a6 6 0 1 0-8.2-8.8Zm0 64l-30.6 28.2l-13.2-12.2a6 6 0 0 0-8.2 8.8l17.4 16a5.7 5.7 0 0 0 4 1.6a5.7 5.7 0 0 0 4.1-1.6l34.7-32a6 6 0 1 0-8.2-8.8Z"/></svg>`,
				}
			],
		},
		{
			type: "divider",
		},
		{
			type: "shortcut",
			label: "Complete",
			shortcut: "Control + Enter",
			icon: `<svg width="32" height="32" viewBox="0 0 256 256"><path fill="currentColor" d="M104 190a5.8 5.8 0 0 1-4.2-1.8l-56-56a5.9 5.9 0 0 1 8.4-8.4l51.8 51.7L211.8 67.8a5.9 5.9 0 0 1 8.4 8.4l-112 112a5.8 5.8 0 0 1-4.2 1.8Z"/></svg>`,
		}
	]
  */
	import { backOut } from 'svelte/easing';

	import {createEventDispatcher} from "svelte";
	const dispatch = createEventDispatcher();
	export let items = [];
	let selectEls = [];
	let selectValues = [];
	export let position = {
		type: "relative",
		x: 0,
		y: 0,
	}
	
	function fadescale(node, { duration }) {
		return {
			duration,
			css: t => {
				const eased = backOut(t);
				let amt = 3
				return `
					transform: scale(${eased / amt + (1 / amt) * (amt - 1)});
					opacity: ${eased}`
			}
		};
	}
</script>

<div style:position={position.type} style:top={position.y + "px"} style:left={position.x + "px"} class="menu" transition:fadescale={{duration: 500}}>
	{#each items as item,idx}
		<div class="item {item.type}" on:click={() => {
				if (item.type === 'select'){return}
				dispatch("click", item)
			}}>
			{#if item.type === 'select'}
				{#if selectValues[idx]}
					{@const icon = items[idx].options.find(i => i.id === selectValues[idx]).icon}
					{#if icon}<div class="icon">{@html icon}</div>{/if}
				{/if}
				<select bind:this={selectEls[idx]} bind:value={selectValues[idx]} on:change={() => dispatch("click", {type: 'selectchange', value: selectValues[idx], element: selectEls[idx], ...item})}>
					{#each item.options as opt}
						<option value={opt.id}>
							{opt.label}
						</option>
					{/each}
				</select>
			{:else if item.type === 'shortcut'}
				{#if item.icon}<div class="icon">{@html item.icon}</div>{/if}
				<span class="label">{item.label}</span>
				<span class="shortcut">{item.shortcut}</span>
			{/if}
		</div>
	{/each}
</div>
<style>
	.menu {
		font-size: 13px;
		padding: .3em 0;
		box-shadow: rgba(100, 100, 111, 0.2) 0px 7px 10px 0px;
		border: 2px solid #eee;
		color: #777;
		border-radius: .4em;
		display: flex;
		height: fit-content;
		flex-direction: column;
		max-width: 500px;
		min-width: 240px;
	}
	.item {
		padding: .1rem 1rem;
		display: flex;
		align-items: center;
		justify-content: space-between;
	}
	select {
		margin: 0;
		flex: 1;
		color: inherit;
		border: none;
		background: transparent;
		height: 100%;
		padding: 0;
	}
	.divider {
		display: block;
		padding: 1px;
		flex: 1;
		background: #eaeaea;
	}
	.icon :global(svg){
		width: 2ch;
		height: 2h;
	}
	.icon {
		margin-right: 5px;
		display: grid;
		place-items: center;
	}
	.label {
		flex: 1;
		margin-left: 3px;
	}
	.shortcut:not(.item) {
		opacity: .5;
	}
	:root {
		--accent: #49baf2;
	}
	.item {
		user-select: none;
		cursor: pointer;
	}
	.item:hover {
		background: var(--accent);
		color: white;
	}
	.item:hover option{
		color: #777;
	}
	*:focus {
		outline: none;
	}
</style>
