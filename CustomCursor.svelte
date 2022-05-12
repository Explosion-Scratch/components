<script>
  //This component is in beta: Missing options and uses scss - An extra package to install
  let innerCursor = null;
  let outerCursor = null;
  let doc = null;
  function moveCursor(e) {
    let x = e.clientX;
    let y = e.clientY;

    innerCursor.style.left = `${x}px`;
    innerCursor.style.top = `${y}px`;

    outerCursor.style.left = `${x}px`;
    outerCursor.style.top = `${y}px`;
    if (e.target.closest("a, button, .button, .pointer")) {
      innerCursor.classList.add("grow");
      outerCursor.classList.add("grow");
    } else {
      innerCursor.classList.remove("grow");
      outerCursor.classList.remove("grow");
    }
  }
</script>

<svelte:body on:mousemove={moveCursor} />

<div class="inner-cursor" bind:this={innerCursor} />
<div class="outer-cursor" bind:this={outerCursor} />

<style lang="scss">
  $col: white;
  * {
    z-index: 10000;
  }
  :global(*) {
    cursor: none !important;
  }
  .inner-cursor {
    position: fixed;
    left: 10px;
    width: 10px;
    height: 10px;
    transform: translate(-50%, -50%);
    background-color: $col;
    mix-blend-mode: difference;
    border-radius: 50%;
    pointer-events: none;
    transition: width 0.5s, height 0.5s;
  }
  :global(.inner-cursor.grow) {
    width: 25px;
    height: 25px;
    transition: width 0.5 ease height 0.5s ease;
  }
  .outer-cursor {
    position: fixed;
    left: 10px;
    width: 25px;
    height: 25px;
    transform: translate(-50%, -50%);
    border: 1px solid $col;
    mix-blend-mode: difference;
    border-radius: 50%;
    pointer-events: none;
    transition: 0.1s;
  }
  :global(.outer-cursor.grow) {
    width: 5px;
    height: 5px;
    transition: width 0.5 ease height 0.5s ease;
  }
</style>
