import SideNavBar from "@/components/layout/SideNavBar";
import DistributionsExplorer from "@/components/probability/DistributionsExplorer";

export default function DistributionsPage() {
  return (
    <div className="flex min-h-screen bg-background">
      <SideNavBar />

      <main className="flex-1 overflow-y-auto px-10 py-12 max-w-screen-xl mx-auto">
        {/* Header */}
        <div className="mb-10">
          <p className="text-[10px] font-bold uppercase tracking-widest text-secondary mb-3">
            Probability &amp; Statistics
          </p>
          <h1 className="font-headline text-5xl text-on-surface leading-tight mb-4">
            Probability
            <br />
            Distributions
          </h1>
          <p className="text-base font-body text-on-surface-variant max-w-md leading-relaxed">
            A distribution describes the full shape of uncertainty — not just the average outcome, but every possible value and how likely each one is.
          </p>
        </div>

        {/* Two-column layout */}
        <div className="grid grid-cols-12 gap-8">
          {/* Editorial left */}
          <div className="col-span-4 space-y-7">

            <div className="bg-surface-container-low rounded-3xl p-7 space-y-4">
              <h2 className="font-headline text-xl text-on-surface">What is a Distribution?</h2>
              <p className="text-sm font-body text-on-surface-variant leading-relaxed">
                A probability distribution is a mathematical function that assigns a likelihood to every possible outcome. For a discrete random variable, this is the <strong>probability mass function</strong> (PMF). For a continuous variable, it&apos;s the <strong>probability density function</strong> (PDF).
              </p>
              <p className="text-sm font-body text-on-surface-variant leading-relaxed">
                The total area under any PDF — or the sum of all PMF values — always equals 1. Probability is conserved.
              </p>
            </div>

            <div className="bg-surface-container-low rounded-3xl p-7 space-y-5">
              <h2 className="font-headline text-xl text-on-surface">Three Distributions</h2>

              <div className="space-y-1">
                <p className="text-xs font-bold text-primary uppercase tracking-wider">Normal N(μ, σ²)</p>
                <p className="text-sm font-body text-on-surface-variant leading-relaxed">
                  The iconic bell curve. Symmetric around μ, scaling in spread by σ. The Central Limit Theorem guarantees that sums of independent random variables converge toward it.
                </p>
              </div>

              <div className="space-y-1">
                <p className="text-xs font-bold text-secondary uppercase tracking-wider">Binomial B(n, p)</p>
                <p className="text-sm font-body text-on-surface-variant leading-relaxed">
                  Count the successes in <em>n</em> independent coin flips, each landing heads with probability <em>p</em>. The shape shifts from right-skewed (small p) to symmetric (p = 0.5) to left-skewed (large p).
                </p>
              </div>

              <div className="space-y-1">
                <p className="text-xs font-bold text-tertiary uppercase tracking-wider">Poisson Pois(λ)</p>
                <p className="text-sm font-body text-on-surface-variant leading-relaxed">
                  Models rare events in a fixed interval — emails per hour, bus arrivals, radioactive decays. A single parameter λ controls both mean and variance.
                </p>
              </div>
            </div>

            <div className="bg-surface-container-low rounded-3xl p-7 space-y-4">
              <h2 className="font-headline text-xl text-on-surface">Shape Parameters</h2>
              <div className="space-y-3">
                {[
                  {
                    term: "Location (μ)",
                    def: "Shifts the entire distribution left or right without changing its shape.",
                  },
                  {
                    term: "Scale (σ)",
                    def: "Stretches or squeezes the spread. Larger σ means more uncertainty.",
                  },
                  {
                    term: "Shape (skew)",
                    def: "Asymmetry. The Binomial with p ≠ 0.5 and Poisson with small λ are right-skewed.",
                  },
                ].map(({ term, def }) => (
                  <div key={term}>
                    <p className="text-xs font-bold text-on-surface mb-0.5">{term}</p>
                    <p className="text-xs font-body text-on-surface-variant leading-relaxed">{def}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-secondary/10 rounded-3xl px-6 py-5 flex gap-3">
              <span className="material-symbols-outlined text-secondary mt-0.5 text-lg">lightbulb</span>
              <p className="text-sm font-body text-on-surface-variant leading-relaxed">
                <strong className="font-semibold text-secondary">Tip:</strong> As n → ∞ and p → 0 with np = λ fixed, the Binomial(n, p) converges to Poisson(λ). This is the <em>law of rare events</em>.
              </p>
            </div>
          </div>

          {/* Interactive right */}
          <div className="col-span-8">
            <DistributionsExplorer />
          </div>
        </div>
      </main>
    </div>
  );
}

