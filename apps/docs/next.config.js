const withNextra = require('nextra')({
  theme: 'nextra-theme-docs',
  themeConfig: './theme.config.tsx',
});

module.exports = withNextra({
  images: {
    remotePatterns: [
      // {
      // 	protocol: "https",
      // 	hostname: "res.cloudinary.com",
      // 	pathname: "/dxxswax97/image/upload/**",
      // },
    ],
  },
  distDir: 'build',
});
