import TopNavBar from "@/components/layout/TopNavBar";
import SideNavBar from "@/components/layout/SideNavBar";
import ProbabilitySimulator from "@/components/probability/CoinFlipSimulator";
import ConceptAccordion from "@/components/probability/ConceptAccordion";

export default function BasicProbabilityPage() {
  return (
    <div className="min-h-screen">
      <TopNavBar />
      <SideNavBar />

      <main className="lg:ml-72 pt-24 min-h-screen">
        <div className="max-w-[1400px] mx-auto px-8 md:px-12 py-8 grid grid-cols-12 gap-10">
          {/* Editorial content */}
          <section className="col-span-12 lg:col-span-4 space-y-10">
            <header>
              <h1 className="text-5xl font-headline text-on-surface leading-tight mb-4">
                Basic Probability
              </h1>
              <p className="text-on-surface-variant/80 font-headline italic text-xl">
                Foundations of Stochastic Thought
              </p>
            </header>

            <article className="space-y-8">
              <div className="space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-[0.1em] text-secondary">
                  The Three Axioms
                </h3>
                <p className="font-body text-on-surface-variant leading-relaxed">
                  Kolmogorov&apos;s axioms form the bedrock of probability
                  theory. They are not proofs, but the shared rules of
                  engagement for any random system.
                </p>
              </div>

              <div className="p-6 bg-surface-container-low rounded-xl space-y-4 border-l-4 border-primary">
                <div className="flex gap-4">
                  <span className="text-2xl font-headline italic text-primary flex-shrink-0">
                    I.
                  </span>
                  <p className="font-body text-sm leading-relaxed text-on-surface-variant">
                    The probability of any event is a non-negative real number:{" "}
                    <span className="bg-surface-container-highest px-1 rounded italic text-on-surface">
                      P(E) ≥ 0
                    </span>
                    .
                  </p>
                </div>
                <div className="flex gap-4">
                  <span className="text-2xl font-headline italic text-primary flex-shrink-0">
                    II.
                  </span>
                  <p className="font-body text-sm leading-relaxed text-on-surface-variant">
                    The probability that at least one elementary event in the
                    entire sample space will occur is 1:{" "}
                    <span className="bg-surface-container-highest px-1 rounded italic text-on-surface">
                      P(Ω) = 1
                    </span>
                    .
                  </p>
                </div>
                <div className="flex gap-4">
                  <span className="text-2xl font-headline italic text-primary flex-shrink-0">
                    III.
                  </span>
                  <p className="font-body text-sm leading-relaxed text-on-surface-variant">
                    Any countable sequence of disjoint sets satisfies the
                    property of σ-additivity.
                  </p>
                </div>
              </div>

              <p className="font-body text-on-surface-variant leading-relaxed">
                In the sandbox to your right, you can observe these axioms in
                motion. As the number of trials increases, the relative
                frequency of an event will converge to its theoretical
                probability — a phenomenon known as the{" "}
                <span className="text-on-surface font-semibold underline decoration-secondary/30">
                  Law of Large Numbers
                </span>
                .
              </p>
            </article>

            <div className="pt-4">
              <div className="flex items-center gap-3 text-sm font-bold text-on-surface-variant/40 mb-2">
                <span className="material-symbols-outlined text-base">
                  lightbulb
                </span>
                <span>INTERACTIVE TIP</span>
              </div>
              <p className="text-sm text-on-surface-variant/60 font-body">
                Try switching to dice roll to see how the distribution spreads
                uniformly across 6 outcomes as trials increase.
              </p>
            </div>

            {/* Concept links */}
            <div className="pt-4 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-[0.1em] text-on-surface-variant/50">
                Core Concepts
              </h3>
              <ConceptAccordion />
            </div>
          </section>

          {/* Interactive canvas */}
          <section className="col-span-12 lg:col-span-8">
            <ProbabilitySimulator />
          </section>
        </div>
      </main>

      {/* FAB */}
      <button className="fixed bottom-8 right-8 w-14 h-14 bg-gradient-to-br from-secondary to-secondary-container text-white rounded-full shadow-2xl flex items-center justify-center hover:rotate-12 transition-transform z-50">
        <span className="material-symbols-outlined text-xl">question_mark</span>
      </button>
    </div>
  );
}
