/** @type {import('next').NextConfig} */
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

const nextConfig = {
  reactStrictMode: false, // Disabled to prevent double renders in development
  swcMinify: true,
  // Use basePath if set, otherwise empty (works at root)
  basePath: basePath,
  assetPrefix: basePath,
  images: {
    unoptimized: true,
  },
  // Enable styled-components
  compiler: {
    styledComponents: true,
  },
  // Optimize build performance
  experimental: {
    // Enable SWC minification (already enabled via swcMinify)
    optimizePackageImports: [
      'antd',
      '@ant-design/icons',
      '@ant-design/pro-components',
      'react-icons',
      'feather-icons-react',
      'recharts',
      'apexcharts',
      'react-apexcharts',
      'react-beautiful-dnd',
      'react-leaflet',
      'styled-components',
    ],
    // Reduce build output size (requires critters package)
    // optimizeCss: true, // Disabled - requires critters, can enable after installing
  },
  // Disable source maps in production for faster builds (optional - comment out if you need them)
  productionBrowserSourceMaps: false,
  // Webpack configuration for compatibility and performance
  webpack: (config, { isServer, dev, webpack }) => {
    // Fix for node modules that need to be transpiled
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    };

    // Optimize module resolution for faster builds
    config.resolve.symlinks = false;
    
    // Use faster resolution strategies
    config.resolve.modules = ['node_modules', ...(config.resolve.modules || [])];
    config.resolve.mainFields = ['browser', 'module', 'main'];
    
    // Cache webpack modules for faster rebuilds (both dev and production)
    // Next.js handles caching automatically, but we can optimize it
    // Note: Let Next.js manage cache directory to avoid ENOENT errors
    if (!config.cache) {
      config.cache = {
        type: 'filesystem',
        buildDependencies: {
          config: [__filename],
        },
        // Let Next.js/webpack manage the cache directory automatically
        cacheDirectory: undefined,
      };
    }
    
    // Reduce bundle analyzer overhead
    config.performance = {
      hints: false,
      maxEntrypointSize: 512000,
      maxAssetSize: 512000,
    };

    // Exclude unnecessary files from compilation
    config.module.exprContextCritical = false;
    config.ignoreWarnings = [
      { module: /node_modules/ },
      { module: /\.test\./ },
      { module: /\.spec\./ },
    ];
    
    // Reduce bundle parsing for faster builds (these settings may not be needed in newer webpack)
    // Removed deprecated webpack module properties
    
    // Optimize module resolution caching
    config.snapshot = {
      ...config.snapshot,
      managedPaths: [/^(.+?[\\/]node_modules[\\/])/],
      immutablePaths: [],
      buildDependencies: {
        hash: true,
        timestamp: true,
      },
      module: {
        timestamp: true,
      },
      resolve: {
        timestamp: true,
      },
      resolveBuildDependencies: {
        hash: true,
        timestamp: true,
      },
    };

    // Handle SVG imports
    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack'],
    });

    // Optimize chunk splitting for faster builds (both dev and production)
    config.optimization = {
      ...config.optimization,
      moduleIds: dev ? 'named' : 'deterministic',
      chunkIds: dev ? 'named' : 'deterministic',
      ...(dev ? {} : { runtimeChunk: 'single' }),
      splitChunks: {
        chunks: 'all',
        maxInitialRequests: 25,
        minSize: 20000,
        cacheGroups: {
          default: false,
          vendors: false,
          // React and React-DOM chunk (highest priority)
          react: {
            name: 'react',
            test: /[\\/]node_modules[\\/](react|react-dom|scheduler)[\\/]/,
            chunks: 'all',
            priority: 40,
            reuseExistingChunk: true,
            enforce: true,
          },
          // Ant Design chunk (large library)
          antd: {
            name: 'antd',
            test: /[\\/]node_modules[\\/]antd[\\/]/,
            chunks: 'all',
            priority: 35,
            reuseExistingChunk: true,
            enforce: true,
          },
          // Chart libraries chunk
          charts: {
            name: 'charts',
            test: /[\\/]node_modules[\\/](recharts|apexcharts|react-apexcharts|chart\.js|react-chartjs-2)[\\/]/,
            chunks: 'all',
            priority: 30,
            reuseExistingChunk: true,
          },
          // Router chunk
          router: {
            name: 'router',
            test: /[\\/]node_modules[\\/](react-router|@remix-run)[\\/]/,
            chunks: 'all',
            priority: 25,
            reuseExistingChunk: true,
          },
          // Vendor chunk for other node_modules
          vendor: {
            name: 'vendor',
            chunks: 'all',
            test: /[\\/]node_modules[\\/]/,
            priority: 20,
            reuseExistingChunk: true,
            minChunks: 2,
          },
          // Common chunk for shared code (only in production)
          ...(dev ? {} : {
            common: {
              name: 'common',
              minChunks: 2,
              chunks: 'async',
              priority: 10,
              reuseExistingChunk: true,
            },
          }),
        },
      },
      // Reduce optimization passes for faster builds
      ...(dev ? {} : {
        removeAvailableModules: true,
        removeEmptyChunks: true,
        mergeDuplicateChunks: true,
      }),
    };

    return config;
  },
  // Note: We don't use rewrites here because Next.js with basePath
  // automatically handles API routes. The fetch patch in src/utils/nextAuthPatch.js
  // handles client-side API calls to include the base path.
  // Environment variables
  env: {
    PUBLIC_URL: basePath,
    REACT_APP_API_ENDPOINT: process.env.NEXT_PUBLIC_API_ENDPOINT || '',
    // Make NEXTAUTH_URL available to client-side code
    // NextAuth client needs this to construct correct API URLs with base path
    NEXT_PUBLIC_NEXTAUTH_URL: process.env.NEXTAUTH_URL || '',
  },
};

module.exports = nextConfig;
