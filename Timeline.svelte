<script>
  //This component is in beta: Unintuitive use + missing options
  export let items = [];
</script>

<main {...$$props} class="timeline">
  {#if $$slots.default}
    <slot />
  {:else if items.length}
    {#each items as item}
      <p>{item}</p>
    {/each}
  {/if}
</main>

<style lang="scss">
  @import "../main.scss";
  //Colors
  $black: #fff;
  $white: #34435e;
  $primary: #743ad5;
  $secondary: #d53a9d;
  main {
    max-height: 100%;
    @include fade-out;
  }
  p {
    border-style: none;
    font-size: 1em;
    line-height: 1.75em;
    border-top: 3px solid;
    border-image: linear-gradient(to right, $primary 0%, $secondary 100%);
    border-image-slice: 1;
    border-width: 3px;
    margin: 0;
    padding: 40px;
    counter-increment: section;
    position: relative;
    color: $black;

    //numbers
    &:before {
      // Align stuff center
      display: flex;
      justify-content: center;
      align-items: center;
      content: counter(section);
      position: absolute;
      border-radius: 50%;
      padding: 10px;
      height: 1.25em;
      width: 1.25em;
      background-color: $black;
      text-align: center;
      line-height: 1.25em;
      color: $white;
      font-size: 0.8em;
    }
  }
  //odd number borders
  p:nth-child(odd) {
    border-right: 3px solid;
    padding-left: 0;

    &:before {
      left: 100%;
      margin-left: -17px;
    }
  }
  //even number borders
  p:nth-child(even) {
    border-left: 3px solid;
    padding-right: 0;

    &:before {
      right: 100%;
      margin-right: -17px;
    }
  }
  //handle first and last
  p:first-child {
    border-top: 0;
    border-top-right-radius: 0;
    border-top-left-radius: 0;
  }
  p:last-child {
    border-bottom-right-radius: 0;
    border-bottom-left-radius: 0;
  }
</style>
