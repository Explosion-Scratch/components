<script>
  import { onMount } from "svelte";
  let editor, container;
  onMount(() => {
    editor = new EditorJS({
      holder: container,
      onReady: () => {
        new Undo({ editor });
      },
			onChange: (...a) => {
				console.log("Editor.js changed", ...a);
			},
      placeholder: "Write something!",
      tools: {
        list: {
          class: NestedList,
          inlineToolbar: true,
          config: {
            defaultStyle: "unordered",
          },
        },
        image: {
          class: ImageTool,
          config: {
            uploader: {
              uploadByUrl(url) {
                return {
                  success: 1,
                  file: {
                    url: url,
                  },
                };
              },
              uploadByFile(file) {
                //TODO: Use imgur
                return {
                  success: 1,
                  file: {
                    url: URL.createObjectURL(file),
                  },
                };
              },
            },
          },
        },
        linkTool: {
          class: LinkTool,
          config: {
            fetcher: {
              async fetchLinkDataForUrl(a) {
                let json = await fetch(
                  `https://apis.explosionscratc.repl.co/link-preview?q=${encodeURIComponent(
                    a
                  )}`
                ).then((r) => r.json());
                return {
                  success: 1,
                  meta: {
                    title: json.title,
                    description: json.description,
                    image: {
                      url: json.images[0],
                    },
                  },
                };
              },
            },
          },
        },
        table: Table,
        underline: Underline,
        inlineCode: {
          class: InlineCode,
          shortcut: "CMD+SHIFT+M",
        },
        code: editorjsCodeflask,
				header: {
					class: Header,
					shortcut: 'CMD+SHIFT+H',
					levels: [2, 3, 4],
				},
			}
    });
		window.editor = editor;
  });
	async function shortcuts(e){
		if (e.ctrlKey && e.altKey && e.code.startsWith("Digit")){
				let digit = parseInt(e.code.replace("Digit", ""), 10);
				console.log("Pressed: ", digit);
				const currentBlock = editor.blocks.getCurrentBlockIndex();
			  let content = await editor.save();
				content.blocks[currentBlock].type = "header";
				content.blocks[currentBlock].data = {...content.blocks[currentBlock].data, level: digit}
			  editor.render(content);
		}
	}
</script>

<svelte:head>
  <script src="https://cdn.jsdelivr.net/npm/@editorjs/editorjs@latest"></script>
  <script
    src="https://cdn.jsdelivr.net/npm/@editorjs/nested-list@latest"></script>
  <script src="https://cdn.jsdelivr.net/npm/@editorjs/image@2.3.0"></script>
  <script
    src="https://rawcdn.githack.com/AndersTornkvist/link/0c7ee59932cf04b3a822b6274c0da4de09dcd7e7/dist/bundle.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/@editorjs/table"></script>
  <script src="https://cdn.jsdelivr.net/npm/editorjs-undo"></script>
  <script
    src="https://cdn.jsdelivr.net/npm/@editorjs/underline@latest"></script>
  <script
    src="https://cdn.jsdelivr.net/npm/@editorjs/inline-code@latest"></script>
  <script src="https://cdn.jsdelivr.net/npm/@calumk/editorjs-codeflask"></script>
	<script src="https://cdn.jsdelivr.net/npm/@editorjs/header@latest"></script>
	<script src="https://cdn.jsdelivr.net/npm/editorjs-text-alignment-blocktune@latest"></script>
	<script src="https://unpkg.com/hotkeys-js/dist/hotkeys.min.js"></script>
</svelte:head>


<div class="editor" bind:this={container} on:keydown={shortcuts}/>

<style>
	.editor {
		border: 1px solid #ccc;
		width: 80vw;
		max-width: 500px;
		height: 80vh;
		max-height: 500px;
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
	}
	:global(.codeflask__lines, .codeflask--has-line-numbers::before, .codeflask__pre){
		z-index: 0 !important;
	}
	:global(.ce-settings, .nice-select-dropdown){
		z-index: 10000 !important;
	}
	:global(.codeflask__textarea){
		color: transparent !important;
	}
</style>
