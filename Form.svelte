<script>
	import {createEventDispatcher} from "svelte";
	import {onMount} from "svelte";
	import forwardEvents from "./forwardevents.js"
	const dispatch = createEventDispatcher();
	const DEFAULT_INVALID_MESSAGE = "Invalid";
	const INPUT_QS = "textarea, input:not([type=radio], [type=checkbox]), select, button, .checkboxes_container, .radio_container";
	const VALID_ATTR = "data-valid";
	
	export let 
		type = "input", 
		options = [],
		validate = /^.+$/,
		placeholder = "",
		description,
		id,
		data = {},
		container,
		label = "",
		errorMessage = "",
		value,
		getVal = () => val();
	
	let name = id;
	let VALID = true, ERROR_MESSAGE = "";
	onMount(() => {
		value = $$props.default || value || "";
		type = type.toLowerCase();
		if (!id && type !== "form"){
			throw new Error("No ID passed for input of type " + type)
		}
		if (type !== "form"){
			container.querySelector(INPUT_QS).id = id;
			forwardEvents(container.querySelector(INPUT_QS), {dispatch})
		} else {
			forwardEvents(container, {dispatch});
			setTimeout(val, 100);
		}
		container.addEventListener("input", handle);
		container.addEventListener("onkeyup", handle);
		container.addEventListener("change", handle);
		container.addEventListener("blur", handle);
		container.addEventListener("run-validate", () => {
			if (type === "form"){return}
			handle({target: container.querySelector(INPUT_QS), skipLabel: true})
		})
		async function val(){
			let els = [...container.querySelectorAll(INPUT_QS)];
			let e = new CustomEvent("run-validate");
			[...container.querySelectorAll(".container")].forEach(i => i.dispatchEvent(e));
			await new Promise(r => setTimeout(r));
			let out = Object.fromEntries(
				els
				.filter(i => i.getAttribute(VALID_ATTR))
				.filter(i => i.name || i.getAttribute("name"))
				.map(i => ([
					i.name || i.getAttribute("name"), 
					getValue(i)
				]))
			);
			dispatch("update", out);
			data = out;
			return out;
		}
		function handle(e){
			let i;
			if (type === "form"){
				i = e.target.closest(INPUT_QS)
			} else {
				i = container.querySelector(INPUT_QS)
				id = i.id;
			}
			
			let value = getValue(i);
			validate_this({value})
			
			if (type === "form"){
				if (!i.name){
					i.name = i.getAttribute("name");
				}
				if (i.getAttribute(VALID_ATTR)){
					data[i.name] = value;
				} else {
					delete data[i.name];
				}
				console.log("Dispatching update", data)
				console.log(i)
				dispatch("update", data);
			}
			
			
			function validate_this({value}){
				ERROR_MESSAGE = undefined;
				let i = container.querySelector(INPUT_QS);
				if (!i){return}
				let {valid, message} = checkValidation({
					validate,
					el: i,
					id,
					value,
				})
				if (!e.skipLabel){
					VALID = valid;
					ERROR_MESSAGE = message;
				}
				if (valid){
					i.setAttribute(VALID_ATTR, "true");
				} else {
					i.removeAttribute(VALID_ATTR)
				}
			}
		}
	})
	
	function checkValidation({validate, el, id, value}){
		if (!(el instanceof HTMLElement)){return}
		console.log({validate, el, id, value});
		if (validate instanceof RegExp){
			if (validate.test(value)){
				return {
					valid: true,
				}
			}
			return {
					valid: false,
			}
		}
		
		if (validate instanceof Function){
			let result = validate({validate, el, id, value});
			if (result === true){
				return {
					valid: true,
				}
			}
			if (typeof result === "string" || result === undefined){
				console.log("Instanceof: ", result instanceof String)
				return {
					valid: false,
					message: result,
				}
			}
			return {
				valid: false,
			}
		}
	}
	
	function getValue(input){
		console.log(`[getValue] `, input)
		if (!(input instanceof HTMLElement)){return}
		if (input.matches(".checkboxes_container")){
			return [...input.querySelectorAll("input[type=checkbox]")].filter(i => i.checked).map(i => i.value)
		}
		if (input.matches(".radio_container")){
			return [...input.querySelectorAll("input[type=radio]")].find(i => i.checked).value;
		}
		return input?.value;
	}
