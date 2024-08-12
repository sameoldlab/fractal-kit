import { derived } from 'svelte/store'
// import ConnectModal from './components/ConnectModal/ConnectModal.svelte'
import type { AccountData, Config, Connector } from '@fractl-ui/types'
import { SvelteMap } from 'svelte/reactivity'

export type CreateProps = {
	namespaces: Config<Connector>[]
}
type Connection = Map<
	Connector,
	{
		addresses: string[]
		chain_id: { namespace: string; reference: string | number }
	}
>
/**
 * Maps wallets within a namespace by random hash.
 * Considered address+walletId, but not sure if this is actually unique
 */ // But yes a nested map is a bit odd, and might affect reactivity
class Connections {
	#value = $state<Connection>(new SvelteMap())
	add(connector, { addresses, chain_id }) {
		this.#value.set(connector, {
			addresses,
			chain_id
		})
	}
	get value() {
		return this.#value
	}
}

type States = 'connected' | 'connecting' | 'disconnected'
class Status {
	#value = $state<States>('disconnected')

	constructor(adapters: Map<string, Config<Connector>>) {
		const stateStore = derived(
			[...adapters.values()].map((c) => c.state),
			($state, set) => {
				const t = $state.reduce((status, curr) => {
					// No change if already connected, else return the first state with an active status
					// Active ranking: 1. connected 2. reconnecting 3. connecting 4. disconnected
					if (status === 'disconnected' && curr.status === 'disconnected')
						return 'disconnected'
					if (
						status === 'connecting' ||
						curr.status === 'connecting' ||
						curr.status === 'reconnecting'
					)
						return 'connecting'
					if (status === 'connected' || curr.status === 'connected')
						return 'connected'
					return 'disconnected'
				}, 'disconnected')
				set(t)
				console.log(t)
			},
			'disconnected'
		)
		stateStore.subscribe((status) => (this.#value = status))
	}
	get value() {
		return this.#value
	}
}
type AdapterActions = 'disconnect' | 'watchAccount' | 'connect' | 'reconnect'

export function createFractl({ namespaces }: CreateProps) {
	if (!namespaces || namespaces.length === 0) {
		console.warn('rtfm')
		throw new Error('No namespaces provided')
	}

	const adapters = $state(new Map(namespaces.map((ns) => [ns.namespace, ns])))
	const defaultAdapter: Config<Connector> = adapters.values().next().value
	const connectors = $state(new SvelteMap<string, readonly C[]>())
	const connectorArr = $derived(
		[...connectors.entries()].flatMap(([chain, config]) =>
			config.map((c) => [chain, c] satisfies [string, C])
		)
	)
	const connections = new Connections()
	const status = new Status(adapters)

	namespaces.forEach((ns) => {
		connectors.set(ns.namespace, ns.connectors)
		// actions.namespaces.set(ns.namespace, {
		// 	disconnect: ns.disconnect,
		// 	getAccount: () => get(ns.accountData)
		// })
	})

	const call = <A extends AdapterActions>({
		namespace,
		action,
		args
	}: {
		namespace: string
		action: A
		args: Config<Connector>[A]
	}) => {
		const adapter = adapters.get(namespace)
		console.debug(
			`Calling ${action} in ${namespace} with args: ${typeof args === 'object' ? '[Object]' : args}`
		)
		if (!adapter) {
			throw new Error(`Namespace does not exist.\nAvailable namespaces:  [${[...adapters.keys()]}]
				`)
		}
		return adapter[action](args)
	}

	const getCurrent = (namespace: string | undefined) => {
		if (namespace) {
			for (const [k, v] of connections.entries()) {
				if (k === namespace) return v
			}
		} else {
			return [...connections.entries()][0]
		}
	}
	const disconnect = (connector: Connector | undefined) => {
		connector = connector ?? [...connections.value.entries()][0][0]
		if (!connector) throw new Error('No connector available')
		let namespace = connections.value.get(connector)?.chain_id.namespace
		const adapter = connector ? adapters.get(namespace) : defaultAdapter

		call({
			namespace,
			action: 'disconnect',
			args: connector
		})
		/* disconnect given connector, or last Connection */
	}
	type ConnectionProps = [
		namespace: string | undefined,
		connector: Connector | undefined
	]

	const reconnect = ([namespace, connector]: ConnectionProps) => {
		const adapter = namespace ? adapters.get(namespace) : defaultAdapter
		if (!adapter) return
		// const action = call({ action: 'reconnect', namespace: adapter.namespace, args: connector })
		// return action
	}

	const connect = async ([namespace, connector]: ConnectionProps) => {
		const adapter = namespace ? adapters.get(namespace) : defaultAdapter
		if (!adapter) return
		connector = connector ?? connectorArr[0][1]
		if (!connector) return
		const action = connector.fractl.connect().then((res) => {
			connections.add(connector, {
				addresses: res.accounts,
				chain_id: { namespace, reference: res.chainId }
			})
		})
		// const action = call({ action: 'connect', namespace: adapter.namespace, args: connector })
		return action
	}

	return {
		call,
		connect,
		disconnect,
		get state() {
			return status.value
		},
		get connectors() {
			return connectorArr
		},
		get connections() {
			return connections.value
		},
		getCurrent() {
			return
		},
		getAccount({ namespace, address }) {
			call({ namespace, action: 'watchAccount', args: address })
		}
	}
}

type Actions<C extends Connector> = {
	getAccount: () => AccountData
	disconnect: (connector: C) => Promise<void>
}

/*
	/**
	 * Maps wallets within a namespace by random hash.
	 * Considered address+walletId, but not sure if this is actually unique
	 / // But yes a nested map is a bit odd, and might affect reactivity
const connections = new Map()
const connectors = new SvelteMap<string, readonly C[]>()
namespaces.forEach((ns) => {
	connectors.set(ns.namespace, ns.connectors)
})

const connectorArr = [...connectors.entries()].flatMap(([chain, config]) =>
	config.map((c) => [chain, c] satisfies [string, C])
)

return () =>
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
					connections.get(msg.namespace)?.set(msg.connector.uid, {
						address: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045',
						namespace: 'eip155',
						connector: msg.connector
					})
					fState.current = {
						address: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045',
						namespace: 'eip155',
						connector: msg.connector
					}
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
*/
// export T&C text prop
/*
{
	connectors: Map<nmspc, Connector>
	connections: Map<uid, Connection>
} & (
 | {
		status: 'connected'
		current: Connection
	} | {
		status: 'connecting' | 'disconnected' | 'reconnecting' 
		current: null,
	}
)
actions: Map< nmspc,  {
	getAccount(address, opts: {
		nameService: string | function,
		watchBalance: boolean
	}),
	disconnect,
	connect???
	transaction history...
}: any: () => F
>

type Connection = {
	address: string,
	namespace: string,
	connector: Connector
}

accounts: [
	address: ''
	balance
	name
	avatar
]
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
