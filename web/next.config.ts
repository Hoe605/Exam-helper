import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  /* config options here */
  allowedDevOrigins: ['192.168.66.67', 'localhost:3000'],
};



export default withNextIntl(nextConfig);
