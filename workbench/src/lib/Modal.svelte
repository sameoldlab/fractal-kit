<script lang="ts">
	let dialogElem

	const showBtn = () => {
		dialogElem.showModal()
	}

	const close = () => {
		dialogElem.close()
	}
</script>

<dialog id="dialog" bind:this={dialogElem}>
	Content here
	<button on:click={close} class="close">close</button>
</dialog>

<button on:click={showBtn} class="show">Show Modal</button>

<style>
	dialog {
		animation: fade-out 0.7s ease-out;
	}

	dialog[open] {
		animation: fade-in 0.7s ease-out;
	}

	dialog[open]::backdrop {
		animation: backdrop-fade-in 0.7s ease-out forwards;
	}

	/* Animation keyframes */

	@keyframes fade-in {
		0% {
			opacity: 0;
			transform: scaleY(0);
			display: none;
		}

		100% {
			opacity: 1;
			transform: scaleY(1);
			display: block;
		}
	}

	@keyframes fade-out {
		0% {
			opacity: 1;
			transform: scaleY(1);
			display: block;
		}

		100% {
			opacity: 0;
			transform: scaleY(0);
			display: none;
		}
	}

	@keyframes backdrop-fade-in {
		0% {
			background-color: rgb(0 0 0 / 0%);
		}

		100% {
			background-color: rgb(0 0 0 / 25%);
		}
	}

	body,
	button {
		font-family: system-ui;
	}
</style>
