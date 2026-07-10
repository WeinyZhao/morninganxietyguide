export default function FAQ() {
  const faqs = [
    {
      q: "Is box breathing scientifically proven to reduce anxiety?",
      a: "Yes. Multiple studies show that slow, controlled breathing (especially with extended exhales) reduces cortisol, lowers heart rate, and activates the parasympathetic nervous system. The 4-4-4-4 pattern is one of the most studied and is used by the U.S. military for stress control.",
    },
    {
      q: "How long should I do box breathing for morning anxiety?",
      a: "3-5 minutes is the sweet spot. One minute can interrupt a panic spiral; five minutes trains your nervous system to default to calm. Start with 1 minute and work up.",
    },
    {
      q: "Can I use this timer lying in bed?",
      a: "Yes. Many people use box breathing first thing in the morning before getting out of bed. Keep your phone within arm's reach and start the timer before your eyes fully open.",
    },
    {
      q: "Is this timer really free? Do I need to sign up?",
      a: "Completely free. No signup, no email, no download. It runs in your browser. No data is collected or sent to any server.",
    },
    {
      q: "What's the difference between box breathing and 4-7-8 breathing?",
      a: "Box breathing uses equal 4-second phases (inhale-hold-exhale-hold), while 4-7-8 has a longer hold (7s) and exhale (8s). 4-7-8 is more sedating — better for sleep. Box breathing is more balancing — better for focus and steady calm.",
    },
    {
      q: "How many times a day should I do this?",
      a: "Once in the morning is enough for most people. If you have a particularly anxious day, do another 1-3 minute session before lunch or in the afternoon.",
    },
  ];

  // FAQ schema
  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <section className="max-w-3xl mx-auto px-4 py-12">
      <h2 className="text-2xl font-bold mb-6 text-center">
        Frequently Asked Questions
      </h2>
      <div className="space-y-4">
        {faqs.map((f, i) => (
          <details
            key={i}
            className="group bg-white dark:bg-brand-900/30 border border-brand-200 dark:border-brand-800 rounded-lg p-4"
          >
            <summary className="cursor-pointer font-semibold text-brand-800 dark:text-brand-200 flex justify-between items-center">
              {f.q}
              <span className="text-brand-400 group-open:rotate-180 transition-transform">
                ▼
              </span>
            </summary>
            <p className="mt-3 text-brand-700 dark:text-brand-300">{f.a}</p>
          </details>
        ))}
      </div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
    </section>
  );
}
