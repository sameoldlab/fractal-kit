import { resolve } from 'path'
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'

export default defineConfig({
	plugins: [
		dts({
			entryRoot: 'src',
			outDir: 'dist'
		})
	],
	build: {
		sourcemap: true,
		lib: {
			entry: resolve(__dirname, './src/index.ts'),
			name: '@fractl-ui/evm',
			fileName: 'index'
		},
		rollupOptions: {
			treeshake: true,
			external: ['@walletconnect/ethereum-provider', '@wagmi/core', 'viem'],
			output: {
				globals: {
					'@wagmi/core': 'wagmi',
					'@walletconnect/ethereum-provider': 'walletconnect-ethereum-provider'
				}
			}
		}
	}
})
