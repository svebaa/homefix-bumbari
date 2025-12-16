const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "jisijxlaemsnrrkyhbgo.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default nextConfig;
