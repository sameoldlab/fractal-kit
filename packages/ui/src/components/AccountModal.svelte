<script lang="ts">
	import { truncate } from '../utils.js'
	import type {
		AccountData,
		ConfigConnected,
		Connector
	} from '@fractl-ui/types'
	import Zorb from './zorb/Zorb.svelte'
	import Modal from './Common/Modal.svelte'
	import { onDestroy } from 'svelte'
	import type { Readable } from 'svelte/store'

	export let accountData: Readable<AccountData>
	export let config: ConfigConnected<Connector>
	export let btnClass: string = ''

	$: address = $accountData.account?.address
	$: name = $accountData.nameService?.name
	$: avatar = $accountData.nameService?.avatar
	$: balance = $accountData.balance?.value
	$: symbol = $accountData.balance?.symbol

	let open: () => void
	let close: () => void
	onDestroy(() => {
		close()
	})

	const handleDisconnect = async (connector: Connector) => {
		close()
		await config.disconnect(connector)
	}
</script>

{#if address}
	<!-- aria-expanded={$open ? 'true' : 'false'} -->
	<button
		aria-haspopup="dialog"
		data-fractl-trigger
		class="address fcl_el {btnClass}"
		on:click={open}
	>
		{#if avatar}
			<img class="avatar rounded" src={avatar} alt="" />
		{:else}
			<Zorb {address} size={'2em'} />
		{/if}

		{name || truncate(address)}
	</button>

	<Modal titleText="Connected" bind:open bind:close customTrigger>
		<!-- header>div*2+div.balance+hr+div>div.header -->
		<div class="fcl__layout-3col fcl__el">
			{#if avatar}
				<img class="fcl__graphic-primary rounded" src={avatar} alt="" />
			{:else}
				<Zorb {address} class={'fcl__graphic-primary'} />
			{/if}
			<button
				on:click={() => {
					console.log(address)
					navigator.clipboard.writeText(address)
				}}
				class="fcl__btn-text fcl__text-primary address"
				>{name || truncate(address)}

				<!-- prettier-ignore -->
				<svg width="18" height="18" viewBox="0 0 18 18" fill="currentcolor" xmlns="http://www.w3.org/2000/svg" >
				 <path d="M3.70898 13.3027H4.85059V14.3008C4.85059 15.8525 5.70508 16.7002 7.26367 16.7002H14.291C15.8496 16.7002 16.7041 15.8525 16.7041 14.3008V7.24609C16.7041 5.69434 15.8496 4.84668 14.291 4.84668H13.1494V3.8418C13.1494 2.29688 12.2949 1.44238 10.7363 1.44238H3.70898C2.15039 1.44238 1.2959 2.29004 1.2959 3.8418V10.9033C1.2959 12.4551 2.15039 13.3027 3.70898 13.3027ZM3.90039 11.5391C3.35352 11.5391 3.05957 11.2656 3.05957 10.6846V4.06055C3.05957 3.47949 3.35352 3.21289 3.90039 3.21289H10.5449C11.0918 3.21289 11.3857 3.47949 11.3857 4.06055V4.84668H7.26367C5.70508 4.84668 4.85059 5.69434 4.85059 7.24609V11.5391H3.90039ZM7.45508 14.9365C6.9082 14.9365 6.61426 14.6699 6.61426 14.0889V7.45801C6.61426 6.87695 6.9082 6.61035 7.45508 6.61035H14.0996C14.6465 6.61035 14.9404 6.87695 14.9404 7.45801V14.0889C14.9404 14.6699 14.6465 14.9365 14.0996 14.9365H7.45508Z"/>
			</svg>
			</button>

			<span class="fcl__subhead"
				>{balance ? `${balance.substring(0, 7)} ${symbol}` : 0}</span
			>
			<!-- <br /> -->

			<div class="fcl__3col-full mt-1">
				<!-- <button on:click>icon</button> -->
				<!-- <button on:click>icon</button> -->
				<!-- </header> -->
				<!-- <button on:click={handleDisconnect} disabled> Switch</button> -->

				<button
					on:click={() => handleDisconnect($accountData.account?.connector)}
					class="fcl__btn-primary row justify-center"
				>
					<!-- prettier-ignore -->
					<svg width="18" height="18" viewBox="0 0 18 18" fill="currentcolor" xmlns="http://www.w3.org/2000/svg" >
					<path d="M3.01172 16.5908H10.333C11.8848 16.5908 12.7324 15.7432 12.7324 14.1777V11.2656H10.9688V13.9863C10.9688 14.5332 10.7021 14.8271 10.1211 14.8271H3.22363C2.64258 14.8271 2.37598 14.5332 2.37598 13.9863V4.15625C2.37598 3.60254 2.64258 3.30859 3.22363 3.30859H10.1211C10.7021 3.30859 10.9688 3.60254 10.9688 4.15625V6.89746H12.7324V3.95801C12.7324 2.39941 11.8848 1.54492 10.333 1.54492H3.01172C1.45996 1.54492 0.612305 2.39941 0.612305 3.95801V14.1777C0.612305 15.7432 1.45996 16.5908 3.01172 16.5908ZM7.76953 9.85059H14.4209L15.4258 9.78906L14.8994 10.1445L14.0176 10.9648C13.874 11.1016 13.792 11.2861 13.792 11.4844C13.792 11.8398 14.0654 12.168 14.4551 12.168C14.6533 12.168 14.7969 12.0928 14.9336 11.9561L17.1143 9.68652C17.3193 9.48145 17.3877 9.27637 17.3877 9.06445C17.3877 8.85254 17.3193 8.64746 17.1143 8.43555L14.9336 6.17285C14.7969 6.03613 14.6533 5.9541 14.4551 5.9541C14.0654 5.9541 13.792 6.27539 13.792 6.6377C13.792 6.83594 13.874 7.02734 14.0176 7.15723L14.8994 7.98438L15.4258 8.33984L14.4209 8.27148H7.76953C7.35254 8.27148 6.99023 8.62012 6.99023 9.06445C6.99023 9.50195 7.35254 9.85059 7.76953 9.85059Z"/>
				</svg>

					Disconnect
				</button>
			</div>
		</div>
	</Modal>
{/if}

