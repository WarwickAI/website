/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  basePath: "/website/website",
  images: {
    unoptimized: true,
  },
};

module.exports = nextConfig;
