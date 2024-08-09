import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import { svelteTesting } from '@testing-library/svelte/vite'

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [svelte(), svelteTesting()],
	test: {
		include: ["src/**/*.{test,test.svelte}.{js,ts}"],
		environment: "jsdom",
		includeSource: ["src/**/*.{js,ts,svelte}"],
		setupFiles: ["./vitest-setup.ts"],
	}
})
