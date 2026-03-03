export default [
	{
		ignores: [
			'.next/**',
			'node_modules/**',
			'out/**',
			'build/**',
			'**/*.d.ts',
			'**/*.{ts,tsx}',
		],
	},
	{
		files: ['**/*.{js,mjs,cjs}'],
		languageOptions: {
			ecmaVersion: 'latest',
			sourceType: 'module',
		},
		rules: {},
	},
]
