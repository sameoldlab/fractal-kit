<script lang="ts">
	import { createEventDispatcher, onDestroy } from 'svelte'
	const dispatch = createEventDispatcher()

	export let titleText = 'Title Text'
	export let customTrigger = false

	export let inlineSize: number
	export let triggerText = 'open dialog'
	let dialog: HTMLDialogElement

	const docOverflow = {
		x: document.documentElement.style.overflowX,
		y: document.documentElement.style.overflowY
	}
	let isOpen = false

	const restoreStyles = (el: HTMLDialogElement) => {
		el.addEventListener('close', () => {
			isOpen = false
			document.documentElement.style.overflowY = docOverflow.x
			document.documentElement.style.overflowX = docOverflow.y
		})
		return {
			destroy() {
				el.removeEventListener('close', () => {
					isOpen = false
					document.documentElement.style.overflowY = docOverflow.x
					document.documentElement.style.overflowX = docOverflow.y
				})
			}
		}
	}

	export function open() {
		isOpen = true
		dialog.showModal()

		/* Get the overflow at the point when dialog is being opened */
		docOverflow.x = document.documentElement.style.overflowY
		docOverflow.y = document.documentElement.style.overflowX
		document.documentElement.style.overflowY = 'hidden'
		document.documentElement.style.overflowX = 'hidden'
	}

	export function close() {
		dialog.close()
		dispatch('close')
	}
	onDestroy(() => {
		dispatch('close')
	})
</script>

<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
<!-- svelte-ignore a11y-click-events-have-key-events -->
<dialog
	id="fractl-dialog"
	bind:this={dialog}
	aria-modal
	aria-labelledby="fcl__dialog-title"
	on:click|self={close}
	use:restoreStyles
	inert={isOpen ? undefined : true}
	style:inline-size={`min(${inlineSize || 240}px, 100%)`}
>
	<!-- transition:fade={{ duration: 500, easing: quadInOut }} -->
	<header>
		<div class="fcl__header-icon">
			<slot name="icon-left" />
		</div>
		<h2 id="fcl__dialog-title">{titleText}</h2>
		<div class="fcl__header-icon">
			<button on:click={close} aria-label="Close Modal" class="fcl__header-btn">
				<svg
					aria-hidden="true"
					focusable="false"
					xmlns="http://www.w3.org/2000/svg"
					width="12"
					height="12"
					viewBox="0 0 12 12"
					fill="none"
				>
					<path
						stroke="#E0E8FF"
						stroke-linecap="round"
						stroke-width="2"
						d="M10 10 2 2M10 10 2 2M10 2l-8 8"
					/>
				</svg>
			</button>
		</div>
	</header>

	<div class="fcl__dialog-content">
		<slot />
	</div>
</dialog>

{#if !customTrigger}
	<button on:click={open}>{triggerText}</button>
{/if}

<style>
	dialog:not([open]) {
		pointer-events: none;
		opacity: 0;
	}

	dialog[open] {
		opacity: 1;
	}

	dialog {
		/* Managing transition */
		transition:
			width 128ms,
			opacity 128ms ease-in,
			position 128ms ease-in;

		/* Position at center */
		display: block;
		position: fixed;
		margin: auto;
		padding: 0;
		inset: 0;

		&::backdrop {
			background: var(--fcl-overlay-background, hsla(0, 0%, 0%, 0.4));
			backdrop-filter: var(--fcl-overlay-backdrop-filter, none);
		}
		/* max-inline-size: 336px; */
		background: var(--fcl-body-background, hsl(228, 11%, 9%));
		color: var(--fcl-text-color, #f1f1f1);
		--fcl-sc: hsla(228, 11%, 9%, 0.08);
		box-shadow: var(
			--fcl-modal-box-shadow,
			0px 0px 0px 1px var(--fcl-sc),
			0px 1px 1px -0.5px var(--fcl-sc),
			0px 3px 3px -1.5px var(--fcl-sc),
			0px 6px 6px -3px var(--fcl-sc),
			0px 12px 12px -6px var(--fcl-sc),
			0px 24px 24px -12px var(--fcl-sc)
		);
		border: var(--fcl-modal-border, 1px solid #34393900);
		border-radius: var(--fcl-border-radius, 1.2em);

		font-family: var(
			--fcl-font-family,
			'Helvetica Neue',
			Inter,
			'Arial Nova',
			system-ui,
			-apple-system,
			BlinkMacSystemFont,
			Oxygen,
			Ubuntu,
			Cantarell,
			'Open Sans',
			sans-serif
		);
		& button {
			font-family: inherit;
		}

		/* Targetting Dialog Head Slot */
		--inner-padding: var(--fcl-modal-padding, 1em);
		& > header {
			display: grid;
			grid-template-columns: 30px [title-start] 1fr [title-end] 30px;
			align-items: center;
			padding: var(--inner-padding);
			padding-block-end: calc(var(--inner-padding) / 2);

			& h2 {
				margin: 0;
				grid-column: title;
				text-align: center;
				font-size: var(--fcl-modal-heading-font-size, 1em);
				font-weight: var(--fcl-modal-heading-font-weight, 700);
			}
		}
		& .fcl__dialog-content {
			padding: var(--inner-padding);
		}
	}
	/* 	@media (max-width: 500px) {
		dialog {
			margin-block-end: 0;
			border-end-end-radius: 0;
			border-end-start-radius: 0;
			/* inline-size: 100%; *
		}
	} */
	.fcl__dialog-content {
		display: grid;
		grid-template-rows: 1fr;
		transition: 250ms grid-template-rows ease;
		max-block-size: 300px;
		overscroll-behavior: contain;
		overflow-y: auto;
		padding-block-start: 0;

		&::-webkit-scrollbar {
			inline-size: 0.5em;
		}

		&::-webkit-scrollbar-track {
			background: var(--fcl-body-background);
		}
		&::-webkit-scrollbar-thumb {
			background: var(--fcl-text-color, #222429);
			border: 0.2em solid transparent;
			border-radius: calc(var(--fcl-border-radius, 50em) / 8);
			&:hover {
				background-color: var(--fcl-btn-hover-background, #2f3139);
			}
		}
		&::-webkit-scrollbar-button {
			background: var(--fcl-body-background);
		}
	}
	.fcl__header-icon {
		height: 30px;
		width: 30px;
		display: flex;
		justify-content: center;
		align-items: center;
	}
</style>
