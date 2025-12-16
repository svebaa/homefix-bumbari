export function getSiteUrl() {
  // Always prefer NEXT_PUBLIC_SITE_URL for consistency across deployments
  // This ensures OAuth redirects use the same URL regardless of deployment
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL;
  }

  // Fallback to VERCEL_URL only if NEXT_PUBLIC_SITE_URL is not set
  if (process.env.VERCEL && process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  return "http://localhost:3000";
}
