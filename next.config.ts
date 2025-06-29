import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";

const nextConfig: NextConfig = {
  // This tells Next to emit static HTML rather than a Node server bundle
  output: "export",

  // In prod builds we need to set the base path & asset prefix so
  // all URLs resolve under your repo name (/datepicker)
  ...(isProd && {
    basePath: "/datepicker",
    assetPrefix: "/datepicker/",
  }),

  // …any other config options you already have
};

export default nextConfig;
