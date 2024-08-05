<script lang="ts">
	import QRCode from '@castlenine/svelte-qrcode'
	import type { Connector } from '@wagmi/core'
	import skeleton from './skeletonQr.svg'
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

<div class="fcl__layout-1col">
	{#if data}
		<QRCode
			{data}
			anchorsOuterColor="black"
			modulesColor="black"
			shape="circle"
			haveBackgroundRoundedEdges
			haveGappedModules
			padding={8}
			isResponsive
			logoInBase64={connector.icon}
			logoPadding={5}
		/>
		<span class="fcl__text-secondary"> Click to open </span>
	{:else}
		<img src={skeleton} alt="loading QRCode" />
	{/if}
	<button class="fcl__btn-primary">Copy to clipboard</button>
</div>

<style>
	div {
		width: 100%;
		aspect-ratio: 1;
		/* background: #333; */
		display: flex;
		box-sizing: border-box;
		/* padding: 0.5em; */
		border-radius: 1em;
		overflow: hidden;
		border: 1px solid #666;

		justify-content: stretch;
		align-items: stretch;
	}
</style>
