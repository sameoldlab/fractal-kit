import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createFractl } from './createFractl.svelte.js'
import { eip155 } from '@fractl-ui/evm'
import { mockConfig } from '../lib/wagmiConfig.js'
import { get } from 'svelte/store'

describe('FiniteStateMachine', () => {
	describe('simple toggle switch', () => {
		let fctl = createFractl({
			namespaces: [eip155(mockConfig)]
		})

		/* beforeEach(() => {
			fctl = createFractl({
				namespaces: [eip155(mockConfig)]
			})
		}) */

		it('initializes disabled', () => {
			expect(fctl.state).toBe('disconnected')
		})

		it('contains a list of connectors', () => {
			const connectors = fctl.connectors
			expect(fctl.connectors.length).toBe(1)
		})

		it('switches states while connecting', async () => {
			const connectors = fctl.connectors
			const connecting = fctl.connect(connectors[0])
			expect(fctl.state).toBe('connecting')
			await connecting
			expect(fctl.state).toBe('connected')
		})

		it('Lists active connections', () => {
			expect(fctl.connections.entries().next().value).not.toBeUndefined()
		})
		//add another test when I figure out how to represent connections

		it("returns a given account's data", async () => {
			const connection = fctl.connections.values().next().value
			const address = connection.addresses[0]
			const namespace = connection.chain_id.namespace
			const data = fctl.call({
				action: 'watchAccount',
				namespace,
				args: address
			})
			expect(data).toHaveProperty('subscribe')
			expect(get(data).address).toEqual(address)
			// should wait for network here somehow?
			// and also something less brittle than V's ENS
			await expect
				.poll(() => get(data).name, { timeout: 5000 })
				.toBe('vitalik.eth')
		})

		it('changes state when disconnected', async () => {
			expect(fctl.state).toBe('connected')
			const res = fctl.disconnect()
			await res
			expect(fctl.state).toBe('disconnected')
		})
	})
})
