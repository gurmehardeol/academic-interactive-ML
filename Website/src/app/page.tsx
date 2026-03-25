import Link from "next/link";
import TopNavBar from "@/components/layout/TopNavBar";
import SideNavBar from "@/components/layout/SideNavBar";

const probabilityModules = [
  {
    href: "/probability/basic",
    icon: "calculate",
    title: "Basic Probability",
    description: "Foundations of chance, events, and sample spaces.",
  },
  {
    href: "/probability/expectation",
    icon: "trending_up",
    title: "Expectation",
    description: "Visualizing average outcomes and the law of large numbers.",
  },
  {
    href: "/probability/distributions",
    icon: "bar_chart",
    title: "Distributions",
    description: "Normal, Poisson, and Bernoulli models in motion.",
  },
];

const mlModules = [
  {
    href: "/ml/regression",
    icon: "timeline",
    title: "Regression",
    lessons: "4 Lessons",
  },
  {
    href: "/ml/classification",
    icon: "polyline",
    title: "Classification",
    lessons: "6 Lessons",
  },
  {
    href: "/ml/decision-trees",
    icon: "account_tree",
    title: "Decision Trees",
    lessons: "3 Lessons",
  },
  {
    href: "/ml/neural-networks",
    icon: "psychology",
    title: "Neural Networks",
    lessons: "12 Lessons",
  },
];

