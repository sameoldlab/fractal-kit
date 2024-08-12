import SN, {
	type StarknetWindowObject,
	type ConnectedStarknetWindowObject
} from 'get-starknet-core'
import { map, type MapStore } from 'nanostores'
import type { AccountData, Config, State } from '@fractl-ui/types'
import { RpcProvider, defaultProvider, Contract, constants } from 'starknet'
import { formatUnits } from './utils/formatUnits.js'
import ethABI from './abi/ethABI.js'

const ETH_ADDR =
	'0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7'
const DECIMALS = 18

type SNProvider = { type: string } & StarknetWindowObject
/* 
	TODO: Test with metamask snap
	Integrate Walletconnect
*/
type StarknetConnectProps = {
	starknetVersion?: 'v4' | 'v5' | undefined
	/**
	 * Defaults to a list of preauthorized or available wallets
	 */
	connectors: SNProvider[]
	/* opt to include install link when no wallet is available */
	/**
	 * If `true` reconnects to the first available connected wallet in `connectors`
	 */
	autoconnect: boolean

	provider: RpcProvider
	clearLastWallet?: boolean | undefined
}
export const starknet = async (
	{
		starknetVersion,
		connectors,
		autoconnect,
		provider,
		clearLastWallet
	}: StarknetConnectProps = {
		starknetVersion: 'v5',
		connectors: [],
		autoconnect: false,
		provider: new RpcProvider({
			nodeUrl: constants.RPC_MAINNET_NODES[0],
			retries: 2
		})
	}
): Promise<Config<SNProvider>> => {
	/* Check if user passed in any connectors. If empty get connectors from preauthorized wallets. */
	if (connectors.length === 0) {
		// SN.getDiscoveryWallets().then((res) => connectors.installable.push(...res))
		// SN.getPreAuthorizedWallets().then((res) => connectors.push(...res))
		const authorized = await SN.getPreAuthorizedWallets()
		const available = (await SN.getAvailableWallets()).filter(
			(a) => !authorized.includes(a)
		)
		const _connectors = [...authorized, ...available].map((a) => {
			let type = 'injected'
			if (a.id !== 'braavos' && a.id !== 'argentX') type = 'unknown'
			return Object.assign(a, { type })
		})
		connectors.push(..._connectors)
	}

	// SN.getLastConnectedWallet().then((res) => (lastConnected = res))

	const state = map({
		activeRequest: null,
		current: null,
		status: 'disconnected'
	}) satisfies MapStore<State<StarknetWindowObject>>

	/* Update status */
	state.subscribe(($s) => {
		if ($s.activeRequest) return state.setKey('status', 'connecting')
		if ($s.current) return state.setKey('status', 'connected')
		state.setKey('status', 'disconnected')
	})
	// state.setKey('activeRequest', connectors.available[0])

	const setCurrent = (connector: StarknetWindowObject) =>
		connector.isConnected
			? state.setKey('current', connector)
			: Error(`${connector.name} is not connected`)

	if (autoconnect) {
		for (const connector of connectors) {
			if (connector.isConnected) {
				state.setKey('current', connector)
				setCurrent(connector)
			}
		}
	}

	type WatchAccountProps = { address: `0x${string}`; resolver?: string }
	const watchAccount = ({ address, resolver }: WatchAccountProps) => {
		resolver = resolver ?? 'STARKNET_ID'
		const account = map<AccountData>({
			address,
			balance: null,
			nameService: {
				name: null,
				avatar: null
			}
		})
		;(async function () {
			try {
				const eth = new Contract(ethABI, ETH_ADDR, defaultProvider)
				const balance = await eth.balanceOf(address)

				account.setKey('balance', {
					value: formatUnits(balance, DECIMALS),
					symbol: 'ETH'
				})

				let name,
					avatar = null
				switch (resolver) {
					default:
						name = await provider.getStarkName(address)
				}
				account.setKey('nameService', { name, avatar })
				console.debug(account.get())
			} catch (error) {
				console.error('fetch error', error, account.get())
			}
		})()
		return account
	}

	const connect =
		(connector = connectors[0]) =>
		async () => {
			if (connector === undefined) return
			/* Connect and reconnect are effectively the same thing as this does not keep a history of existing connections */
			// if (connector?.isConnected) throw Error('already connected')
			state.setKey('activeRequest', connector)
			try {
				await SN.enable(connector, { starknetVersion })
			} finally {
				state.setKey('activeRequest', null)
				setCurrent(connector)
			}
		}

	return {
		namespace: 'starknet',
		state: {
			subscribe: state.subscribe
		},
		get connectors() {
			const conn = connectors.map((c) => {
				c.fractl = { connect: {} }
				c.fractl.connect = connect(c)
				return c
			})
			return conn
		},
		// connect,
		// reconnect: async (connectors) =>
		// connectors.forEach(async (c) => await connect(c)),
		watchAccount,
		disconnect: async () => {
			await SN.disconnect({ clearLastWallet })
			state.setKey('current', null)
			console.log(state.get())
		}
	}
}
