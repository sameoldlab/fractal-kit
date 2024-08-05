import type {
	AccountData,
	AccountDataError,
	AccountDataResponse,
	Config,
	State
} from '@fractl-ui/types'
import { Fuel, type FuelConfig, FuelConnector } from '@fuel-wallet/sdk'
import { BN, Provider, Wallet } from 'fuels'
import { map, type MapStore } from 'nanostores'

type FuelConnectionProps = {
	config?: FuelConfig
	providerUrl: string
	autoconnect: boolean
}
type FuelConnectionObj = Config<FuelConnector>

/**
 * Provides connection details to fractl-modal passed into it's config parameter
 */
export const fuel = async (
	{ config, providerUrl, autoconnect }: FuelConnectionProps = {
		autoconnect: true,
		providerUrl: 'https://beta-5.fuel.network/graphql'
	}
): Promise<FuelConnectionObj> => {
	const fuel = new Fuel(config)

	let connectors = await fuel.connectors()
	fuel.on(fuel.events.connectors, (c) => (connectors = c))

	const state = map({
		activeRequest: null,
		current: null,
		status: 'disconnected'
	}) satisfies MapStore<State<FuelConnector>>
	/* Update current connector on page load and then listen for changes */
	if (autoconnect) {
		fuel.isConnected().then((connected) => {
			if (connected) {
				const connector = fuel.currentConnector()
				connector && state.setKey('current', connector)
			} else console.log('disconnected')
		})
	}

	fuel.on(fuel.events.currentConnector, (connector) =>
		state.setKey('current', connector)
	)

	/* Update status */
	state.subscribe(($s, changedKey) => {
		if ($s.activeRequest) return state.setKey('status', 'connecting')
		if ($s.current) return state.setKey('status', 'connected')
		state.setKey('status', 'disconnected')
		changedKey === 'status' && updateAccount($s.status)
	})

	const noAcc: AccountDataError = {
		account: null,
		balance: null,
		nameService: {
			name: null,
			avatar: null
		}
	}

	/* Manage Account Data */
	const accountData = map(noAcc) satisfies MapStore<AccountData>

	/* Update accountData when connection status changes */
	/* 	state.subscribe(
		($s, changedKey) =>
			changedKey === 'status' && updateAccount($s.status)
	) */

	/* Fuel uses bech32 addresses. consider adding this to address type */
	const setAccount = async (address: string) => {
		const addresses = await fuel.accounts()
		accountData.setKey('account', { address, addresses })
	}
	fuel.on(fuel.events.currentAccount, setAccount)

	async function updateAccount(
		status: 'connected' | 'connecting' | 'disconnected' | 'reconnecting'
	) {
		if (status !== 'connected') {
			accountData.set(noAcc)
			return
		}

		const address = await fuel.currentAccount()
		if (!address) throw Error('account is not connected')

		const provider = await Provider.create(providerUrl)
		const wallet = Wallet.fromAddress(address, provider)
		try {
			/* If using getBalance instead (singular) need to programatically get base asset ID */
			wallet.getBalances().then((data) => {
				if (data === undefined || data[0] === undefined) return
				const balance: AccountDataResponse['balance'] = {
					symbol: data[0].assetId,
					value: `${new BN(data[0].amount).toNumber()}`
				}
				accountData.setKey('balance', balance)
			})

			console.log(accountData.get())
		} catch (error) {
			console.log(accountData.get())
			console.error('fetch error', error)
		}
	}

	return {
		namespace: 'fuel',
		state: { subscribe: state.subscribe },
		accountData: { subscribe: accountData.subscribe },
		get connectors() {
			return connectors
		},
		connect: async (connector) => {
			state.setKey('activeRequest', connector)
			await fuel.selectConnector(connector.name)
			/* throw error if selectConnector fails  */

			const connectionSuccess = await fuel.connect()
			state.setKey('activeRequest', null)
			return connectionSuccess
		},
		/*
		 Fuel SDK will actually disconnect the wallet on the extenstion's end.
		 This means reconnecting is not automatic if the user disconnects. But connections 
		 will persist across reloads without saving to local storage. 

		 Disconnecting could be faked by setting state.current to null,
		 this would match closer with how most other packages work, but be further 
		 from how developers used to fuel expect it to work, i.e. connection state 
		 between fuels and @fractl-ui/fuel would be inconsistent.  
		 */
		reconnect: async (connectors) => {
			/* If already co */
			const current = fuel.currentConnector()
			if (current) {
				connectors.includes(current)

				connectors.forEach(async (connector) => {
					await fuel.selectConnector(connector.name)
					fuel.connect()
				})
			}
		},
		disconnect: async () => {
			await fuel.disconnect()
		}
	}
}
