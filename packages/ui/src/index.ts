import ConnectModal from './components/ConnectModal/ConnectModal.svelte'
import type { Config, Connector } from '@fractl-ui/types'

export const create = async <C extends Connector>(
	config: Promise<Config<C>>
): Promise<() => Promise<Config<C>>> => {
	const _config = await Promise.resolve(config)
	const SINGLETON = 'fractl-connect'

	return () => {
		const getTarget = () => {
			const el = document.getElementById(SINGLETON)
			if (el) {
				//TODO: target only gives a mount point. Need a way of calling show instead to avoid deleting each time
				el.remove()
			}
			const target = document.createElement('div')
			target.id = SINGLETON
			document.body.appendChild(target)

			return target
		}

		return new Promise((resolve, reject) => {
			const modal = new ConnectModal({
				target: getTarget(),
				props: {
					config: _config,
					state: _config.state,
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
