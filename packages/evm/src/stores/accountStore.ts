import { derived } from 'svelte/store'
import { getEnsName, getEnsAvatar, getBalance } from '@wagmi/core'
import { getAccount, type Config } from '@wagmi/core'
import type { Readable } from 'svelte/store'
import { formatUnits } from 'viem'

export const createAccountStore = (
	config: Readable<Config>,
	{ resolver } = { resolver: 'ENS' }
) => {
	const account = derived(config, ($conf) => {
		if ($conf.state.status !== 'connected') return undefined
		const account = getAccount($conf)
		if (!account.isConnected) throw Error('account is not connected')
		return account
	})

	const balance = derived([config, account], async ([$conf, $acc]) => {
		if (!$acc) return

		const _balance = await getBalance($conf, {
			address: $acc.address
		})

		/* Feels cursed... */
		const balance = {
			formatted: formatUnits(_balance.value, _balance.decimals),
			..._balance
		}
		return balance
	})

	const nameService = derived([config, account], async ([$conf, $acc]) => {
		let name: string | undefined, avatar: string | undefined
		if (!$acc) return { name, avatar }

		if (resolver === 'ENS') {
			name = await getEnsName($conf, {
				blockTag: 'finalized',
				address: $acc.address
			})

			avatar =
				name &&
				(await getEnsAvatar($conf, {
					name,
					blockTag: 'finalized'
				}))
		}
		return {
			name,
			avatar
		}
	})

	return {
		account,
		balance,
		nameService
	}
}
export default createAccountStore