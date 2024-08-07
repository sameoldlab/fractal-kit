import { derived } from 'svelte/store'
import ConnectModal from './components/ConnectModal/ConnectModal.svelte'
import type { Config, Connector, State } from '@fractl-ui/types'
import { unmount, mount } from 'svelte'
import { SvelteMap } from 'svelte/reactivity'
const SINGLETON = 'fractl-connect'

export type CreateProps<C extends Connector> = {
	namespaces: Config<C>[]
}

class FractlState<C extends Connector> {
	status: State<C>['status'] = $state('disconnected')
	current: State<C>['current'] = $state(null)
}

export const createFractl = <C extends Connector>({
	namespaces,
	...props
}: CreateProps<C>) => {
	const connectors = new SvelteMap(
		namespaces.map((c) => [c.namespace, c.connectors])
	)
	const connections = new Map(
		namespaces.map((c) => [c.namespace, []] as [string, C[]])
	)
	const connectorArr = [...connectors.entries()].flatMap(([chain, config]) =>
		config.map((c) => [chain, c] satisfies [string, C])
	)
	console.log(connectorArr)

	const stateStore = derived(
		namespaces.map((c) => c.state),
		($state, set) => {
			const t = $state.reduce((acc, curr) => {
				// No change if already connected, else return the first state with an active status
				// Active ranking: 1. connected 2. reconnecting 3. connecting 4. disconnected
				if (acc.status === 'connected') return acc
				if (acc.status === 'connecting' || acc.status === 'reconnecting')
					return acc
				if (curr.status === 'connected') return curr
				if (curr.status === 'connecting' || curr.status === 'reconnecting')
					return curr
				return curr
			})
			set(t)
		},
		{
			current: null,
			status: 'disconnected'
		} as State<C>
	)
	const fState = new FractlState()
	stateStore.subscribe(($s) => {
		fState.status = $s.status
		fState.current = $s.current
	})

	const isConnected = $derived(fState.status === 'connected')

	return {
		get connectors() {
			return connectorArr
		},
		get connections() {
			return connections
		},
		get isConnected() {
			return isConnected
		},
		connect: () =>
			new Promise<void>((resolve, reject) => {
				if (fState.status === 'connected') {
					return reject('Already Connected')
				}

				const modal = mount(ConnectModal, {
					target: getTarget(SINGLETON),
					props: {
						connectors: connectorArr,
						state: fState,
						onSuccess: (msg) => {
							connections.get(msg.namespace)?.push(msg.connector)
							unmount(modal)
							resolve()
						},
						onFailure: (error) => {
							reject(error)
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
