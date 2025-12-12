// eslint.config.js
import next from '@next/eslint-plugin-next'
import react from 'eslint-plugin-react'
import hooks from 'eslint-plugin-react-hooks'
import { defineConfig } from 'eslint/config'
import globals from 'globals'
import tseslint from 'typescript-eslint'

export default defineConfig([
    {
        ignores: ['dist', 'node_modules', '.next'],
    },
    ...tseslint.configs.recommended,
    {
        plugins: {
            next,
        },
        ...next.configs['core-web-vitals'],
    },
    {
        plugins: { react, 'react-hooks': hooks },
        languageOptions: {
            ecmaVersion: 2023,
            sourceType: 'module',
            globals: globals.browser,
            parserOptions: {
                ecmaFeatures: {
                    jsx: true,
                },
            },
        },
        rules: {
            '@typescript-eslint/no-unused-vars': 'warn',
            'no-unused-vars': 'warn',

            'react-hooks/rules-of-hooks': 'error',
            'react-hooks/exhaustive-deps': 'warn',
        },
    },
])
