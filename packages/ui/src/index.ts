import { writable } from 'svelte/store'
import ConnectModal from './components/ConnectModal/ConnectModal.svelte'
import type { Config, Connector } from '@fractl-ui/types'
export type CreateProps<C extends Connector> = {
	namespaces: Config<C>[]
}
export const createFractl = <C extends Connector>(
	{namespaces, ...props}: CreateProps<C>
) => {
	const connectors = new Map(namespaces.map(c => [c.namespace, c.connectors]))
	console.log(connectors)
	const SINGLETON = 'fractl-connect'
	// Change this to a flat array
	const connectorArr = [...connectors.values()].flat(1)
	const state = writable({
		status: 'disconnected'
	})
	const config = {
		connectors: connectorArr,
		state
	}

	return {
		connect: (): Promise<() => Promise<Config<C>>> => 
		new Promise((resolve, reject) => {
			const modal = new ConnectModal({
				target: getTarget(SINGLETON),
				props: {
					config: config,
					state: config.state,
					onConnect: (state: Config<C>) => {
						resolve(state)
						modal.$destroy()
					},
					onConnectFail: (error) => {
						reject(error)
						modal.$destroy()
					}
				}
			})
		})
	}
}

// export T&C text prop
/*
{
	status: 'connecting' | 'disconnected' | 'reconnecting' | 'connected'
	primaryAccount: Account
	accounts: [
		address: ''
		balance
		name
		avatar
		wallet
	]
	connectors
}
*/
function getTarget(id: string) {
	const el = document.getElementById(id)
	if (el) {
		//TODO: target only gives a mount point. Need a way of calling show instead to avoid deleting each time
		el.remove()
	}
	const target = document.createElement('div')
	target.id = id
	document.body.appendChild(target)

	return target
}
