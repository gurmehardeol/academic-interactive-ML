"use client";

import { useState, useEffect } from "react";

interface TreeNode {
  id: string;
  feature?: string;
  threshold?: number;
  gini?: number;
  samples?: number;
  label?: string;
  left?: TreeNode;
  right?: TreeNode;
}

interface DataPoint {
  x: number;
  y: number;
  label: 0 | 1;
}

const INITIAL_POINTS: DataPoint[] = [
  { x: 0.22, y: 0.72, label: 0 },
  { x: 0.30, y: 0.60, label: 0 },
  { x: 0.18, y: 0.44, label: 0 },
  { x: 0.35, y: 0.80, label: 0 },
  { x: 0.28, y: 0.35, label: 0 },
  { x: 0.72, y: 0.68, label: 1 },
  { x: 0.65, y: 0.48, label: 1 },
  { x: 0.80, y: 0.28, label: 1 },
  { x: 0.88, y: 0.75, label: 1 },
  { x: 0.78, y: 0.55, label: 1 },
];

const TREE_STEPS: {
  splitX?: number;
  splitY?: number;
  splitXRight?: number;
  tree: TreeNode;
  step: string;
}[] = [
  {
    splitX: undefined,
    tree: {
      id: "root",
      feature: "X₁ ≤ 0.52",
      gini: 0.5,
      samples: 10,
    },
    step: "Initial: No splits yet. The root node considers all 10 samples.",
  },
  {
    splitX: 0.52,
    tree: {
      id: "root",
      feature: "X₁ ≤ 0.52",
      gini: 0.48,
      samples: 10,
      left: { id: "leaf-a", label: "Class A", gini: 0.0, samples: 5 },
      right: {
        id: "right",
        feature: "X₂ ≤ 0.40",
        gini: 0.22,
        samples: 5,
      },
    },
    step: "Split 1: X₁ ≤ 0.52 perfectly separates Class A (left). Right node needs further splitting.",
  },
  {
    splitX: 0.52,
    splitY: 0.4,
    tree: {
      id: "root",
      feature: "X₁ ≤ 0.52",
      gini: 0.48,
      samples: 10,
      left: { id: "leaf-a", label: "Class A", gini: 0.0, samples: 5 },
      right: {
        id: "right",
        feature: "X₂ ≤ 0.40",
        gini: 0.22,
        samples: 5,
        left: { id: "leaf-b1", label: "Class B", gini: 0.0, samples: 2 },
        right: { id: "leaf-b2", label: "Class B", gini: 0.0, samples: 3 },
      },
    },
    step: "Split 2: X₂ ≤ 0.40 further partitions the right region. Tree depth = 2, accuracy = 100%.",
  },
];

interface TreeNodeDisplayProps {
  node: TreeNode;
  depth?: number;
}

function TreeNodeDisplay({ node, depth = 0 }: TreeNodeDisplayProps) {
  const isLeaf = !!node.label;

  return (
    <div className="flex flex-col items-center">
      <div
        className={`px-3 py-2 rounded-lg text-center shadow-sm min-w-[90px] ${
          isLeaf
            ? node.label === "Class A"
              ? "bg-tertiary-container/20 border-b-4 border-tertiary"
              : "bg-secondary-container/20 border-b-4 border-secondary"
            : "bg-surface-container-lowest border-b-4 border-primary"
        }`}
      >
        {isLeaf ? (
          <>
            <p className={`text-[10px] font-bold ${node.label === "Class A" ? "text-tertiary" : "text-secondary"}`}>
              Leaf: {node.label}
            </p>
            <p className="text-[9px] text-outline-variant">
              Samples: {node.samples}
            </p>
          </>
        ) : (
          <>
            <p className="text-[10px] font-bold text-outline">
              {node.feature}
            </p>
            <p className="text-[9px] text-outline-variant">
              Gini: {node.gini?.toFixed(2)}
            </p>
          </>
        )}
      </div>

      {(node.left || node.right) && (
        <div className="flex gap-6 mt-2 relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[1px] bg-outline-variant/30" />
          <div className="flex flex-col items-center">
            <div className="w-[1px] h-5 bg-outline-variant/30" />
            {node.left && <TreeNodeDisplay node={node.left} depth={depth + 1} />}
          </div>
          <div className="flex flex-col items-center">
            <div className="w-[1px] h-5 bg-outline-variant/30" />
            {node.right && <TreeNodeDisplay node={node.right} depth={depth + 1} />}
          </div>
        </div>
      )}
    </div>
  );
}

