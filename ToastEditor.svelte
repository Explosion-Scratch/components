<script>
	import {onMount} from "svelte";
	let editor, container;
	export const getContent = () => {
		return {editor, container, content: editor.getHTML()}
	}
	export const getEditor = () => {
		return editor;
	}
	onMount(() => {
		editor = new toastui.Editor({
			el: container,
			previewStyle: "none",
			height: `${window.innerHeight}px`,
			initialValue: "# Hello world\n\n_This_ is **markdown**",
			usageStatistics: false,
			initialEditType: "markdown",
			placeholder: "Type some markdown here...",
			extendedAutolinks: true,
			hideModeSwitch: true,
			frontMatter: true,
			toolbarItems: [],
			autofocus: false,
			previewStyle: "tab"
		});
		container.querySelector(".toastui-editor-toolbar").remove();
	})
	function getTopics(){
		topics = html2text(getEl(editor.getHTML())).trim().replace(/[^a-z0-9 ]/ig, "").split(" ")
	}
	function getEl(html){
		return new DOMParser().parseFromString(`<div>${html}</div>`, "text/html").querySelector("div");
	}
	function html2text(el, getText, joiner = " "){
    if (["SCRIPT", "STYLE", "HEAD"].includes(el.tagName)){return joiner}
    if (!getText){
        getText = (a) => a.innerText ? (" " + a.innerText + " ") : joiner;
    }
    return (el.children?.length ? [...el.children].map((a) => html2text(a, getText, joiner)).join(joiner) : getText(el)).replace(/\s+/g, " ")
}
	function resize(){
		editor.setHeight(`${window.innerHeight}px`);
	}
</script>
<svelte:window on:resize={resize}></svelte:window>
<div bind:this={container}></div>
<svelte:head>
	<link
    rel="stylesheet"
    href="https://uicdn.toast.com/editor/latest/toastui-editor.min.css"
  />
	<script src="https://uicdn.toast.com/editor/latest/toastui-editor-all.min.js"></script>
</svelte:head>