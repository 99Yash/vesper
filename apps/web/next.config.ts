import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	typedRoutes: true,
	experimental: {
		browserDebugInfoInTerminal: true,
	},
	compiler: {
		removeConsole: process.env.NODE_ENV === "production",
	},
	webpack: (config, { isServer }) => {
		if (!isServer) {
			// Exclude server-side modules from client bundle
			config.resolve.fallback = {
				...config.resolve.fallback,
				fs: false,
				net: false,
				tls: false,
				crypto: false,
			};

			// Exclude keyv adapters that are causing the bundling issue
			config.externals = config.externals || [];
			config.externals.push({
				'@keyv/redis': 'commonjs @keyv/redis',
				'@keyv/mongo': 'commonjs @keyv/mongo',
				'@keyv/sqlite': 'commonjs @keyv/sqlite',
				'@keyv/postgres': 'commonjs @keyv/postgres',
				'@keyv/mysql': 'commonjs @keyv/mysql',
				'@keyv/etcd': 'commonjs @keyv/etcd',
				'@keyv/offline': 'commonjs @keyv/offline',
				'@keyv/tiered': 'commonjs @keyv/tiered',
			});
		}
		return config;
	},
};

export default nextConfig;
