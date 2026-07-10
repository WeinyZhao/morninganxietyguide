import BreathingTimer from "./components/BreathingTimer";
import SEOSection from "./components/SEOSection";
import FAQ from "./components/FAQ";

export default function Home() {
  return (
    <main>
      {/* Hero */}
      <header className="text-center pt-3 sm:pt-12 pb-1 sm:pb-4 px-4 bg-gradient-to-b from-brand-50 to-transparent dark:from-brand-900/30">
        <h1 className="text-2xl sm:text-5xl font-bold text-brand-900 dark:text-brand-50 mb-1 sm:mb-3">
          Box Breathing Timer
        </h1>
        <p className="text-sm sm:text-lg text-brand-700 dark:text-brand-300 max-w-xl mx-auto">
          Calm your morning anxiety in 5 minutes. Free, no signup.
        </p>
      </header>

      {/* The Tool */}
      <BreathingTimer />

      {/* SEO Content */}
      <SEOSection />

      {/* FAQ */}
      <FAQ />

      {/* Related Articles (internal links) */}
      <section className="max-w-3xl mx-auto px-4 py-12 border-t border-brand-200 dark:border-brand-800">
        <h2 className="text-2xl font-bold mb-6 text-center">
          Continue Your Morning Anxiety Journey
        </h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            {
              title: "Box Breathing for Morning Anxiety (5-Minute Guide)",
              desc: "Our most popular technique with a 7-day challenge.",
              href: "/box-breathing-morning-anxiety",
            },
            {
              title: "The Complete Guide to Morning Anxiety Relief",
              desc: "A 7-step evidence-based system.",
              href: "/morning-anxiety-relief",
            },
            {
              title: "4-7-8 Breathing: The 2-Minute Anxiety Killer",
              desc: "Dr. Andrew Weil's relaxing breath.",
              href: "/4-7-8-breathing-morning-anxiety",
            },
            {
              title: "5 Breathing Exercises to Do in Bed",
              desc: "Start your day calm without leaving the sheets.",
              href: "/breathing-exercises-in-bed",
            },
          ].map((link, i) => (
            <a
              key={i}
              href={link.href}
              className="block p-4 bg-white dark:bg-brand-900/30 border border-brand-200 dark:border-brand-800 rounded-lg hover:border-brand-400 transition-colors"
            >
              <div className="font-semibold text-brand-800 dark:text-brand-200">
                {link.title}
              </div>
              <div className="text-sm text-brand-600 dark:text-brand-400 mt-1">
                {link.desc}
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="text-center py-8 text-sm text-brand-600 dark:text-brand-400 border-t border-brand-200 dark:border-brand-800 mt-8">
        <p>
          © 2026 Morning Anxiety Guide. This tool is educational and not a
          substitute for professional medical advice.
        </p>
      </footer>
    </main>
  );
}
