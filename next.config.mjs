/** @type {import('next').NextConfig} */
const nextConfig = {
    // Optimize for production performance
    reactStrictMode: false, // Disable in production to avoid double renders
    poweredByHeader: false, // Remove X-Powered-By header
    compress: true, // Enable gzip compression
    
    // Static export requires unoptimized images
    images: {
        unoptimized: true,
    },
    
    webpack: (config, { isServer, webpack }) => {
        if (!isServer) {
            config.resolve.fallback = {
                ...config.resolve.fallback,
                fs: false,
                net: false,
                tls: false,
                child_process: false,
                'fs/promises': false,
                crypto: false,
                readline: false,
            }

            // Handle node: protocol imports by replacing them with empty modules
            config.plugins.push(
                new webpack.NormalModuleReplacementPlugin(
                    /^node:/,
                    (resource) => {
                        resource.request = resource.request.replace(/^node:/, '');
                    }
                )
            );
        }

        return config
    },
    transpilePackages: ['@0glabs/0g-serving-broker'],
    output: 'export',
    trailingSlash: false, // Change to false for better SPA behavior
    
    // Optimize bundle splitting
    experimental: {
        optimizePackageImports: ['dexie', '@0glabs/0g-serving-broker'],
    },
}

export default nextConfig
