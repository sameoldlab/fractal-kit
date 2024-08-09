import type { AccountData, AccountDataResponse, Config } from '@fractl-ui/types'
import {
	connect as wagmiConnect,
	reconnect,
	disconnect,
	getAccount,
	getBalance,
	getEnsName,
	getEnsAvatar,
	type Connector,
	type Config as wagmiConfig,
	type GetEnsNameReturnType,
	type GetEnsAvatarReturnType
} from '@wagmi/core'
import { formatUnits } from 'viem/utils'
import { map } from 'nanostores'
import { getUri } from './connect.js'

type WagmiConfig = Config<Connector>

/**
 * Provides connection details to fractl-modal passed into it's config parameter
 */
export const eip155 = (config: wagmiConfig): WagmiConfig => {
	const state = map({
		current: config.state.connections.get(config.state.current),
		status: config.state.status
	})

	config.subscribe(
		(state) => state.current,
		(current) => state.setKey('current', config.state.connections.get(current))
	)
	config.subscribe(
		(state) => state.status,
		(status) => {
			state.setKey('status', status)
		}
	)

	type WatchAccountProps = {
		address: `0x${string}`
		resolver?: string
	}
	const watchAccount = ({ address, resolver }: WatchAccountProps) => {
		resolver = resolver ?? 'ENS'
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
				const _balance = await getBalance(config, { address })
				const balance: AccountDataResponse['balance'] = {
					symbol: _balance.symbol,
					value: formatUnits(_balance.value, _balance.decimals)
				}
				account.setKey('balance', balance)

				let name: GetEnsNameReturnType, avatar: GetEnsAvatarReturnType
				switch (resolver) {
					default:
						name = await getEnsName(config, {
							address,
							blockTag: 'finalized'
						})

						avatar =
							name &&
							(await getEnsAvatar(config, {
								name,
								blockTag: 'finalized'
							}))
				}
				account.setKey('nameService', { name, avatar })
				console.debug(account.get())
			} catch (error) {
				console.error('fetch error', error, account.get())
			}
		})()
		return account
	}

	const connect = (connector: Connector) => async () => {
		const { accounts, chainId } = await wagmiConnect(config, { connector })
		return { accounts, chainId }
	}

	return {
		namespace: 'eip155',
		state: { subscribe: state.subscribe },
		get connectors() {
			const conn = config.connectors.map((c) => {
				c.fractl = { getUri: {}, connect: {} }

				if (c.id === 'walletConnect')
					c.fractl.getUri = async (callback: (uri: string) => void) =>
						await getUri(c, callback)

				c.fractl.connect = connect(c)
				return c
			})
			return conn
		},
		watchAccount,
		reconnect: async (connectors: Connector[]) =>
			await reconnect(config, { connectors }),
		disconnect: async (connector?: Connector) =>
			disconnect(config, { connector: connector })
	}
}
