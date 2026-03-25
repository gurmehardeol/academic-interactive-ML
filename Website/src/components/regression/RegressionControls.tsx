"use client";

import { useState } from "react";
import RegressionCanvas from "@/components/regression/RegressionCanvas";

export default function RegressionCanvasWrapper() {
  const [density, setDensity] = useState(28);
  const [noiseLevel, setNoiseLevel] = useState(0.85);
  const [showBestFit, setShowBestFit] = useState(false);
  const [showResiduals, setShowResiduals] = useState(true);
  const [showConfidence, setShowConfidence] = useState(false);
  const [resetKey, setResetKey] = useState(0);

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* Canvas */}
      <section className="flex-grow">
        <RegressionCanvas
          key={resetKey}
          density={density}
          noiseLevel={noiseLevel}
          showBestFit={showBestFit}
          showResiduals={showResiduals}
          showConfidence={showConfidence}
        />
      </section>

      {/* Instructional side panel */}
      <aside className="lg:w-96 flex flex-col gap-6 flex-shrink-0">
        {/* Educational text */}
        <div className="bg-surface-container-low rounded-xl p-7">
          <h3 className="font-headline text-xl mb-4 text-on-surface">
            Understanding Residuals
          </h3>
          <div className="space-y-3 font-body text-sm leading-relaxed text-on-surface-variant">
            <p>
              A residual is the vertical distance between a data point and the
              regression line. Each dashed line represents a &ldquo;deviation&rdquo; from
              our prediction.
            </p>
            <p>
              The{" "}
              <span className="text-secondary font-semibold italic">
                Cost Function
              </span>{" "}
              (Mean Squared Error) aggregates these distances to measure how
              well the line fits the overall data trend.
            </p>
          </div>
          <div className="mt-5 p-4 bg-surface-container-lowest rounded-lg">
            <code className="text-[11px] font-mono text-tertiary leading-loose tracking-tight">
              J(θ) = 1/2m ∑ (h_θ(x) − y)²
            </code>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-surface-container-high rounded-xl p-7 space-y-7">
          {/* Data parameters */}
          <div className="space-y-4">
            <h4 className="font-label text-[10px] uppercase tracking-widest font-bold text-on-surface-variant">
              Data Parameters
            </h4>
            <div className="space-y-5">
              <div>
                <div className="flex justify-between mb-2">
                  <label className="text-xs font-medium text-on-surface">
                    Dataset Density
                  </label>
                  <span className="text-[10px] font-mono text-secondary font-bold">
                    {density} Points
                  </span>
                </div>
                <input
                  className="w-full accent-secondary h-1 bg-surface-container rounded-full appearance-none cursor-pointer"
                  type="range"
                  min="10"
                  max="80"
                  value={density}
                  onChange={(e) => setDensity(parseInt(e.target.value))}
                />
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <label className="text-xs font-medium text-on-surface">
                    Gaussian Noise
                  </label>
                  <span className="text-[10px] font-mono text-secondary font-bold">
                    σ = {noiseLevel.toFixed(2)}
                  </span>
                </div>
                <input
                  className="w-full accent-secondary h-1 bg-surface-container rounded-full appearance-none cursor-pointer"
                  type="range"
                  min="0.1"
                  max="3"
                  step="0.05"
                  value={noiseLevel}
                  onChange={(e) => setNoiseLevel(parseFloat(e.target.value))}
                />
              </div>
            </div>
          </div>

          {/* Visual toggles */}
          <div className="space-y-4">
            <h4 className="font-label text-[10px] uppercase tracking-widest font-bold text-on-surface-variant">
              Visual Toggles
            </h4>
            <div className="space-y-3">
              {[
                {
                  label: "Show OLS best-fit line",
                  value: showBestFit,
                  set: setShowBestFit,
                },
                {
                  label: "Project residuals",
                  value: showResiduals,
                  set: setShowResiduals,
                },
                {
                  label: "Confidence Intervals",
                  value: showConfidence,
                  set: setShowConfidence,
                },
              ].map(({ label, value, set }) => (
                <label
                  key={label}
                  className="flex items-center justify-between cursor-pointer group"
                >
                  <span className="text-sm font-body text-on-surface-variant">
                    {label}
                  </span>
                  <button
                    onClick={() => set(!value)}
                    className={`w-10 h-5 rounded-full relative transition-colors ${
                      value ? "bg-secondary/80" : "bg-outline-variant/30"
                    }`}
                  >
                    <div
                      className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${
                        value ? "right-1" : "left-1"
                      }`}
                    />
                  </button>
                </label>
              ))}
            </div>
          </div>

          <button
            onClick={() => setResetKey((k) => k + 1)}
            className="w-full flex items-center justify-center gap-2 border border-secondary/20 py-3 rounded-xl text-secondary font-label text-xs tracking-widest uppercase hover:bg-secondary/5 transition-colors"
          >
            <span className="material-symbols-outlined text-sm">refresh</span>
            Reset Observations
          </button>
        </div>
      </aside>
    </div>
  );
}
