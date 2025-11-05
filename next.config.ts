import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";
import nextra from "nextra";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const withNextra = nextra({});

const nextConfig: NextConfig = {
  /* config options here */
};

export default withNextIntl(withNextra(nextConfig));
