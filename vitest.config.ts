import { defineConfig } from 'vitest/config';
import swc from 'unplugin-swc';
import path from 'node:path';

export default defineConfig({
    plugins: [
        swc.vite({
            module: { type: 'es6' },
        }),
    ],
    test: {
        globals: true,
        root: './',
        environment: 'node',
        include: ['test/**/*.e2e-spec.ts', 'test/**/*.spec.ts'],
        testTimeout: 30000,
        hookTimeout: 30000,
        pool: 'forks',
        poolOptions: {
            forks: {
                singleFork: true,
            },
        },
        coverage: {
            provider: 'v8',
            reporter: ['text', 'json', 'html'],
        },
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, 'src'),
        },
    },
});