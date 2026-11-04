/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  async rewrites() {
    return [
      { source: "/analytics", destination: "/Analytics" },
      { source: "/funds", destination: "/Funds" },
      { source: "/accounts", destination: "/ManageAccounts" },
      { source: "/login", destination: "/Login" },
    ];
  },
};

export default nextConfig;
