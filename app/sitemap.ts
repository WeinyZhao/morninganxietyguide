import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    {
      url: "https://morninganxietyguide.com/",
      lastModified: now,
      changeFrequency: "monthly",
      priority: 1.0,
    },
    {
      url: "https://morninganxietyguide.com/morning-anxiety-relief",
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.95,
    },
    {
      url: "https://morninganxietyguide.com/box-breathing-morning-anxiety",
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: "https://morninganxietyguide.com/4-7-8-breathing-morning-anxiety",
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.9,
    },
  ];
}
