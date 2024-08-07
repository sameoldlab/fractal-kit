import { derived } from 'svelte/store'
import ConnectModal from './components/ConnectModal/ConnectModal.svelte'
import type {
	Config,
	Connector,
	State,
	StateConnected,
	StateDisconnected
} from '@fractl-ui/types'
import { unmount, mount } from 'svelte'
import { SvelteMap } from 'svelte/reactivity'
const SINGLETON = 'fractl-connect'

export type CreateProps<C extends Connector> = {
	namespaces: Config<C>[]
}
export const createFractl = <C extends Connector>({
	namespaces,
	...props
}: CreateProps<C>) => {
	const connectors = new SvelteMap(
		namespaces.map((c) => [c.namespace, c.connectors])
	)
	const connections = new Map(namespaces.map((c) => [c.namespace, []]))
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
				if (curr.status === 'connected') return curr
				if (curr.status === 'connecting' || curr.status === 'reconnecting')
					return curr
				return {
					current: null,
					status: 'disconnected'
				}
			})
			set(t)
		},
		{
			current: null,
			status: 'disconnected'
		} as State<C>
	)
	let state = $state({
		current: null,
		status: 'disconnected'
	} satisfies State<C>)
	stateStore.subscribe(($s) => {
		state = $s
		console.log($state.snapshot(state))
	})

	const isConnected = $derived(state.status === 'connected')

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
		connect: (): Promise<() => Promise<Config<C>>> =>
			new Promise((resolve, reject) => {
				if (isConnected) reject('Already Connected')

				const modal = mount(ConnectModal, {
					target: getTarget(SINGLETON),
					props: {
						connectors: connectorArr,
						state: stateStore,
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
