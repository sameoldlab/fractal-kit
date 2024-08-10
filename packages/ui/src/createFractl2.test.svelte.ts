import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createFractl2 } from './createFractl2.svelte.js'
import { eip155 } from '@fractl-ui/evm'
import { mockConfig } from '../lib/wagmiConfig.js'

describe('FiniteStateMachine', () => {
	describe('simple toggle switch', () => {
		let fctl = createFractl2({
			namespaces: [eip155(mockConfig)]
		})
		const life = fctl.help()

		/* beforeEach(() => {
			fctl = createFractl2({
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
			// console.log('CONNECTORS: ', connectors)
			const connecting = fctl.connect(connectors[0][1])
			expect(fctl.state).toBe('connecting')
			await connecting
			expect(fctl.state).toBe('connected')
		})

		const connection = fctl.connections.entries().next()
		it('Lists active connections', () => {
			expect(connection).not.toBeUndefined()
		})
		//add another test when I figure out how to represent connections

		it("returns a given account's data", () => {
			const address = connection.address
			const data = fctl.call('watchAccount', {
				address
			})
			expect(data).toHaveProperty('name')

			// should wait for network here somehow?
			// and also something less brittle than V's ENS
			expect(data.name).toBe('vitalik.eth')
		})

		it('changes state when disconnected', () => {
			expect(fctl.disconnect()).toBe('disconnected')
		})
	})
})
