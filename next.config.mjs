/** @type {import('next').NextConfig} */
const nextConfig = {
	images: {
		remotePatterns: [
			{
				hostname: 'sleek-bulldog-114.convex.cloud',
			},
		],
	},
};

export default nextConfig;