</script>

<div id="s_form_{id || type}" class="container {(label || description) ? 'container_box' : '' }" bind:this={container}>
	{#if label}<label for={id} class="label {type}_label">{label}</label>{/if}
	{#if description}<label for={id} class="description {type}_description">{description}</label>{/if}
	{#if !VALID && type !== "form"}
			<span class="error">{ERROR_MESSAGE || errorMessage || DEFAULT_INVALID_MESSAGE}</span>
	{/if}
	{#if type === "input"}
		<input {placeholder} {name} {value}/>
	{:else if type === "radio"}
		<div class="radio_container" {name}>
			{#each options as option}
				<label><input type="radio" {name} value={option.value || option} checked={value === (option.value || option)}/>{option.label || option}</label>
			{/each}
		</div>
	{:else if type === "form"}
		<form>
			<slot></slot>
		</form>
	{:else if type === "checkboxes"}
		<div class="checkboxes_container" {name}>
			{#each options as option}
				<label><input type="checkbox" {name} value={option.value || option} checked={value.includes(options.value || option) || null}/>{option.label || option}</label>
			{/each}
		</div>
	{:else if type === "select"}
		<select {id} {name}>
			{#each options as option}
				<option value={option.value || option} selected={value === option.value || value === option || null}>{option.label || option}</option>
			{/each}
		</select>
	{:else if type === "textarea"}
		<textarea {name} {placeholder} {value}></textarea>
	{:else if type === "button"}
		<button>
			<slot></slot>
		</button>
	{/if}
</div>
<!--
<style>
.container#s_form_form {
    padding: 1rem;
    border: 1px solid;
    display: grid;
    
    .container {
      margin: .3rem;
      border: .2rem;
      display: flex;
      flex-direction: column;
      &:hover {
          background: #0001;
      }
      
      label.label {
          color: #777;
          font-size: 1.2rem;
      }
      
      .radio_container {
            border: 1px solid;
            border-radius: .3rem;
            padding: .5rem;
        }
    }
    
    textarea {
        height: 6rem;
    }
}
</style>
-->
<style>
	* {
		box-sizing: border-box;
		padding: 0;
		margin: 0;
	}
.container#s_form_form {
	 padding: 1rem;
	 box-shadow: rgba(149, 157, 165, 0.2) 0px 8px 24px;
	 margin: 1rem;
	 max-width: 500px;
	 display: grid;
}
 .container#s_form_form .container {
	 margin: .3rem;
	 border: .2rem;
	 display: flex;
	 flex-direction: column;
}
 .container#s_form_form .container:hover {
	 background: #00000005;
}
 .container#s_form_form .container .label {
	 font-size: 1.2rem;
	 margin-bottom: .5rem;
	 margin-top: .5rem;
	 font-weight: 200;
}
 .container#s_form_form .container.container_box {
	 border: 1px solid #0001;
	 border-radius: .3rem;
	 padding: .5rem 1rem;
	 position: relative;
}
 .container#s_form_form textarea {
	 height: 6rem;
}

	input, select, textarea, button {
		background: transparent;
		border: 1px solid #0001;
		padding: .5rem;
	}
	input[type=radio]{
		margin-right: .4rem;
		/* Center stuff lol */
		transform: translateY(20%);
	}
	input[type=radio], select, button, input[type=button], label {
		cursor: pointer;
	}
	:is(input, select, textarea, button):focus {
		outline: none;
		border: 1px solid #0002;
	}
	.error {
		color: #933;
		margin: .1rem .1rem;
		background: #9001;
		padding: .3rem .5rem;
		border-radius: .2rem;
		border: .1rem solid #900;
		margin-bottom: .5rem;
	}
	.description {
		font-weight: 200;
		margin-bottom: .5rem;
		color: #666;
		font-size: .9rem;
	}
</style>
