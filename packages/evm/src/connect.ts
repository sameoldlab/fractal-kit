import {EthereumProvider} from '@walletconnect/ethereum-provider'
import type { Connector } from '@wagmi/core'
type Provider = Awaited<ReturnType<(typeof EthereumProvider)['init']>>

export const getUri = async (connector: Connector, callback: (uri: string)=>void) => {
	const provider = await connector.getProvider() as Provider
	if (!provider) return
	console.log(provider)
	provider.on('display_uri', callback)
	provider.connect()
}

