import { onMount } from "svelte";
export async function typing(node, config) {
  if (!config.items) {
    config.items = config;
  }
  let texts = [...config.items];
  let index = 0;
  let current = "";
  while (true) {
    let item = texts[index];
    for (let letter of item) {
      current += letter;
      node.innerText = current;
      await sleep(config.typeTime || 200);
    }
    await sleep(config.endWait || 2000);
    for (let letter of item) {
      current = current.slice(0, current.length - 1);
      node.innerText = current;
      await sleep(config.deleteTime || 100);
    }
    await sleep(config.wordWait || 500);
    index++;
    if (index >= texts.length) {
      index = 0;
    }
  }
  function sleep(ms) {
    return new Promise((res) => setTimeout(res, ms));
  }
}
