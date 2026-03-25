# The Digital Atheneum — Interactive Probability & ML

An interactive educational platform for learning Probability Theory and Machine Learning concepts, built with Next.js 15 and TypeScript. Inspired by the visual and animation style of [Seeing Theory](https://seeing-theory.brown.edu/).

![Next.js](https://img.shields.io/badge/Next.js-15.5-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8?logo=tailwindcss)

---

## Modules

| Module | Path | Description |
|---|---|---|
| Basic Probability | `/probability/basic` | Coin flip & dice roll simulator with bias controls, animated results, and frequency bar charts |
| Expectation | `/probability/expectation` | Weighted die simulator with convergence chart and live E[X] formula |
| Distributions | `/probability/distributions` | Interactive Normal, Binomial, and Poisson distributions with E[X], σ, and P5/P25/P75/P95 percentile overlays |
| Linear Regression | `/ml/regression` | Draggable regression line with MSE calculation and residual visualisation |
| Classification | `/ml/classification` | Decision boundary playground with canvas-rendered regions and adjustable parameters |
| Decision Trees | `/ml/decision-trees` | Step-by-step tree builder with depth slider and a loan approval scenario |
| Neural Networks | `/ml/neural-networks` | Layered network visualiser with interactive weight/bias controls |

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18 or later
- npm (comes with Node.js)

### Install & Run

```bash
# Clone the repository
git clone https://github.com/<your-username>/<your-repo>.git
cd <your-repo>

# Install dependencies
npm install

# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build

```bash
npm run build
npm start
```

---

## Deploying

### Vercel (recommended — zero config)

1. Push this repository to GitHub
2. Go to [vercel.com](https://vercel.com) → **New Project** → import the repo
3. Click **Deploy** — Vercel auto-detects Next.js, no settings needed

### Netlify

1. Push to GitHub
2. In Netlify: **Add new site** → **Import an existing project** → select the repo
3. Set build command to `npm run build` and publish directory to `.next`
4. Deploy

### GitHub Pages (static export)

Add the following to `next.config.ts`:

```ts
const nextConfig = {
  output: 'export',
};
```

Then run `npm run build` — the static site will be in the `out/` folder. Push that folder to a `gh-pages` branch or configure GitHub Pages to serve from it.

---

## Project Structure

```
src/
├── app/                        # Next.js App Router pages
│   ├── page.tsx                # Home / curriculum overview
│   ├── globals.css             # Global styles + animation keyframes
│   ├── probability/
│   │   ├── basic/page.tsx
│   │   ├── expectation/page.tsx
│   │   └── distributions/page.tsx
│   └── ml/
│       ├── regression/page.tsx
│       ├── classification/page.tsx
│       ├── decision-trees/page.tsx
│       └── neural-networks/page.tsx
└── components/
    ├── layout/
    │   ├── TopNavBar.tsx
    │   └── SideNavBar.tsx
    ├── probability/
    │   ├── CoinFlipSimulator.tsx
    │   ├── ExpectationSimulator.tsx
    │   └── DistributionsExplorer.tsx
    ├── regression/
    ├── classification/
    ├── decision-trees/
    └── neural-networks/
```

---

## Tech Stack

- **[Next.js 15](https://nextjs.org/)** — App Router, static generation
- **[TypeScript](https://www.typescriptlang.org/)** — full type safety
- **[Tailwind CSS 3](https://tailwindcss.com/)** — utility-first styling with a custom neutral token palette
- **[Google Fonts](https://fonts.google.com/)** — Noto Serif (headlines) + Inter (body)
- **[Material Symbols](https://fonts.google.com/icons)** — icon set
- SVG + Canvas — all visualisations are hand-rolled (no chart library dependency)

---

## License

MIT
