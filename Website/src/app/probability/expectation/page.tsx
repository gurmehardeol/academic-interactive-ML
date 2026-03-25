import TopNavBar from "@/components/layout/TopNavBar";
import SideNavBar from "@/components/layout/SideNavBar";
import ExpectationSimulator from "@/components/probability/ExpectationSimulator";

export default function ExpectationPage() {
  return (
    <div className="min-h-screen">
      <TopNavBar />
      <SideNavBar />

      <main className="lg:ml-72 pt-24 min-h-screen">
        <div className="max-w-[1400px] mx-auto px-8 md:px-12 py-8 grid grid-cols-12 gap-10">
          {/* Editorial content */}
          <section className="col-span-12 lg:col-span-4 space-y-7">
            <header>
              <h1 className="text-5xl font-headline text-on-surface leading-tight mb-4">
                Expectation
              </h1>
              <p className="text-on-surface-variant/80 font-headline italic text-xl">
                The Center of Gravity of Chance
              </p>
            </header>

            <article className="space-y-6">

              {/* Plain-English intro */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold uppercase tracking-[0.1em] text-secondary">
                  In Plain English
                </h3>
                <p className="font-body text-on-surface-variant leading-relaxed">
                  Expected value answers the question: <em className="text-on-surface">"If I repeat this random experiment forever, what will my average outcome be?"</em>
                </p>
                <p className="font-body text-on-surface-variant leading-relaxed">
                  It is <strong className="text-on-surface">not</strong> the most likely single outcome. It&apos;s every possible outcome, each scaled by how probable it is, all added together.
                </p>
              </div>

              {/* Concrete example */}
              <div className="bg-secondary/8 border border-secondary/20 rounded-2xl p-5 space-y-3">
                <p className="text-[10px] font-bold uppercase tracking-widest text-secondary">
                  Worked Example — Casino Game
                </p>
                <p className="text-sm font-body text-on-surface-variant leading-relaxed">
                  You pay $1 to roll a fair die. You win $3 if you roll a 6, otherwise you get nothing. Should you play?
                </p>
                <div className="space-y-1 font-mono text-xs text-on-surface-variant bg-surface-container-lowest rounded-xl px-4 py-3">
                  <p>Win $3  →  P = 1/6    →  3 × (1/6) = <span className="text-tertiary font-bold">+$0.50</span></p>
                  <p>Win $0  →  P = 5/6    →  0 × (5/6) = <span className="text-outline">$0.00</span></p>
                  <div className="border-t border-outline-variant/20 mt-2 pt-2">
                    <p>E[payout] = <span className="text-primary font-bold">$0.50</span></p>
                    <p>Cost to play = <span className="text-secondary font-bold">$1.00</span></p>
                  </div>
                </div>
                <p className="text-sm font-body text-on-surface-variant leading-relaxed">
                  Your expected profit is <strong className="text-secondary">−$0.50 per game</strong>. Don&apos;t play.
                </p>
              </div>

              {/* Formula */}
              <div className="p-5 bg-surface-container-low rounded-2xl space-y-4 border-l-4 border-primary">
                <div className="space-y-2">
                  <p className="text-xs font-bold uppercase tracking-wider text-primary">Discrete formula</p>
                  <p className="font-body text-sm leading-relaxed text-on-surface-variant">
                    Multiply each possible value by its probability, then sum them all up:
                  </p>
                  <code className="block font-mono text-sm text-on-surface bg-surface-container-highest px-3 py-2 rounded-lg">
                    E[X] = Σ x · P(X = x)
                  </code>
                </div>
                <div className="space-y-2">
                  <p className="text-xs font-bold uppercase tracking-wider text-primary">Fair die example</p>
                  <code className="block font-mono text-[11px] text-on-surface-variant bg-surface-container-highest px-3 py-2 rounded-lg leading-loose">
                    E[X] = 1·(1/6) + 2·(1/6) + 3·(1/6)<br />
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;+ 4·(1/6) + 5·(1/6) + 6·(1/6)<br />
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;= <span className="text-primary font-bold">3.5</span>
                  </code>
                  <p className="text-xs font-body text-on-surface-variant/70 italic">
                    You can&apos;t roll a 3.5 — but after thousands of rolls, your average will settle there.
                  </p>
                </div>
              </div>

              {/* What the simulator shows */}
              <div className="bg-surface-container-low rounded-2xl p-5 space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-[0.1em] text-secondary">
                  What the Simulator Shows
                </h3>
                <div className="space-y-3">
                  {[
                    {
                      step: "1",
                      title: "Weight sliders",
                      desc: "Each slider sets the relative likelihood of that face. Equal weights = fair die. Crank face 6 up and it will appear more often.",
                      color: "bg-primary",
                    },
                    {
                      step: "2",
                      title: "Blue dashed line (E[X])",
                      desc: "This is the mathematically calculated expected value. It updates instantly when you move the sliders.",
                      color: "bg-primary",
                    },
                    {
                      step: "3",
                      title: "Orange line (x̄, sample mean)",
                      desc: "This is the actual average of every roll so far. At first it jumps around wildly. As N grows, it homes in on E[X].",
                      color: "bg-secondary",
                    },
                  ].map(({ step, title, desc, color }) => (
                    <div key={step} className="flex gap-3">
                      <div className={`w-5 h-5 rounded-full ${color} text-white flex-shrink-0 flex items-center justify-center text-[10px] font-bold mt-0.5`}>
                        {step}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-on-surface mb-0.5">{title}</p>
                        <p className="text-xs font-body text-on-surface-variant leading-relaxed">{desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Law of Large Numbers */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold uppercase tracking-[0.1em] text-secondary">
                  Law of Large Numbers
                </h3>
                <p className="font-body text-on-surface-variant leading-relaxed">
                  As N grows, the gap between x̄ (what actually happened) and E[X] (what theory predicts) shrinks toward zero. This isn&apos;t luck — it&apos;s a mathematical guarantee.
                </p>
                <p className="font-body text-on-surface-variant leading-relaxed">
                  The |x̄ − E[X]| stat in the simulator tracks exactly this gap in real time.
                </p>
              </div>

              {/* Key Properties */}
              <div className="p-5 bg-surface-container-low rounded-2xl space-y-3">
                <h4 className="text-sm font-bold uppercase tracking-[0.1em] text-secondary">
                  Key Properties
                </h4>
                {[
                  {
                    prop: "Linearity",
                    formula: "E[aX + b] = aE[X] + b",
                    desc: "Scale and shift E[X] the same way.",
                  },
                  {
                    prop: "Additivity",
                    formula: "E[X + Y] = E[X] + E[Y]",
                    desc: "Always true — even if X and Y are dependent.",
                  },
                  {
                    prop: "Independence",
                    formula: "E[XY] = E[X]·E[Y]",
                    desc: "Products factor only when variables are independent.",
                  },
                ].map(({ prop, formula, desc }) => (
                  <div key={prop} className="space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-on-surface">{prop}</span>
                      <code className="text-[10px] font-mono text-tertiary bg-surface-container-highest px-2 py-0.5 rounded">
                        {formula}
                      </code>
                    </div>
                    <p className="text-[11px] font-body text-on-surface-variant/70">{desc}</p>
                  </div>
                ))}
              </div>

              {/* Try this */}
              <div className="bg-secondary/8 rounded-2xl px-5 py-4 flex gap-3">
                <span className="material-symbols-outlined text-secondary mt-0.5 text-lg">science</span>
                <div className="space-y-1">
                  <p className="text-xs font-bold text-secondary uppercase tracking-wider">Try This</p>
                  <p className="text-sm font-body text-on-surface-variant leading-relaxed">
                    Set face 6 to weight 5, leave others at 1. Notice E[X] jumps above 4. Now hit Run — watch the orange line slowly climb to meet the new target.
                  </p>
                </div>
              </div>

            </article>
          </section>

          {/* Interactive canvas */}
          <section className="col-span-12 lg:col-span-8">
            <ExpectationSimulator />
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
