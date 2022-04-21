<script>
  // RunKit embed component
  // <RunKit code="//Hello world"/>
  export let code = "";
  export function runkit(node, { code, ...opts }) {
    let notebook = null;
    (async () => {
      await until(() => window.RunKit);
      console.log(window.RunKit);
      notebook = RunKit.createNotebook({
        element: node,
        nodeVersion: "16.x.x",
        source: code,
        ...opts,
      });
    })();
    return {
      destroy: () => {
        if (!notebook) {
          return;
        }
        notebook.destroy();
      },
      update: ({ code }) => {
        if (!notebook) {
          return;
        }
        notebook.setSource(code);
      },
    };
  }
  function until(cb) {
    let a = cb();
    if (a) {
      return a;
    }
    return new Promise((resolve) => {
      let int = setInterval(() => {
        let r = cb();
        if (r) {
          clearInterval(int);
          resolve(r);
        }
      }, 10);
    });
  }
</script>

<svelte:head><script src="https://embed.runkit.com"></script></svelte:head>

<div use:runkit={{ code }} />
