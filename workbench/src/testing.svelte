<script lang="ts">
	import 'evm-new'
	import config from './lib/wagmiConfig'
	import { onMount } from 'svelte'
	import { reconnect } from '@wagmi/core'
	// import { isMobile } from '$lib/utils'


	onMount(async () => {
		reconnect($config, { connectors: $config.connectors })
	})
</script>

<main>
	<div>
		<!-- <p>is mobprocessile: {isMobile()}</p> -->
		<p>chain: {$config.state.chainId}</p>
		<p>connections: {JSON.stringify($config.state.connections)}</p>
		<p>current: {$config.state.current}</p>
		<p>status: {$config.state.status}</p>
	</div>

	<fractl-modal config={$config} />

	<!-- 	<button
		on:click={() => {
			dialogElem.showModal()
		}}>Show Modal</button
	>
	<dialog id="dialog" bind:this={dialogElem}>
		here goes some content
		<button
			on:click={() => {
				dialogElem.close()
			}}>close</button
		>
	</dialog> -->
</main>

<style>
	:root {
		background: #777;
	}

	main {
		width: 100%;
		height: 100%;
		color: aqua;
		/* //var(--fcl-text-color); */
	}
</style>
