interface Props {
  title: string;
  description: string;
  url: string;
}

export default function ArticleSchema({ title, description, url }: Props) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    description: description,
    url: url,
    author: {
      "@type": "Organization",
      name: "Morning Anxiety Guide",
    },
    publisher: {
      "@type": "Organization",
      name: "Morning Anxiety Guide",
      logo: {
        "@type": "ImageObject",
        url: "https://morninganxietyguide.com/logo.png",
      },
    },
    datePublished: "2026-07-10",
    dateModified: "2026-07-10",
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
