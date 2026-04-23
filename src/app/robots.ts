import { MetadataRoute } from "next";

const BASE_URL = process.env.NEXTAUTH_URL ?? "http://localhost:3000";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin/", "/dashboard/", "/cart/", "/checkout/", "/api/", "/learn/"],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
