import type { NextConfig } from "next";
const config: NextConfig = {
  poweredByHeader: false,
  images: { qualities: [75, 85], deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 2560, 3840, 5120] },
};
export default config;
