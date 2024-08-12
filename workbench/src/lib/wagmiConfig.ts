import { http, createConfig, createStorage } from '@wagmi/core'
import { mock, walletConnect } from '@wagmi/connectors'
import { mainnet, arbitrum } from '@wagmi/core/chains'
import { readable } from 'svelte/store'

const storage = createStorage({ storage: localStorage })

export const config = createConfig({
	chains: [mainnet, arbitrum],
	storage,
	transports: {
		[mainnet.id]: http(),
		[arbitrum.id]: http()
	},
	connectors: [
		mock({
			accounts: ['0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045']
		}),
		walletConnect({
			metadata: {
				name: 'Fractl',
				url: 'https://fractl.click',
				verifyUrl: 'https://fractl.click',
				icons: ['https://fractl.click/assets/fractl-I45eptSj.svg'],
				description: 'dapp UI Library'
			},
			projectId: '3baa16893e7c0a8e95029e58bed8768c',
			showQrModal: false
		})
	]
})

export const mockConfig = createConfig({
	chains: [mainnet, arbitrum],
	storage,
	transports: {
		[mainnet.id]: http(),
		[arbitrum.id]: http()
	},
	connectors: [
		mock({
			accounts: ['0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045']
		})
	]
})

export default readable(config, (set) => {
	config.subscribe(
		(state) => state.status,
		() => set(config)
	)
})
