"use client";

import { useState } from "react";

const CONCEPTS = [
  {
    title: "Sample Space",
    icon: "grid_view",
    summary: "The set of all possible outcomes Ω.",
    body: "The sample space Ω is the complete collection of every outcome an experiment can produce. For a coin flip Ω = {H, T}; for a die Ω = {1, 2, 3, 4, 5, 6}. Every event you can reason about is a subset of Ω.",
    formula: "Ω = { ω₁, ω₂, … , ωₙ }",
  },
  {
    title: "Event Probability",
    icon: "percent",
    summary: "Assigning a number 0–1 to any event subset.",
    body: "An event E is a subset of Ω. For equally likely outcomes, P(E) = |E| / |Ω|. More generally, P is any function obeying Kolmogorov's three axioms: non-negativity, normalization, and σ-additivity.",
    formula: "P(E) = |E| / |Ω|  (uniform spaces)",
  },
  {
    title: "Conditional Probability",
    icon: "fork_right",
    summary: "Probability once you've observed an event.",
    body: "P(A | B) is the probability of A given that B is known to have occurred. It restricts the universe of possibilities to B and asks how large A is within that restricted world. Defined only when P(B) > 0.",
    formula: "P(A|B) = P(A ∩ B) / P(B)",
  },
  {
    title: "Independence",
    icon: "call_split",
    summary: "Knowing B tells you nothing about A.",
    body: "A and B are independent if learning one gives zero information about the other. The joint probability factorises: P(A ∩ B) = P(A) · P(B). Each flip of a fair coin is independent of all previous flips — the coin has no memory.",
    formula: "P(A ∩ B) = P(A) · P(B)",
  },
];

export default function ConceptAccordion() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div className="space-y-2">
      {CONCEPTS.map((c, i) => {
        const isOpen = open === i;
        return (
          <div
            key={c.title}
            className={`rounded-xl overflow-hidden transition-colors ${
              isOpen ? "bg-surface-container-high" : "bg-surface-container-low"
            }`}
          >
            <button
              onClick={() => setOpen(isOpen ? null : i)}
              className="w-full flex items-center justify-between px-4 py-3 text-left group"
            >
              <div className="flex items-center gap-3">
                <span
                  className={`material-symbols-outlined text-base transition-colors ${
                    isOpen ? "text-primary" : "text-on-surface-variant/40"
                  }`}
                >
                  {c.icon}
                </span>
                <span
                  className={`text-sm font-body transition-colors ${
                    isOpen
                      ? "text-on-surface font-semibold"
                      : "text-on-surface-variant group-hover:text-on-surface"
                  }`}
                >
                  {c.title}
                </span>
              </div>
              <span
                className={`material-symbols-outlined text-sm transition-all ${
                  isOpen
                    ? "rotate-90 text-primary"
                    : "text-on-surface-variant/40 group-hover:text-primary"
                }`}
              >
                arrow_forward
              </span>
            </button>

            {isOpen && (
              <div className="px-4 pb-4 space-y-3">
                <p className="text-sm font-body text-on-surface-variant leading-relaxed">
                  {c.body}
                </p>
                <code className="block text-xs font-mono text-primary bg-surface-container-lowest px-3 py-2 rounded-lg">
                  {c.formula}
                </code>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
