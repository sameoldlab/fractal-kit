<script lang="ts">
	import type { Config } from '@fractl-ui/types'
	import ConnectModal from './ConnectModal/ConnectModal.svelte'
	import AccountModal from './AccountModal.svelte'
	import { blur } from 'svelte/transition'
	import { quintOut } from 'svelte/easing'

	export let btnClass: string
	export let config: Promise<Config>

	let state, accountData
	config.then((c) => {
		state = c.state
		accountData = c.accountData
	})

	$: isConnected = $state?.status === 'connected'
</script>

{#await config then config}
	{#key isConnected}
		<div
			in:blur={{ duration: 1208, easing: quintOut }}
			out:blur={{ duration: 8 }}
		>
			{#if isConnected}
				<AccountModal {accountData} {config} {btnClass} />
			{:else}
				<ConnectModal
					{state}
					{config}
					{btnClass}
					triggerText="Connect Wallet"
				>
					<svelte:fragment slot="footer"></svelte:fragment>
				</ConnectModal>
			{/if}
		</div>
	{/key}
{/await}
