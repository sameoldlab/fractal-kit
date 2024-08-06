<script lang="ts">
	import { onDestroy, onMount } from 'svelte'
	import copyEN from '../../copy/copy.EN.js'
	import Modal from '../Common/Modal.svelte'
	import Scannable from './Scannable.svelte'
	import type { Config, Connector, StateDisconnected } from '@fractl-ui/types'
	import type { Readable } from 'svelte/store'
	import { slide } from 'svelte/transition'

	export let config: Config<Connector>
	// export let connectors: Config<Connector>['connectors']
	export let state: Readable<StateDisconnected<Connector>>
	export let btnClass = ''
	export let triggerText = 'Connect Wallet'
	export let onConnect: (fractl: Config<Connector>) => void
	export let onConnectFail: (error: unknown) => void

	let open: () => void
	let close: () => void

	// export let demo = true
	// export let inputWatch = true
	// export let accountStatus: string
	// export let chainStatus
	// export let showBalance: string
	onMount(() => open())
	onDestroy(() => {
		close()
	})
	$: if ($state.status === 'connected') close()

	let activeRequest: Connector | null = null //config.connectors[3]
	$: title = !activeRequest ? 'Connect Wallet' : activeRequest.name

	const handleConnect = async (connector: Connector) => {
		// await config.reconnect([connector])
		try {
			// console.debug('config.state: ', $state.status)
			activeRequest = connector
			await connector.fractl.connect()
			onConnect(config)
		} catch (error) {
			console.error(error)
			// onConnectFail(error)
			// throw error
		}

		// console.debug('config.state: ', $state.status)
	}
	const clearRequest = () => (activeRequest = null)
</script>

<!-- aria-expanded={open ? 'true' : 'false'} -->
<button
	aria-haspopup="dialog"
	data-fractl-trigger
	on:click={open}
	class={btnClass}
>
	{triggerText}
</button>

<Modal titleText={title} bind:open bind:close customTrigger>
	<svelte:fragment slot="icon-left">
		<button
			class:hide={!activeRequest}
			on:click={clearRequest}
			class="fcl__header-btn"
		>
			<svg
				width="18"
				height="18"
				viewBox="0 0 18 18"
				fill="none"
				xmlns="http://www.w3.org/2000/svg"
				aria-hidden="true"
				focusable="false"
			>
				<path
					d="M12 3L5.5 9.5L12 16"
					stroke="currentcolor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
				/>
			</svg>
		</button>
	</svelte:fragment>

	{#if activeRequest}
		{#if activeRequest.type === 'injected'}
			<!-- <Injected connector={activeRequest}></Injected> -->
			<div id="fractl-injected" class="fcl__layout-1col fcl__el">
				<div class="fcl__graphic-primary">
					<!-- prettier-ignore -->
					<svg class:hide={$state.status !== 'connecting' && $state.status !== 'reconnecting'} class="spin" width="108" height="108" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" > 
						<path d="M98 50C98 23.4903 76.5097 2 50 2" stroke="url(#a)" stroke-width="4" stroke-linecap="round" /> 
						<defs> 
							<radialGradient id="radial" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(100 50) rotate(-90) scale(47 47)" > <stop stop-color="currentColor" /> <stop offset="1" stop-color="currentColor" stop-opacity="0" /> </radialGradient> 
							<linearGradient x1="8.042%" y1="0%" x2="65.682%" y2="23.865%" id="a" > <stop stop-color="currentColor" stop-opacity="0" offset="0%" /> <stop stop-color="currentColor" stop-opacity=".631" offset="63.146%" /> <stop stop-color="currentColor" offset="100%" /> </linearGradient>
						 </defs> 
					</svg>
					<img
						class="fcl_graphic-icon rounded"
						src={activeRequest.icon}
						alt={activeRequest.name}
					/>
				</div>

				{#if $state.status === 'connecting' || $state.status === 'reconnecting'}
					<h3 class="fcl__text-primary">Requesting Connection</h3>
					<p class="fcl__text-secondary">
						{copyEN(activeRequest.name).connecting[activeRequest.type]}
					</p>
				{:else}
					<h3 class="fcl__text-primary error">Connection Declined</h3>
					<p class="fcl__text-secondary">
						{copyEN(activeRequest.name).rejected[activeRequest.type]}
					</p>
					<button
						on:click={() => handleConnect(activeRequest)}
						class="fcl__btn-primary justify-center mt-1"
						in:slide>Retry</button
					>
				{/if}
			</div>
		{:else if activeRequest.type === 'walletConnect'}
			<Scannable connector={activeRequest} />
		{/if}
	{:else}
		<div id="fractl-connect" class="fcl__layout-1col fcl__el">
			<div class="connectors">
				{#each config.connectors as [ns, connector]}
					<button
						on:click={() => handleConnect(connector)}
						data-uid={connector.uid}
						class="fcl__btn-primary connector justify-between {connector.type}"
					>
						{connector.name}
						<!-- {connector.type} -->
						{#if connector.icon}
							<!-- Button is already labbeled by it's inner text making the image alt text repetitive -->
							<!-- svelte-ignore a11y-missing-attribute -->
							<img aria-hidden class="logo rounded" src={connector.icon} />
						{/if}
					</button>
				{/each}
			</div>
			<slot name="footer" />
		</div>
	{/if}
</Modal>

<style>
	#fractl-connect {
		/* scroll through connector over max height */
		max-block-size: 300px;
		overscroll-behavior: contain;
		overflow-x: hidden;
		overflow-y: auto;
	}
	.hide {
		display: none;
		opacity: 0;
		/* transition: opacity 150ms 1s ease-in; */
	}

	.spin {
		animation: 1500ms linear infinite spin;
		color: oklch(70% 0.52 230);
		/* height: 7em; */
	}

	@keyframes spin {
		100% {
			transform: rotate(360deg);
		}
	}

	.connectors {
		display: grid;
		width: 100%;
		gap: 0.5em;
	}
	.connector.mock {
		background: hsla(76, 20%, 15%, 1);
		color: hsla(73, 86%, 68%, 1);
	}
</style>
