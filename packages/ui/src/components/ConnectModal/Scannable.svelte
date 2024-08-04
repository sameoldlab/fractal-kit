<script lang="ts">
	import QRCode from '@castlenine/svelte-qrcode'
	import type { Connector } from '@wagmi/core'
	import skeleton from './skeletonQr.svg'
	import { fade } from 'svelte/transition'
	export let connector: Connector
	let data: string = ''

	console.log('getting uri from wallet connect')
	const getQr = async () => {
		try {
			const data = await connector.getQr()
		} catch (err) {
			console.error(err)
			throw Error(err)
		}
	}

	connector.getProvider().then((provider) => {
		if (provider) {
			provider.on('display_uri', (uri) => (data = uri))
			provider.connect()
		}
	})
</script>

<div id="fractl-scan" class="fcl__layout-1col fcl__el">
	<div class="main">
		<img
			width="256px"
			height="256px"
			src={skeleton}
			alt="loading QRCode"
			transition:fade
		/>
		{#if data}
			<a href={data} transition:fade>
				<QRCode
					{data}
					anchorsOuterColor="black"
					modulesColor="black"
					shape="circle"
					haveBackgroundRoundedEdges
					haveGappedModules
					padding={4}
					isResponsive
					logoInBase64={connector.icon}
					logoPadding={4}
				/>
			</a>
		{/if}
	</div>
	<button
		on:click={() => navigator.clipboard.writeText(data)}
		class="justify-center fcl__btn-primary">Copy to clipboard</button
	>
</div>

<style>
	div.main {
		width: 100%;
		justify-content: center;
		/* background: #333; */
		box-sizing: border-box;
		/* padding: 0.5em; */
		border-radius: 1em;

		justify-content: center;
		align-items: center;
		padding-block-end: 1rem;
		display: grid;
		& > * {
			grid-area: 1 / 1;
		}
	}
	a {
		/* changes to an unhinged 260px for reasons beyond my comprehension if this is auto */
		height: 256px;
	}
</style>
