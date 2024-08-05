<script lang="ts">
	import { addEvmConnection } from '@fractl-ui/evm'
	import { create } from 'fractl-ui'
	import { AccountModal } from 'fractl-ui/svelte'
	import wagmiConfig from './lib/wagmiConfig'
	import { onMount } from 'svelte'
	import { reconnect } from '@wagmi/core'
	import FractlSvg from './assets/fractl.svg'
	import './app.css'
	import { addStarknetConnection } from '@fractl-ui/starknet'

	onMount(async () => {
		reconnect($wagmiConfig, { connectors: $wagmiConfig.connectors })
	})
	const stark = addStarknetConnection()
	const evm = addEvmConnection($wagmiConfig)
	let account

	const connect = async (conf) =>
		create(conf).then((connect) =>
			connect()
				.then((res) => {
					account = {
						config: res,
						accountData: res.accountData
					}
					console.log(res)
				})
				.catch((err) => console.error(err))
		)
</script>

<header>
	<button on:click={() => connect(evm)}>Connect EVM</button>
	<button on:click={() => connect(stark)}>Connect Stark</button>
</header>
<main>
	<div class="hero">
		<h1>
			<!-- Fractl-ui -->
			<img src={FractlSvg} alt="Fractl" />
		</h1>
		<p>
			modular dapp UI library for the EVM <span class="whisper">
				and (soon) Starknet and Cosmos and Fuel and...
			</span>
		</p>
	</div>
	{#if account}
		<AccountModal {...account} />
	{/if}
	<!-- 
	Future versions of ConnectModal will not include a button.
	FractlModal will take care of transitions swapping between connection states. 
	A reuglar button can also be used to trigger the connect moadal
	<FractlModal {config} />
	-->
</main>
<footer class="links">
	<a href="https://github.com/sameoldlab/fractl-ui">
		<svg
			height="20"
			aria-hidden="true"
			viewBox="0 0 16 16"
			fill="currentcolor"
			version="1.1"
			width="20"
			data-view-component="true"
		>
			<path
				d="M8 0c4.42 0 8 3.58 8 8a8.013 8.013 0 0 1-5.45 7.59c-.4.08-.55-.17-.55-.38 0-.27.01-1.13.01-2.2 0-.75-.25-1.23-.54-1.48 1.78-.2 3.65-.88 3.65-3.95 0-.88-.31-1.59-.82-2.15.08-.2.36-1.02-.08-2.12 0 0-.67-.22-2.2.82-.64-.18-1.32-.27-2-.27-.68 0-1.36.09-2 .27-1.53-1.03-2.2-.82-2.2-.82-.44 1.1-.16 1.92-.08 2.12-.51.56-.82 1.28-.82 2.15 0 3.06 1.86 3.75 3.64 3.95-.23.2-.44.55-.51 1.07-.46.21-1.61.55-2.33-.66-.15-.24-.6-.83-1.23-.82-.67.01-.27.38.01.53.34.19.73.9.82 1.13.16.45.68 1.31 2.69.94 0 .67.01 1.3.01 1.49 0 .21-.15.45-.55.38A7.995 7.995 0 0 1 0 8c0-4.42 3.58-8 8-8Z"
			></path>
		</svg>
	</a>
</footer>

<style>
	header {
		display: flex;
		flex-direction: row;
		justify-content: end;
	}
	.hero {
		align-items: center;
		display: flex;
		flex-direction: column;
		gap: 0.15rem;
		max-width: 40ch;
		margin: 0 auto;
		text-align: center;
	}
	h1 {
		font-weight: 300;
		font-family: system-serif, cursive, 'Times New Roman', Times, serif;
		margin: 0;
	}
	p {
		opacity: 0.8;
		font-size: 1em;
		font-weight: 500;
	}
	:root {
		background: hsl(0, 0%, 25%);
		color: aliceblue;
	}
	.links {
		margin: 1rem;
		position: fixed;
		bottom: 0;

		& a {
			color: inherit;
		}
	}

	main {
		display: flex;
		padding: 10vh 10vw;
		flex-direction: column;
		gap: 3em;
		align-items: center;
	}
	.whisper {
		opacity: 0.5;
		font-style: italic;
	}
</style>
