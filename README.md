# Box Breathing Timer

Free online tool for morning anxiety relief. Built with Next.js 14, React 18, TypeScript, and Tailwind CSS.

**Status**：✅ MVP ready — 跑在 `http://localhost:3000`

## Features

- ✅ Multiple breathing patterns: Box (4-4-4-4), 4-7-8, Calm (5-2-7), Energizing (6-0-2)
- ✅ Adjustable session length: 1m / 3m / 5m / 10m
- ✅ Visual animated circle that scales with breath
- ✅ Progress ring + cycle counter
- ✅ Mobile-responsive
- ✅ Zero dependencies on external services (no API calls, no analytics, no tracking)
- ✅ Static export ready (`output: 'export'`)
- ✅ FAQ + Open Graph + Twitter Card SEO

## Run Locally

```bash
# Install dependencies
npm install

# Start dev server
npm run dev
# → http://localhost:3000

# Build for production (static export to ./out)
npm run build
```

## Deploy

Static export — drop the `out/` folder on any static host:
- Vercel (drag & drop)
- Netlify
- Cloudflare Pages
- Any Nginx/Apache

## SEO

- Title: "Box Breathing Timer — Free 4-4-4-4 Tool for Morning Anxiety"
- Schema: FAQPage embedded
- Internal links to 4 cluster articles (placeholder for now)
- Meta description optimized for "box breathing timer" + "morning anxiety"

## 📁 Project Structure

```
web/
├── app/
│   ├── components/
│   │   ├── BreathingTimer.tsx    # Main interactive component
│   │   ├── BreathingCircle.tsx   # Animated SVG circle
│   │   ├── SEOSection.tsx        # Below-the-fold content
│   │   └── FAQ.tsx               # FAQ accordion + schema
│   ├── globals.css
│   ├── layout.tsx                # SEO meta
│   ├── page.tsx                  # Home = tool
│   ├── robots.ts
│   └── sitemap.ts
├── lib/
│   ├── breathing-patterns.ts     # Pattern definitions
│   └── useTimer.ts               # Custom hook
├── public/
├── next.config.js
├── tailwind.config.ts
└── package.json
```

## 🚧 Roadmap (V2)

- [ ] PWA support (installable, offline)
- [ ] Background sounds (white noise, rain)
- [ ] Mobile haptics
- [ ] History tracking (localStorage)
- [ ] Animation preference (respect `prefers-reduced-motion`)
- [ ] Localization (i18n)
- [ ] Custom pattern editor

## 📊 Performance

- First Load JS: 89.7 kB
- Page size (HTML): ~35 kB
- Static pre-rendered, no SSR runtime cost
- Zero external API calls

## 🧪 Test It

1. Visit `http://localhost:3000`
2. Click "Box Breathing (4-4-4-4)" — should be selected by default
3. Click "▶ Start" — circle should expand over 4s, hold, contract, hold
4. Watch the progress bar and cycle counter
5. Click "↻ Reset" to restart
6. Try 4-7-8 pattern (longer hold + exhale)

