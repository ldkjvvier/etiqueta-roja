/** @type {import('next').NextConfig} */
const nextConfig = {
	// accept all from all sites
	images: {
		remotePatterns: [
			{
				protocol: 'https',
				hostname: '**',
				port: '',
			},
		],
	},
}

export default nextConfig
