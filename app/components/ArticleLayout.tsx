/**
 * ArticleLayout.tsx — Wrapper for all cluster MDX articles
 *
 * Why this exists:
 *  - Without a max-width container, article text stretches edge-to-edge on
 *    widescreen monitors (1280px+), making line length 200+ characters —
 *    way past the readable 65-75 character ideal. That was the bug that
 *    pushed text off the left edge of the viewport.
 *  - `max-w-3xl` (768px) keeps reading width comfortable; `mx-auto` centers
 *    it; `px-4 sm:px-6` gives breathing room on mobile.
 *  - `pt-8 pb-16` separates the article from nav/footer.
 */

import type { ReactNode } from "react";

export default function ArticleLayout({ children }: { children: ReactNode }) {
  return (
    <article className="max-w-3xl mx-auto px-4 sm:px-6 pt-8 pb-16">
      {children}
    </article>
  );
}
