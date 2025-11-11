export function getSiteUrl() {
  if (process.env.VERCEL) {
    if (process.env.VERCEL_URL) {
      return `https://${process.env.VERCEL_URL}`;
    }
  }

  return process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
}
