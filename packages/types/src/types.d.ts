import type { MapStore } from 'nanostores'

type Store<T extends object> = {
	subscribe: MapStore<T>['subscribe']
}

export type AccountDataError = {
	account: null
	balance: null
	nameService: {
		name: null
		avatar: null
	}
}

export type AccountDataResponse = {
	account: {
		address: string
		addresses: string[]
	}
	balance: {
		value: string
		symbol: string
	}

	nameService:
		| {
				name: null
				avatar: null
		  }
		| {
				name: string
				avatar: string | null
		  }
}

export type AccountData = AccountDataError | AccountDataResponse

export type Connector<T = object> = {
	name: string
	type?: string
	icon?: string
} & T

export type StateConnected<Connector> = {
	activeRequest?: null
	current: Connector
	status: 'connected'
}

export type StateDisconnected<Connector> = {
	activeRequest?: Connector | null
	current: null
	status: 'connecting' | 'disconnected' | 'reconnecting'
}

export type State<C> = StateConnected<C> | StateDisconnected<C>

export type ConfigDisconnected<Connector> = {
	state: Store<StateDisconnected<Connector>>
	accountData: Store<AccountDataError>
}

export type ConfigConnected<C extends Connector> = {
	state: Store<StateConnected<C>>
	accountData: Store<AccountDataResponse>
}

export type Config<C extends Connector> = {
	/**
		CAIP-2 Blockchain ID for the supported blockchain type
		example namespaces: eip155, cosmos, starknet, bip155, solana
		https://chainagnostic.org/CAIPs/caip-2
	*/
	namespace: string
	connectors: readonly C[]
	connect: (connector: C) => Promise<unknown> /* fix later */
	/**
	 * Checks if a connector in the list is already connected
	 * then sets the first one found as the current Connector
	 * @param {C[]} connectors list of Connectors for the given library
	 * @returns
	 */
	reconnect: (connectors: C[]) => Promise<void>
	disconnect: (connector?: C, opts?: object) => Promise<void>
} & (ConfigDisconnected<C> | ConfigConnected<C>)

export {}
