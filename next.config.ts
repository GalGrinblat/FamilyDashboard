import type { NextConfig } from "next";

const securityHeaders = [
  // Prevent clickjacking
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  // Prevent MIME-type sniffing
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Control referrer information
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Only allow HTTPS after first visit (1 year, includeSubDomains)
  {
    key: "Strict-Transport-Security",
    value: "max-age=31536000; includeSubDomains",
  },
  // Restrict browser features
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
  // Basic Content-Security-Policy (tighten per-environment as needed)
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // Next.js requires unsafe-inline/eval in dev; lock down in prod
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: blob:",
      "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://generativelanguage.googleapis.com",
      "frame-ancestors 'none'",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
