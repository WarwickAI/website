/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  basePath: "/website",
  images: {
    unoptimized: true,
  },
};

module.exports = nextConfig;
