import { SvelteComponent } from 'svelte'

export class ConnectModal extends SvelteComponent<{
	config: Config<Connector>
	state: Readable<StateDisconnected<Connector>>
	btnClass: string
	triggerText: string
	onConnect: (fractl: Config<Connector>) => void
	onConnectFail: (error: unknown) => void
}> {}