export default function DecisionTreeExplorer() {
  const [step, setStep] = useState(0);
  const [depth, setDepth] = useState(3);
  const [impurity, setImpurity] = useState<"gini" | "entropy">("gini");

  // maxStep is driven by depth slider — depth 1 = root only, depth 2 = first split, etc.
  const maxStep = Math.min(depth - 1, TREE_STEPS.length - 1);
  const currentState = TREE_STEPS[Math.min(step, maxStep)];

  const advance = () =>
    setStep((s) => Math.min(s + 1, maxStep));
  const reset = () => setStep(0);

  // Cap current step when depth slider is reduced
  useEffect(() => {
    setStep((s) => Math.min(s, maxStep));
  }, [maxStep]);

  const accuracy = step === 0 ? 50 : step === 1 ? 75 : 97;

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <section className="max-w-4xl">
        <h1 className="font-headline text-4xl lg:text-5xl font-bold leading-tight mb-4">
          Partitioning the Feature Space
        </h1>
        <p className="font-body text-on-surface-variant leading-relaxed text-lg max-w-2xl">
          Decision trees recursively split data into subsets. By selecting the
          feature and threshold that maximizes purity, we create a roadmap for
          prediction.
        </p>
      </section>

      {/* Interactive workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 flex-1">
        {/* Feature map */}
        <div className="lg:col-span-7 bg-surface-container-lowest rounded-xl p-7 relative overflow-hidden border border-outline-variant/15 flex flex-col">
          <div className="flex justify-between items-center mb-5">
            <span className="font-label text-[11px] font-bold tracking-widest uppercase text-outline">
              Feature Mapping: X₁ vs X₂
            </span>
            <div className="flex gap-3">
              <span className="flex items-center gap-1 font-label text-[10px] text-tertiary">
                <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: "#536600" }} />
                Class A
              </span>
              <span className="flex items-center gap-1 font-label text-[10px] text-secondary">
                <span className="w-2.5 h-2.5 rotate-45 inline-block" style={{ backgroundColor: "#964900" }} />
                Class B
              </span>
            </div>
          </div>

          {/* Plot */}
          <div className="flex-1 bg-surface-container-low rounded-lg relative canvas-grid min-h-64">
            {/* Vertical split line */}
            {currentState.splitX && (
              <div
                className="absolute inset-y-0 w-0.5 bg-primary/50 border-r border-dashed border-primary z-10"
                style={{ left: `${currentState.splitX * 100}%` }}
              />
            )}
            {/* Horizontal split line (right region only) */}
            {currentState.splitY && currentState.splitX && (
              <div
                className="absolute h-0.5 bg-primary/50 border-b border-dashed border-primary z-10"
                style={{
                  top: `${currentState.splitY * 100}%`,
                  left: `${currentState.splitX * 100}%`,
                  right: 0,
                }}
              />
            )}

            {/* Region shading */}
            {currentState.splitX && (
              <>
                <div
                  className="absolute inset-y-0 left-0 pointer-events-none"
                  style={{ width: `${currentState.splitX * 100}%`, backgroundColor: "rgba(83,102,0,0.10)" }}
                />
                <div
                  className="absolute inset-y-0 right-0 pointer-events-none"
                  style={{ width: `${(1 - currentState.splitX) * 100}%`, backgroundColor: "rgba(150,73,0,0.10)" }}
                />
              </>
            )}

            {/* Data points */}
            {INITIAL_POINTS.map((p, i) => (
              <div
                key={i}
                className="absolute -translate-x-1/2 -translate-y-1/2"
                style={{ left: `${p.x * 100}%`, top: `${(1 - p.y) * 100}%` }}
              >
                {p.label === 0 ? (
                  <div className="w-4 h-4 rounded-full shadow-md border-2 border-white" style={{ backgroundColor: "#536600" }} />
                ) : (
                  <div className="w-4 h-4 rotate-45 shadow-md border-2 border-white" style={{ backgroundColor: "#964900" }} />
                )}
              </div>
            ))}

            {/* Threshold labels */}
            {currentState.splitX && (
              <div
                className="absolute bottom-3 font-label text-[9px] text-outline italic pointer-events-none"
                style={{ left: `${currentState.splitX * 100 + 1}%` }}
              >
                X₁ = {currentState.splitX}
              </div>
            )}
            {currentState.splitY && currentState.splitX && (
              <div
                className="absolute right-3 font-label text-[9px] text-outline italic pointer-events-none"
                style={{ top: `${currentState.splitY * 100 - 4}%` }}
              >
                X₂ = {currentState.splitY}
              </div>
            )}
          </div>

          {/* Step description */}
          <div className="mt-4 p-3 bg-surface-container-low rounded-lg">
            <p className="text-xs text-on-surface-variant font-body italic">
              {currentState.step}
            </p>
          </div>

          {/* Controls */}
          <div className="absolute bottom-6 right-6 flex gap-3">
            <button
              onClick={reset}
              className="glass-panel text-primary p-3 rounded-full shadow-lg hover:scale-105 transition-all"
            >
              <span className="material-symbols-outlined text-lg">replay</span>
            </button>
            <button
              onClick={advance}
              disabled={step >= maxStep}
              className="bg-gradient-to-br from-primary to-primary-container text-white px-7 py-3 rounded-full shadow-lg font-label font-bold tracking-widest uppercase text-xs flex items-center gap-2 hover:opacity-90 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Add Split
              <span className="material-symbols-outlined text-sm">
                arrow_forward_ios
              </span>
            </button>
          </div>
        </div>

        {/* Tree + controls */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          {/* Tree visualization */}
          <div className="bg-surface-container-low rounded-xl p-6 border border-outline-variant/15 flex-1 flex flex-col min-h-64">
            <span className="font-label text-[11px] font-bold tracking-widest uppercase text-outline mb-6">
              Structural Graph
            </span>
            <div className="flex-1 flex items-start justify-center overflow-auto pt-4">
              <TreeNodeDisplay node={currentState.tree} />
            </div>
          </div>

          {/* Parameters */}
          <div className="bg-surface-container-highest rounded-xl p-6 border border-outline-variant/15">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-3">
                <label className="font-label text-[11px] font-bold tracking-widest uppercase text-outline block">
                  Tree Depth
                </label>
                <div className="flex items-center gap-3">
                  <input
                    className="flex-1 accent-secondary h-1.5 bg-outline-variant/30 rounded-full appearance-none"
                    max="10"
                    min="1"
                    type="range"
                    value={depth}
                    onChange={(e) => setDepth(parseInt(e.target.value))}
                  />
                  <span className="font-headline text-lg font-bold text-secondary w-6 text-right">
                    {depth}
                  </span>
                </div>
              </div>
              <div className="space-y-3">
                <label className="font-label text-[11px] font-bold tracking-widest uppercase text-outline block">
                  Impurity Metric
                </label>
                <div className="flex p-1 bg-surface-container-low rounded-full">
                  {(["Gini", "Entropy"] as const).map((m) => (
                    <button
                      key={m}
                      onClick={() =>
                        setImpurity(m.toLowerCase() as "gini" | "entropy")
                      }
                      className={`flex-1 py-2 px-3 rounded-full font-label text-[10px] font-bold transition-all ${
                        impurity === m.toLowerCase()
                          ? "bg-surface-container-lowest text-primary shadow-sm"
                          : "text-outline hover:text-on-surface"
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer stats */}
      <footer className="flex justify-between items-center py-5 border-t border-outline-variant/10">
        <div className="flex gap-8">
          <div className="flex flex-col">
            <span className="font-label text-[9px] text-outline-variant uppercase tracking-tighter">
              Current Step
            </span>
            <span className="font-headline text-xl italic text-secondary">
              {step + 1} / {TREE_STEPS.length}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="font-label text-[9px] text-outline-variant uppercase tracking-tighter">
              Model Accuracy
            </span>
            <span className="font-headline text-xl italic text-tertiary">
              {accuracy}%
            </span>
          </div>
          <div className="flex flex-col">
            <span className="font-label text-[9px] text-outline-variant uppercase tracking-tighter">
              {impurity === "gini" ? "Gini Impurity" : "Entropy"}
            </span>
            <span className="font-headline text-xl italic text-primary">
              {currentState.tree.gini?.toFixed(3)}
            </span>
          </div>
        </div>
        <div className="flex gap-4">
          <button className="font-label text-[10px] font-bold uppercase tracking-widest text-outline hover:text-primary transition-colors">
            Documentation
          </button>
          <button className="font-label text-[10px] font-bold uppercase tracking-widest text-outline hover:text-primary transition-colors">
            Export Data
          </button>
        </div>
      </footer>

      {/* Real-world scenario */}
      <div className="bg-surface-container-low rounded-2xl p-7 border border-outline-variant/10 space-y-5">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-secondary text-xl">account_balance</span>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-secondary">Real-World Scenario</p>
            <h3 className="font-headline text-lg text-on-surface">Loan Approval Decision Tree</h3>
          </div>
        </div>
        <p className="text-sm font-body text-on-surface-variant leading-relaxed max-w-3xl">
          A bank wants to decide whether to approve a loan. Instead of a single rule, a decision tree asks a chain of yes/no questions about the applicant — each split chosen to maximise group purity:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              step: "Split 1",
              feature: "Credit Score ≤ 650?",
              yesOutcome: "Reject immediately.",
              detail: "Low credit score is the single strongest predictor of default. This split gains the most purity.",
              icon: "credit_score",
              color: "text-primary",
              border: "border-primary",
            },
            {
              step: "Split 2",
              feature: "Debt-to-Income > 40%?",
              yesOutcome: "Reject.",
              detail: "Too much existing debt relative to income. The applicant likely cannot service an additional loan.",
              icon: "account_balance_wallet",
              color: "text-secondary",
              border: "border-secondary",
            },
            {
              step: "Split 3",
              feature: "Employed ≥ 2 years?",
              yesOutcome: "Approve.",
              detail: "Stable employment signals reliable income. Applications reaching this node are low-risk.",
              icon: "work",
              color: "text-tertiary",
              border: "border-tertiary",
            },
          ].map(({ step, feature, yesOutcome, detail, icon, color, border }) => (
            <div key={step} className={`bg-surface-container-lowest rounded-xl p-5 border-l-4 ${border} space-y-2`}>
              <div className="flex items-center gap-2">
                <span className={`material-symbols-outlined text-base ${color}`}>{icon}</span>
                <span className={`text-[10px] font-bold uppercase tracking-wider ${color}`}>{step}</span>
              </div>
              <p className="text-sm font-bold text-on-surface">{feature}</p>
              <p className="text-xs font-body text-on-surface-variant leading-relaxed">
                <strong>{yesOutcome}</strong> {detail}
              </p>
            </div>
          ))}
        </div>
        <div className="bg-primary/5 rounded-xl px-5 py-4 flex gap-3">
          <span className="material-symbols-outlined text-primary text-lg mt-0.5">lightbulb</span>
          <p className="text-sm font-body text-on-surface-variant leading-relaxed">
            Use the <strong className="text-on-surface">depth slider</strong> above to control how deep the tree grows.
            Depth&nbsp;1 shows only the root question. Each additional level reveals a new split.
            Notice how accuracy improves with depth — but a very deep tree risks <em>overfitting</em> (memorising the training data rather than learning general rules).
          </p>
        </div>
      </div>
    </div>
  );
}
