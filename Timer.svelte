<script>
  import { onMount } from "svelte";
  export let from = 10 * 1000;
  export let done = () => {
    console.log("Timer finished");
  };
  export let autostart;
  let going = false;
  let paused = false;
  let interval, input, inputFocused;
  let remaining = from;
  let circle;
	let start = Date.now();
  export let width = 5;
  export let size = 100;
  onMount(() => {
		input.value = Math.floor(remaining / 1000 / 60).toString().padStart(2, "0") + ":" + Math.round(remaining / 1000 % 60).toString().padStart(2, "0");
    circle.style.setProperty(`--width`, `${width}px`);
    circle.parentElement.style.setProperty(`--size`, `${size}px`);
    circle.style.setProperty(
      `--total`,
      `${circle.querySelector("circle").getTotalLength()}px`
    );
    if (autostart) {
      startTimer();
    }
  });

  function startTimer() {
		start = Date.now();
    paused = false;
    going = true;
    remaining = from;
    const INT = 10;
    interval = setInterval(() => {
			if (!inputFocused){
				if (!input){return}
				input.value = Math.floor(remaining / 1000 / 60).toString().padStart(2, "0") + ":" + Math.round(remaining / 1000 % 60).toString().padStart(2, "0");
			}
      if (remaining <= 0) {
        done({ circle, paused, going });
        stopTimer();
      }
      if (going && !paused) {
        remaining = from - (Date.now() - start);
      }
      circle.style.setProperty(`--percent`, `${remaining / from}`);
    }, INT);
  }
  function stopTimer() {
    paused = false;
    going = false;
    remaining = from;
    clearInterval(interval);
		circle.style.setProperty(`--percent`, '1')
    interval = null;
  }
	function set(){
		let val = input.value;
		stopTimer();
		let [mins, sec] = val.split(":").map(i => parseInt(i, 10));
		from = mins * 1000 * 60 + sec * 1000;
	}
</script>

<div class="container">
  <div class="timer">
    <svg bind:this={circle}>
      <circle r={size / 2 - width} cx={size / 2} cy={size / 2} />
			<circle class="bg" r={size / 2 - width} cx={size / 2} cy={size / 2} />
    </svg>
		<input bind:this={input} on:focus={() => (inputFocused = true)} on:blur={() => (inputFocused = false)} on:keyup={set} on:change={set} class="remaining"/>
  </div>

  <div class="buttons">
    <button on:click={() => (going ? stopTimer() : startTimer())}>
      {#if going}Stop{:else}Start{/if}
    </button>
    {#if going}
      <button class="pause" on:click={() => (paused = !paused)}>
        {#if paused}Resume{:else}Pause{/if}
      </button>
    {/if}
  </div>
</div>

<style>
	.container {
		width: 100%;
		height: 100%;
		display: flex;
		justify-content: center;
		align-items: center;
		flex-direction: column;
	}
	.timer {
		position: relative;
		width: var(--size);
		height: var(--size);
		padding: 10px;
		display: grid;
	}
	.remaining {
		background: transparent;
		width: 6ch;
		text-align: center;
		border: none;
		position: absolute;
		top: 50%;
		left: 50%;
		border-radius: 3px;
		transform: translate(-50%, -50%);
	}
	.remaining:focus {
		outline: none;
		box-shadow: 0 0 0 3px #0001;
	}
	svg {
		--width: 10px;
		--total: 114px;
		--percent: 0;
	}
	.remaining {
		font-weight: 600;
	}
	svg {
		position: absolute;
		top: 50%;
		left: 50%;
		width: 100%;
		height: 100%;
		transform: translate(-50%, -50%) rotateY(-180deg) rotateZ(-90deg);
		width: var(--size);
  	height: var(--size);
	}
	svg circle:not(.bg) {
 	 	stroke-dasharray: var(--total);
		stroke-dashoffset: calc((1 - var(--percent)) * var(--total));
		stroke-linecap: round;
		stroke-width: var(--width);
		stroke: var(--theme);
		fill: none;
	}
	svg .bg {
		stroke-width: var(--width);
		stroke: #0001;
		fill: none;
	}
	.buttons {
		display: flex;
		flex-direction: column;
		width: 80vw;
		max-width: 200px;
	}
	.buttons button {
		width: 100%;
		border: none;
		border-radius: 3px;
		padding: 10px 20px;
		background: var(--theme);
		color: white;
		cursor: pointer;
		margin: 3px 0;
		transition: opacity .2s ease, transform .1s ease;
	}
	.buttons button:hover {
		opacity: .8;
	}
	.buttons button:active {
		transform: scale(.98);
	}
	.buttons button:focus {
		box-shadow: 0 0 0 2px #0001;
		outline: none;
	}
</style>
