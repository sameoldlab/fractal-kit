<script lang="ts">
	import { createEventDispatcher, onDestroy, tick } from 'svelte'
	import type { Action } from 'svelte/action'
	const dispatch = createEventDispatcher()

	export let titleText = 'Title Text'
	export let customTrigger = false

	export let triggerText = 'open dialog'
	let dialog: HTMLDialogElement

	const docOverflow = {
		x: document.documentElement.style.overflowX,
		y: document.documentElement.style.overflowY
	}

	const restoreStyles: Action<HTMLDialogElement> = (el) => {
		el.addEventListener('close', () => {
			document.documentElement.style.overflowY = docOverflow.x
			document.documentElement.style.overflowX = docOverflow.y
		})
		return {
			destroy() {
				el.removeEventListener('close', () => {
					document.documentElement.style.overflowY = docOverflow.x
					document.documentElement.style.overflowX = docOverflow.y
				})
			}
		}
	}

	export function open() {
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

	const resize = async () => {
		const reducedMotion = window.matchMedia(
			'(prefers-reduced-motion: reduce)'
		).matches
		if (!dialog || reducedMotion) return

		let firstHeight = dialog.getBoundingClientRect().height
		await tick()
		const lastHeight = dialog.getBoundingClientRect().height
		dialog.animate(
			[{ height: `${firstHeight}px` }, { height: `${lastHeight}px` }],
			{
				duration: 200,
				fill: 'none',
				easing: 'ease-out',
				composite: 'accumulate'
			}
		)
	}
	// onMount(resize)
	$: {
		// console.log('contentHeight:', contentHeight)
		titleText
		resize()
	}
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
	class="fcl__el"
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
	<footer class="fcl__dialog-footer">
		<slot name="footer">
			<!--<div class="spacer"></div>-->
		</slot>
	</footer>
</dialog>

{#if !customTrigger}
	<button on:click={open}>{triggerText}</button>
{/if}

<style>
	dialog:not([open]) {
		display: none;
		opacity: 0;
	}

	dialog[open] {
		display: flex;
		flex-direction: column;
		opacity: 1;
		height: fit-content;
	}

	dialog {
		overflow: hidden;
		padding: 0;
		margin-block-start: 25svh;

		&::backdrop {
			background: var(--fcl-overlay-background, hsla(0, 0%, 0%, 0.4));
			backdrop-filter: var(--fcl-overlay-backdrop-filter, none);
		}
		inline-size: 300px;
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

		/* Targets Dialog Head Slot */
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
		& .fcl__dialog-content > *,
		& .fcl__dialog-footer {
			padding: var(--inner-padding);
			padding-block-start: 0;
			box-sizing: border-box;
		}

		& .fcl__dialog-content > * {
			padding-block-end: 0;
		}
	}
	@media (max-width: 500px) {
		dialog {
			margin-block-start: auto;
			margin-block-end: 0;
			border-end-end-radius: 0;
			border-end-start-radius: 0;
			inline-size: 100vw;
			inline-size: 100svw;
		}
	}
	.fcl__dialog-content {
		box-sizing: border-box;
		display: flex;
		flex-direction: column;
		padding: 0;
	}
	.fcl__header-icon {
		height: 30px;
		width: 30px;
		display: flex;
		justify-content: center;
		align-items: center;
	}
</style>
