<script>
  import {onMount} from "svelte";
  export let link = "";
  let m, title, description, img, img_el;
  onMount(async () => {
  	m = await meta(link);
  	m = parseMeta(m);
  	title = m.title;
  	description = m.description;
  	img = m.image;
  })
  function parseMeta(m) {
  	return {
  		image: m ?.og ?.image || m["twitter:image:src"] || m.image,
  		title: m.title || m ?.twitter ?.title || m ?.og ?.title || m ?.og ?.site_name,
  		description: m.description || m ?.og ?.description || m ?.twitter ?.description,
  		image_alt: m ?.og ?.["image:alt"],
  		color: m["theme-color"],
  		icon: (m.icon || m.favicon || m["alternate icon"] || m["shortcut icon"] || m["alternate-icon"] || m["shortcut icon"] || m["fluid-icon"])?.replace(window.location)
  	}
  }
  async function meta(url) {
  	//Parse HTML as a document element
  	var parser = new DOMParser();
  	var html = window.html = parser.parseFromString(await fetch(`https://cors.explosionscratc.repl.co/${url.split("//")[1]}`).then(res => res.text()), 'text/html');
  	var base = document.createElement("base");
  	// Prevent relative links linking to the current domain
  	// https://stackoverflow.com/a/56025841/14197829
  	base.href = new URL(url).origin
  	html.head.appendChild(base)

  	//Create objects for meta tags that are in the form "og:url", "twitter:image_src" etc
  	var out = {};
  	if (html.querySelector("title")) {
  		out.title = html.querySelector("title").innerText;
  	}
  	[...html.querySelectorAll("meta[property], meta[name]")].filter(i => /^[^:]+:[^:]+/.test(i.getAttribute("property") || i.getAttribute("name"))).map(i => {
  		var m = (i.getAttribute("property") || i.getAttribute("name")).match(/^([^:]+):(.+)/);
  		out[m[1]] = out[m[1]] || {};
  		out[m[1]][m[2]] = i.getAttribute("content");
  	});
  	return {
  		//Other meta tags and link tags
  		...Object.fromEntries([
  			...[...html.querySelectorAll("link")].map((i) => [i.rel, i.href]),
  			...[...html.querySelectorAll("meta[name], meta[value]")].map((i) => [
  				i.name,
  				i.getAttribute("content") || i.getAttribute("value"),
  			]),
  		]),
  		...out,
  	};
  }
  function slice(text, words){
  	return text.split(" ").slice(0, words).length === words ? text.split(" ").slice(0, words).join(" ") + "..." : text
  }
  function handleError(){
  	if (img_el.src.startsWith("https://cors.explosionscratc.repl.co")){
  		console.log("Already cors");
  		img = null;
  	} else {
  		console.log(img_el)
  		return img = `https://cors.explosionscratc.repl.co/${img_el.src.split("//")[1]}`
  	}
  }

</script>
<div class="link_preview">
  {#if title && link}
    {#if img}
  		<div class='img'>
  			<img src={img} on:error={handleError} bind:this={img_el}/>	
  		</div>
  	{/if}
  	<div class="right">
  		<h3>
  			<img src={`https://www.google.com/s2/favicons?domain=${new URL(link).hostname}`}/> {slice(title, 6)}
  		</h3>
  		<div class="description">
  			{description ? slice(description, 15) : link}
  		</div><br>
  		<a href={link} class="visit">
  			Visit
  		</a>
  	</div>
  {:else}
  	<div class="loading">
  		Loading...
  	</div>
  {/if}
</div>
<style lang="scss">
  * {
  	box-sizing: border-box;
  }
  .link_preview {
  	margin: 15px auto;
  	display: flex;
  	width: 100%;
  	border-radius: 5px;
  	overflow: hidden;
  	box-shadow: 3px 2px 10px -5px #0004;
  }
  .img {
  	display: block;
  	flex: 1;
}
  .img img {
  	width: 100%;
  	height: 100%;
  	object-fit: cover;
  }
  .right {
  	flex: 2;
  	padding: 10px;
  	color: #333;
  	padding-bottom: 20px;
  }
  .right .description {
  	color: #555;
  }
  .right .visit {
  	width: fit-content;
  	display: block;
  	text-decoration: none;
  	padding: 6px 15px;
  	border-radius: 5px;
  	background: transparent;
  	border: 2px solid lightseagreen;
  	color: #066;
  }
  .right .visit:hover {
    box-shadow: 0 0 0 2px #0bb4;
  }
  @media (max-width: 400px){
  	.link_preview {
  		flex-direction: column;
  		box-shadow: 1px 2px 10px -5px #0009;
  	}
  	.link_preview .right .visit {
  		width: 100%;
  		padding: 10px;
  		border-radius: 6px;
  		text-align: center;
  		background: lightseagreen;
  		color: white;
  	}
  }
</style>
