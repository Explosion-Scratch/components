<script context="module">
	import {slide, fade} from "svelte/transition";
	
  // retain module scoped expansion state for each tree node
  const _expansionState = {
    /* treeNodeId: expanded <boolean> */
  };
	
	const combineTransitions = (...transitions) => {
		return (node, params) => {
			let o = [];
			for (const t of transitions){
				o.push(t(node, params));
			}
			return {
				css: (t) => o.map(i => i.css(t)).join(" "),
			};
		}
	}
	
	const slidefade = combineTransitions(slide, fade);
	
	export async function iterate(entries){
			let out = [];
			for await (let thing of entries){
					out.push(thing);
			}
			return out;
	}
</script>

<script>
  export let tree;
  let item = tree;
	let loaded = false, children, label;
	import {onMount} from "svelte";
	
	onMount(async () => {
		if (tree.children && tree.label){
			label = tree.label;
			children = tree.children;
		}
		if (Array.isArray(tree)){
			label = tree[0];
			if (tree[1] instanceof FileSystemDirectoryHandle){
				let entries = tree[1].entries();
				children = [];
				for await (let entry of entries){
					children = [entry, ...children]
				}
			} else {
				children = null;
			}
		}
		loaded = true;
	})
	
  import { createEventDispatcher } from "svelte";

  const dispatch = createEventDispatcher();

  export let expanded = _expansionState[label] || false;
  const toggleExpansion = () => {
    expanded = _expansionState[label] = !expanded;
  };
  $: arrowDown = expanded;
	
	function niceslice(thing, len = 15){
		if (thing.length > len){
			return thing.slice(0, len - 4) + "...";
		} else {
			return thing;
		}
	}
</script>
{#if loaded}
<ul {...$$props}>
  <li class:folder={children} transition:slidefade={{duration: 200}}>
    {#if children}
      <span on:click={toggleExpansion} class="item_entry">
        <span class="arrow" class:arrowDown>
          <slot name="expand" item={tree} open={arrowDown}>
            <span id="arrow">&#x25b6</span>
          </slot>
        </span>
        <slot item={tree} name="label">{niceslice(label)}</slot>
      </span>
      {#if expanded}
        {#each children as child}
          <svelte:self
            tree={child}
            on:message={(a) => dispatch("message", a.detail)}
            let:open={isopen}
            let:item={childitem}
          >
            <svelte:fragment slot="item_before"
              ><slot item={childitem} name="item_before"
                ><span class="no-arrow" /></slot
              ></svelte:fragment
            >
            <svelte:fragment slot="expand"
              ><slot item={childitem} open={isopen} name="expand"
                ><span id="arrow">&#x25b6</span></slot
              ></svelte:fragment
            >
            <svelte:fragment slot="label"
              ><slot item={childitem} name="label">{niceslice(Array.isArray(childitem) ? childitem[0] : childitem.label)}</slot
              ></svelte:fragment
            >
          </svelte:self>
        {/each}
      {/if}
    {:else}
      <span
        class="item_entry"
        on:click={() => dispatch("message", { type: "click", item: tree })}
      >
        <slot item={tree} name="item_before"><span class="no-arrow" /></slot>
        <slot item={tree} name="label">{niceslice(label)}</slot>
      </span>
    {/if}
  </li>
</ul>
{/if}

<style>
	ul {
		margin: 0;
		list-style: none;
		padding-left: 1.2rem; 
		user-select: none;
	}
	.no-arrow { padding-left: 1.0rem; }
	.arrow {
		cursor: pointer;
	}
	:global(#arrow){
		display: inline-block;
	}
	.item_entry {
		display: flex;
		align-items: center;
		height: 15px;
		padding: 5px;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	.item_entry :global(svg){
		width: 2ch;
		height: 2ch;
		display: inline-block;
		margin-right: 5px;
	}
	.item_entry:hover {
		background: #0001;
		cursor: pointer;
		border-radius: 3px;
	}
	.arrowDown :global(#arrow) { transform: rotate(90deg); }
</style>