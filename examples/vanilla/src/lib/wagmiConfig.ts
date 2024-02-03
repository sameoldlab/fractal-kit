import { http, createConfig, createStorage } from '@wagmi/core'
import { mock, walletConnect } from '@fractl-ui/evm'
import { mainnet, arbitrum } from '@wagmi/core/chains'

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

/* 
const starkent: Chain = {

}
const stark: Config = {
	_internal,
	chains: starknet,
	connectors,
	getClient,
	setState: ,
	state: {
		chainId: 0,
		connections: {},
		current: undefined,
		status: 'reconnecting'
	},
	subscribe: (selector, listener, options) => {
		
	}
} 

interface Conf {
	state: {
		chainId: number,
		connections: Map<string | Connection>
		current: string | undefined
		status: "reconnecting" | "connected" | "connecting" | "disconnected"
	}
	connectors: {
		id: string
		name: string
		icon?: string

	}
	chains: Chain[]
	account: null
	connect: null
	disconnect: null
	subscribe: null
} */
