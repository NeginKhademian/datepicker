import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";

const nextConfig: NextConfig = {
  output: "export",
  basePath: isProd ? "/datepicker" : undefined,
  assetPrefix: isProd ? "/datepicker/" : undefined,
  // …other settings
};


export default nextConfig;
