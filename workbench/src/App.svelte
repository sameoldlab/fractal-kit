<script lang="ts">
	import './app.css'
	import { onMount } from 'svelte'
	import { reconnect } from '@wagmi/core'
	import wagmiConfig from './lib/wagmiConfig'
	import { AccountModal } from './fractl/components'
	import { eip155 } from '@fractl-ui/evm'
	import { starknet } from '@fractl-ui/starknet'
	import { createFractl } from './fractl'

	const mount = async () =>
		createFractl({
			namespaces: [await starknet(), eip155($wagmiConfig)]
		})
	const fractl = mount()

	// reconnect($wagmiConfig, { connectors: $wagmiConfig.connectors })
</script>

{#await fractl}
	loading
{:then fractl}
	<header>
		<button onclick={fractl.connect}>Connect</button>
		<button >Todo</button>
	</header>
	<main>
		<code>
			<p>isConnected: {fractl.isConnected}</p>
			<h2>Connections</h2>
			{#each fractl.connections.entries() as [chain, connections]}
				{chain}: {connections} <br>
			{/each}
			<h2>Connectors</h2>
			{#each fractl.connectors as [chain, conn]}
				{chain}: {conn.type} {conn.name}  <br>
			{/each}
			<!-- <pre>{JSON.stringify([...fractl.connections.entries()]).replaceAll(']','\n')}</pre> -->
			</code>
	<!--
		<AccountModal {fractl} />
		<FractlModal {config} />
	-->
	</main>
{:catch err}
	Error: {err}
{/await}

<style>
	header {
		display: flex;
		flex-direction: row;
		justify-content: end;
	}

	:root {
		background: #111;
		color: aliceblue;
	}
	main {
		display: grid;
	}
</style>
