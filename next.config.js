/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  webpack: (config, options) => {
    config.module.rules.push({
      test: /\.glsl/,
      type: "asset/source",
    })
    config.module.rules.push({
      test: /\.otf/,
      type: "asset/source",
      use: [
        {
          loader: 'file-loader',
          options: {
            name: '[name].[ext]',
            outputPath: 'static/media/', // Adjust the output path if needed
            publicPath: '/_next/static/media/', // Adjust the public path if needed
          },
        },
      ],
    })
    
    return config
  },
}

module.exports = nextConfig
