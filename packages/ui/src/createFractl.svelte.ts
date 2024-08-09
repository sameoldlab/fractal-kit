import { derived, get } from 'svelte/store'
import ConnectModal from './components/ConnectModal/ConnectModal.svelte'
import type { AccountData, Config, Connector, State } from '@fractl-ui/types'
import { unmount, mount } from 'svelte'
import { SvelteMap } from 'svelte/reactivity'
import { FiniteStateMachine } from './utils/stateMachine.svelte.js'
import svelteFsm from './utils/svelte-fsm.js'
const SINGLETON = 'fractl-connect'

export type CreateProps = {
	namespaces: Config<Connector>[]
}
type Connection = {
	address: string
	chain_id: { namespace: string; reference: string }
	connector: Connector
}

type States = 'connected' | 'connecting' | 'disconnected'
export function createFractl2({ namespaces }: CreateProps) {
	const adapters = new Map(namespaces.map((ns) => [ns.namespace, ns]))
	const connections = new Map()

	const machine = {
		connected: {
			getCurrent(namespace: string | undefined) {},
			disconnect(connector: Connector) {
				return 'disconnected'
			}
		},
		connecting: {
			_enter(params) {
				console.log(params)
			}
		},
		disconnected: {
			reconnect({
				namespace,
				connector
			}: {
				namespace: string | undefined
				connector: Connector | undefined
			}) {
				const adapter = namespace
					? adapters.get(namespace)
					: [...adapters.values()][0]
				if (!adapter) return
				adapter.reconnect(connector)
				return 'connecting'
			},
			connect({
				namespace,
				connector
			}: {
				namespace: string | undefined
				connector: Connector | undefined
			}) {
				const adapter = namespace
					? adapters.get(namespace)
					: [...adapters.values()][0]
				if (!adapter) return
				adapter.connect(connector)
				return 'connecting'
			},
			_enter() {
				/* If reconnect === true check for existing connections on initialization */
			}
		},
		'*': {
			call(namespace: string, action: 'disconnect', ...args) {
				return adapters.get(namespace)?.[action](args)
			}
		}
	}
	return svelteFsm('disconnected', machine)
}

class FractlState<C extends Connector> {
	status: State<C>['status'] = $state('disconnected')
	current: Connection | undefined = $state()
}

type Actions<C extends Connector> = {
	getAccount: () => AccountData
	disconnect: (connector: C) => Promise<void>
}
class FractlActions<C extends Connector> {
	namespaces = new SvelteMap<string, Actions<C>>()

	get(namespace: string) {
		return this.namespaces.get(namespace)
	}
}
export const actions = new FractlActions()

export const createFractl = <C extends Connector>({
	namespaces,
	...props
}: CreateProps<C>) => {
	const connectors = new SvelteMap<string, readonly C[]>()
	/**
	 * Maps wallets within a namespace by random hash.
	 * Considered address+walletId, but not sure if this is actually unique
	 */ // But yes a nested map is a bit odd, and might affect reactivity
	const connections = new Map(
		namespaces.map(
			(c) => [c.namespace, new Map()] as [string, Map<string, Connection>]
		)
	)
	namespaces.forEach((ns) => {
		connectors.set(ns.namespace, ns.connectors)
		actions.namespaces.set(ns.namespace, {
			disconnect: ns.disconnect,
			getAccount: () => get(ns.accountData)
		})
	})

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
		get state() {
			return fState
		},
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
}

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

type MyStates = "disabled" | "idle" | "running";
type MyEvents = "toggleEnabled" | "start" | "stop";
const f = new FiniteStateMachine<MyStates, MyEvents>("disabled", {
  disabled: {
    toggleEnabled: "idle"
  },
  idle: {
    toggleEnabled: "disabled",
    start: "running"
  },
  running: {
    _enter: () => {
      f.debounce(2000, "stop");
    },
    stop: "idle",
    toggleEnabled: "disabled"
  }
});

f
