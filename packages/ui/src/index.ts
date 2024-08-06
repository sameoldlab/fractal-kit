import { derived, get, writable } from 'svelte/store'
import ConnectModal from './components/ConnectModal/ConnectModal.svelte'
import type { Config, Connector, State, StateConnected, StateDisconnected } from '@fractl-ui/types'
import {unmount, mount} from 'svelte'

export type CreateProps<C extends Connector> = {
	namespaces: Config<C>[]
}
export const createFractl = <C extends Connector>(
	{namespaces, ...props}: CreateProps<C>
) => {
	const connectors = new Map(namespaces.map(c => [c.namespace, c.connectors]))
	const connections = new Map()
	const SINGLETON = 'fractl-connect'
	const connectorArr = [...connectors.entries()].flatMap(([chain, config]) => config.map(c=> [chain, c]) )
	console.log(connectorArr)
	const state = derived(namespaces.map(c => c.state), ($state, set) => {
		const t = $state.reduce((acc, curr) => {
			// No change if already connected, else return the first state with an active status
			// Active ranking: 1. connected 2. reconnecting 3. connecting 4. disconnected
			if  (acc.status === 'connected') return acc
			if  (curr.status === 'connected') return curr
			if  (curr.status === 'connecting' || curr.status === 'reconnecting') return curr
			return {
				current: null,
				status:'disconnected'
			}
		})
		console.log(t)
		set(t)
	}, Object.freeze({
				current: null,
				status:'disconnected'
			} satisfies State<C>))
	let isConnected = false
	state.subscribe($s => {
		isConnected = $s.status === 'connected'
	})
	const config = {
		connectors: connectorArr,
		state,
		isConnected
	}


	return {
		...config,
		connect: (): Promise<() => Promise<Config<C>>> => 
		new Promise((resolve, reject) => {
			const modal = mount(ConnectModal,{
				target: getTarget(SINGLETON),
				props: {
					config: config,
					state: config.state,
					onConnect: (state: Config<C>) => {
						resolve(state)
						unmount(modal)
					},
					onConnectFail: (error) => {
						reject(error)
						unmount(modal)
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