export default function CurriculumOverview() {
  return (
    <div className="min-h-screen">
      <TopNavBar />
      <SideNavBar />

      <main className="lg:ml-72 pt-24 pb-12 px-8 md:px-16 min-h-screen">
        <div className="max-w-6xl mx-auto">
          {/* Hero Header */}
          <header className="mb-16">
            <h1 className="font-headline text-5xl md:text-6xl text-[#3C3946] mb-4 leading-tight">
              Master the language of{" "}
              <span className="italic text-primary">data</span>.
            </h1>
            <p className="max-w-2xl font-body text-lg text-on-surface-variant leading-relaxed">
              Explore statistical concepts and algorithmic foundations through
              immersive interactive visualizations designed for clarity and
              depth.
            </p>
          </header>

          {/* Bento Layout Curriculum */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            {/* Probability Track */}
            <section className="md:col-span-5 flex flex-col gap-6">
              <div className="flex items-center gap-4 mb-2">
                <div className="h-[2px] w-8 bg-secondary" />
                <h2 className="font-headline text-2xl text-[#3C3946]">
                  Probability
                </h2>
              </div>

              {probabilityModules.map((mod) => (
                <Link
                  key={mod.href}
                  href={mod.href}
                  className="group relative bg-surface-container-low rounded-xl p-6 transition-all hover:bg-surface-container-high border-l-4 border-transparent hover:border-secondary"
                >
                  <div className="flex gap-6 items-start">
                    <div className="w-20 h-20 rounded-lg bg-surface-container-lowest flex items-center justify-center text-primary overflow-hidden shadow-sm flex-shrink-0">
                      <span
                        className="material-symbols-outlined text-3xl"
                        style={{
                          fontVariationSettings: "'FILL' 1",
                        }}
                      >
                        {mod.icon}
                      </span>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-headline text-lg text-on-surface mb-1">
                        {mod.title}
                      </h3>
                      <p className="text-sm text-on-surface-variant leading-snug">
                        {mod.description}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </section>

            {/* Separator */}
            <div className="hidden md:block md:col-span-1" />

            {/* Machine Learning Track */}
            <section className="md:col-span-6 flex flex-col gap-6">
              <div className="flex items-center gap-4 mb-2">
                <div className="h-[2px] w-8 bg-primary" />
                <h2 className="font-headline text-2xl text-[#3C3946]">
                  Machine Learning
                </h2>
              </div>

              {/* ML Bento Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {mlModules.map((mod) => (
                  <Link
                    key={mod.href}
                    href={mod.href}
                    className="group bg-surface-container-low rounded-xl p-6 transition-all hover:bg-surface-container-high relative overflow-hidden"
                  >
                    <div className="absolute -right-2 -bottom-2 opacity-10">
                      <span className="material-symbols-outlined text-7xl">
                        {mod.icon}
                      </span>
                    </div>
                    <span className="material-symbols-outlined text-primary mb-4 block">
                      {mod.icon}
                    </span>
                    <h3 className="font-headline text-lg text-on-surface mb-1">
                      {mod.title}
                    </h3>
                    <p className="text-xs text-on-surface-variant uppercase tracking-wider font-bold">
                      {mod.lessons}
                    </p>
                  </Link>
                ))}
              </div>

              {/* Featured Section */}
              <div className="bg-[#e6e0f1] rounded-xl p-8 flex flex-col md:flex-row gap-8 items-center border border-white/20">
                <div className="flex-1">
                  <span className="font-sans uppercase text-[10px] tracking-[0.2em] font-bold text-secondary mb-2 block">
                    Featured Interaction
                  </span>
                  <h3 className="font-headline text-2xl text-on-surface mb-3">
                    Deep Learning Playground
                  </h3>
                  <p className="text-on-surface-variant text-sm mb-6 leading-relaxed">
                    Tweak weights, adjust biases, and watch your neural network
                    learn in real-time. Our most advanced visualization yet.
                  </p>
                  <Link
                    href="/ml/neural-networks"
                    className="bg-primary text-white px-6 py-2 rounded-xl text-sm font-bold active:scale-95 transition-transform inline-block hover:bg-primary/90"
                  >
                    Start Learning
                  </Link>
                </div>
                <div className="w-full md:w-48 h-32 rounded-lg bg-surface-container-lowest/50 relative overflow-hidden flex-shrink-0">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20" />
                  {/* Abstract network visualization */}
                  <svg
                    className="w-full h-full opacity-40"
                    viewBox="0 0 192 128"
                  >
                    <circle cx="32" cy="40" r="8" fill="#006496" />
                    <circle cx="32" cy="88" r="8" fill="#006496" />
                    <circle cx="96" cy="28" r="6" fill="#64bdff" />
                    <circle cx="96" cy="64" r="6" fill="#64bdff" />
                    <circle cx="96" cy="100" r="6" fill="#64bdff" />
                    <circle cx="160" cy="64" r="10" fill="#964900" />
                    <line
                      x1="32"
                      y1="40"
                      x2="96"
                      y2="28"
                      stroke="#006496"
                      strokeWidth="1.5"
                      strokeOpacity="0.6"
                    />
                    <line
                      x1="32"
                      y1="40"
                      x2="96"
                      y2="64"
                      stroke="#006496"
                      strokeWidth="1.5"
                      strokeOpacity="0.6"
                    />
                    <line
                      x1="32"
                      y1="88"
                      x2="96"
                      y2="64"
                      stroke="#006496"
                      strokeWidth="1.5"
                      strokeOpacity="0.6"
                    />
                    <line
                      x1="32"
                      y1="88"
                      x2="96"
                      y2="100"
                      stroke="#006496"
                      strokeWidth="1.5"
                      strokeOpacity="0.6"
                    />
                    <line
                      x1="96"
                      y1="28"
                      x2="160"
                      y2="64"
                      stroke="#64bdff"
                      strokeWidth="1.5"
                      strokeOpacity="0.6"
                    />
                    <line
                      x1="96"
                      y1="64"
                      x2="160"
                      y2="64"
                      stroke="#64bdff"
                      strokeWidth="1.5"
                      strokeOpacity="0.6"
                    />
                    <line
                      x1="96"
                      y1="100"
                      x2="160"
                      y2="64"
                      stroke="#64bdff"
                      strokeWidth="1.5"
                      strokeOpacity="0.6"
                    />
                  </svg>
                </div>
              </div>
            </section>
          </div>

          {/* Footer */}
          <footer className="mt-20 flex flex-col md:flex-row justify-between items-center py-8 border-t border-[#bfc7d1]/20">
            <div className="flex gap-8 mb-4 md:mb-0">
              <a
                href="#"
                className="flex items-center gap-2 text-[#3C3946]/60 hover:text-primary transition-colors"
              >
                <span className="material-symbols-outlined text-sm">
                  menu_book
                </span>
                <span className="font-sans uppercase text-[10px] tracking-widest font-bold">
                  Glossary
                </span>
              </a>
              <a
                href="#"
                className="flex items-center gap-2 text-[#3C3946]/60 hover:text-primary transition-colors"
              >
                <span className="material-symbols-outlined text-sm">
                  library_books
                </span>
                <span className="font-sans uppercase text-[10px] tracking-widest font-bold">
                  References
                </span>
              </a>
            </div>
            <p className="text-[10px] font-sans font-bold text-[#3C3946]/40 uppercase tracking-[0.3em]">
              The Academic Interactive © 2024
            </p>
          </footer>
        </div>
      </main>

      {/* FAB */}
      <div className="fixed bottom-8 right-8 z-40 hidden md:block">
        <Link
          href="/probability/basic"
          className="flex items-center gap-3 bg-gradient-to-br from-primary to-primary-container text-white px-6 py-4 rounded-full shadow-lg hover:shadow-xl transition-all active:scale-90"
        >
          <span className="font-bold text-sm tracking-wide">
            Continue: Probability
          </span>
          <span className="material-symbols-outlined text-sm">
            arrow_forward
          </span>
        </Link>
      </div>
    </div>
  );
}
