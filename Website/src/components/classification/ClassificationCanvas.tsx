"use client";

import { useState, useRef, useCallback, useEffect } from "react";

type KernelType = "rbf" | "linear" | "polynomial" | "sigmoid";

interface DataPoint {
  x: number;
  y: number;
  label: 0 | 1;
}

interface SvmParams {
  c: number;
  gamma: number;
  kernel: KernelType;
}

// Simple RBF kernel decision function approximation for visualization
function rbfKernel(x1: number, y1: number, x2: number, y2: number, gamma: number): number {
  return Math.exp(-gamma * ((x1 - x2) ** 2 + (y1 - y2) ** 2));
}

function computeDecisionScore(
  px: number,
  py: number,
  points: DataPoint[],
  params: SvmParams
): number {
  if (points.length === 0) return 0;
  let score = 0;
  const { gamma, kernel } = params;

  const classA = points.filter((p) => p.label === 0);
  const classB = points.filter((p) => p.label === 1);

  if (classA.length === 0 || classB.length === 0) return 0;

  for (const p of classA) {
    const k =
      kernel === "rbf"
        ? rbfKernel(px, py, p.x, p.y, gamma)
        : kernel === "linear"
        ? px * p.x + py * p.y
        : kernel === "polynomial"
        ? Math.pow(px * p.x + py * p.y + 1, 2)
        : Math.tanh(gamma * (px * p.x + py * p.y));
    score -= k / classA.length;
  }
  for (const p of classB) {
    const k =
      kernel === "rbf"
        ? rbfKernel(px, py, p.x, p.y, gamma)
        : kernel === "linear"
        ? px * p.x + py * p.y
        : kernel === "polynomial"
        ? Math.pow(px * p.x + py * p.y + 1, 2)
        : Math.tanh(gamma * (px * p.x + py * p.y));
    score += k / classB.length;
  }
  return score;
}

export default function ClassificationCanvas() {
  const [activeClass, setActiveClass] = useState<0 | 1>(0);
  const [points, setPoints] = useState<DataPoint[]>([
    { x: 0.18, y: 0.78, label: 0 },
    { x: 0.22, y: 0.62, label: 0 },
    { x: 0.30, y: 0.85, label: 0 },
    { x: 0.12, y: 0.38, label: 0 },
    { x: 0.26, y: 0.20, label: 0 },
    { x: 0.74, y: 0.72, label: 1 },
    { x: 0.65, y: 0.52, label: 1 },
    { x: 0.82, y: 0.28, label: 1 },
    { x: 0.88, y: 0.82, label: 1 },
    { x: 0.78, y: 0.44, label: 1 },
  ]);
  const [params, setParams] = useState<SvmParams>({
    c: 1.0,
    gamma: 0.5,
    kernel: "rbf",
  });
  const [showBoundary, setShowBoundary] = useState(true);
  const canvasRef = useRef<HTMLDivElement>(null);
  const canvasBgRef = useRef<HTMLCanvasElement>(null);

  const handleCanvasClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      setPoints((prev) => [...prev, { x, y, label: activeClass }]);
    },
    [activeClass]
  );

  // Draw decision boundary to canvas whenever points/params change
  useEffect(() => {
    const canvas = canvasBgRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const cw = canvas.width;
    const ch = canvas.height;
    ctx.clearRect(0, 0, cw, ch);
    if (!showBoundary || !points.some((p) => p.label === 0) || !points.some((p) => p.label === 1)) return;
    // Precompute score grid
    const scores = new Float32Array(cw * ch);
    for (let px = 0; px < cw; px++) {
      for (let py = 0; py < ch; py++) {
        scores[py * cw + px] = computeDecisionScore(px / cw, py / ch, points, params);
      }
    }
    // Fill region colors
    const imageData = ctx.createImageData(cw, ch);
    const d = imageData.data;
    for (let i = 0; i < scores.length; i++) {
      const s = scores[i];
      const alpha = Math.min(150, Math.round(Math.abs(s) * 110 + 20));
      const idx = i * 4;
      if (s > 0) {
        // Class B region — warm amber
        d[idx] = 210; d[idx + 1] = 115; d[idx + 2] = 15; d[idx + 3] = alpha;
      } else {
        // Class A region — cool blue
        d[idx] = 15; d[idx + 1] = 125; d[idx + 2] = 205; d[idx + 3] = alpha;
      }
    }
    ctx.putImageData(imageData, 0, 0);
    // Draw zero-crossing boundary line
    ctx.strokeStyle = "rgba(15, 15, 35, 0.7)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    for (let px = 0; px < cw - 1; px++) {
      for (let py = 0; py < ch - 1; py++) {
        const s = scores[py * cw + px];
        if (Math.sign(s) !== Math.sign(scores[py * cw + px + 1])) {
          ctx.moveTo(px + 0.5, py); ctx.lineTo(px + 0.5, py + 1);
        }
        if (Math.sign(s) !== Math.sign(scores[(py + 1) * cw + px])) {
          ctx.moveTo(px, py + 0.5); ctx.lineTo(px + 1, py + 0.5);
        }
      }
    }
    ctx.stroke();
  }, [points, params, showBoundary]);

  // Compute accuracy
  const correct = points.filter((p) => {
    const score = computeDecisionScore(p.x, p.y, points, params);
    return (score > 0 && p.label === 1) || (score <= 0 && p.label === 0);
  }).length;
  const accuracy =
    points.length > 0 ? ((correct / points.length) * 100).toFixed(1) : "—";

  // Decision boundary path — no longer needed, handled by canvas

  const kernelOptions: { value: KernelType; label: string }[] = [
    { value: "rbf", label: "RBF (Gaussian)" },
    { value: "linear", label: "Linear" },
    { value: "polynomial", label: "Polynomial" },
    { value: "sigmoid", label: "Sigmoid" },
  ];

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <header className="max-w-3xl">
        <h1 className="font-headline text-4xl lg:text-5xl text-on-surface leading-tight">
          Mapping Decision Space:{" "}
          <span className="italic font-normal">SVM &amp; Kernel Boundaries</span>
        </h1>
        <p className="mt-4 text-on-surface-variant max-w-xl font-light leading-relaxed">
          Click anywhere on the canvas to plot training data. Observe how the
          manifold adjusts to minimize loss while maximizing the margin between
          observed classes.
        </p>
      </header>

      {/* Canvas + controls */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Main canvas */}
        <div
          ref={canvasRef}
          className="flex-1 relative min-h-[480px] bg-surface-container-low rounded-xl overflow-hidden canvas-grid cursor-crosshair"
          onClick={handleCanvasClick}
        >
          {/* Decision boundary canvas overlay */}
          <canvas
            ref={canvasBgRef}
            width={160}
            height={160}
            className="absolute inset-0 w-full h-full pointer-events-none rounded-xl"
          />

          {/* Data points */}
          {points.map((p, i) => (
            <div
              key={i}
              className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none"
              style={{ left: `${p.x * 100}%`, top: `${p.y * 100}%` }}
            >
              {p.label === 0 ? (
                <div className="w-5 h-5 rounded-full shadow-lg border-2 border-white" style={{ backgroundColor: "#0f7dcc" }} />
              ) : (
                <div className="w-5 h-5 rotate-45 shadow-lg border-2 border-white" style={{ backgroundColor: "#d07010" }} />
              )}
            </div>
          ))}

          {/* Mode toggle (top-left) */}
          <div className="absolute top-5 left-5 flex gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setActiveClass(0);
              }}
              className={`px-4 py-2 bg-white rounded-full shadow-sm flex items-center gap-2 border text-xs font-bold transition-all ${
                activeClass === 0
                  ? "border-primary text-primary"
                  : "border-outline-variant/10 text-on-surface-variant opacity-60"
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-primary" />
              Class A
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setActiveClass(1);
              }}
              className={`px-4 py-2 bg-white rounded-full shadow-sm flex items-center gap-2 border text-xs font-bold transition-all ${
                activeClass === 1
                  ? "border-secondary text-secondary"
                  : "border-outline-variant/10 text-on-surface-variant opacity-60"
              }`}
            >
              <span className="w-2 h-2 rotate-45 bg-secondary inline-block" />
              Class B
            </button>
          </div>

          {/* Axis labels */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 text-[9px] text-outline font-bold uppercase tracking-widest bg-surface px-4 py-1 rounded-full pointer-events-none">
            Feature X₁
          </div>
          <div className="absolute left-3 top-1/2 -translate-y-1/2 -rotate-90 text-[9px] text-outline font-bold uppercase tracking-widest bg-surface px-4 py-1 rounded-full pointer-events-none">
            Feature X₂
          </div>
        </div>

        {/* Control panel */}
        <div className="lg:w-80 flex-shrink-0">
          <div className="glass-panel p-6 rounded-xl border border-white/20 space-y-5">
            <div className="flex justify-between items-end">
              <h3 className="font-headline text-lg">Hyperparameters</h3>
              <span className="font-label text-[9px] tracking-widest text-outline">
                SVM ENGINE v2.4
              </span>
            </div>

            {/* C-value */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <label className="font-label text-[11px] uppercase tracking-wider font-bold text-on-surface-variant">
                  C-Value (Regularization)
                </label>
                <span className="font-label text-xs text-secondary font-bold">
                  {params.c.toFixed(1)}
                </span>
              </div>
              <input
                className="w-full h-1 bg-surface-variant rounded-full appearance-none accent-secondary cursor-pointer"
                type="range"
                min="0.1"
                max="10"
                step="0.1"
                value={params.c}
                onClick={(e) => e.stopPropagation()}
                onChange={(e) =>
                  setParams((p) => ({ ...p, c: parseFloat(e.target.value) }))
                }
              />
            </div>

            {/* Kernel */}
            <div className="space-y-2">
              <label className="font-label text-[11px] uppercase tracking-wider font-bold text-on-surface-variant block">
                Kernel Function
              </label>
              <div className="grid grid-cols-2 gap-2 mt-1">
                {kernelOptions.map((k) => (
                  <button
                    key={k.value}
                    onClick={(e) => {
                      e.stopPropagation();
                      setParams((p) => ({ ...p, kernel: k.value }));
                    }}
                    className={`text-xs py-2 rounded-lg font-medium transition-colors ${
                      params.kernel === k.value
                        ? "bg-surface-container-highest text-secondary font-bold border-b-2 border-secondary"
                        : "bg-white/40 text-on-surface-variant hover:bg-white/60"
                    }`}
                  >
                    {k.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Gamma */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <label className="font-label text-[11px] uppercase tracking-wider font-bold text-on-surface-variant">
                  Gamma Coefficient
                </label>
                <span className="font-label text-xs text-secondary font-bold">
                  {params.gamma.toFixed(2)}
                </span>
              </div>
              <input
                className="w-full h-1 bg-surface-variant rounded-full appearance-none accent-secondary cursor-pointer"
                type="range"
                min="0.05"
                max="5"
                step="0.05"
                value={params.gamma}
                onClick={(e) => e.stopPropagation()}
                onChange={(e) =>
                  setParams((p) => ({ ...p, gamma: parseFloat(e.target.value) }))
                }
              />
            </div>

            {/* Boundary toggle */}
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-sm font-body text-on-surface-variant">
                Show Decision Boundary
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowBoundary((b) => !b);
                }}
                className={`w-10 h-5 rounded-full relative transition-colors ${
                  showBoundary ? "bg-secondary/80" : "bg-outline-variant/30"
                }`}
              >
                <div
                  className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${
                    showBoundary ? "right-1" : "left-1"
                  }`}
                />
              </button>
            </label>

            <div className="pt-2 border-t border-on-surface/5 flex gap-3">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowBoundary(true);
                }}
                className="flex-1 bg-gradient-to-br from-primary to-primary-container text-white py-3 rounded-xl font-label text-xs font-bold uppercase tracking-widest shadow-lg hover:opacity-90 transition-all"
              >
                Run Optimization
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setPoints([]);
                }}
                className="w-12 h-12 flex items-center justify-center border border-outline/20 rounded-xl text-primary hover:bg-white/40 transition-colors"
              >
                <span className="material-symbols-outlined text-sm">
                  restart_alt
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats bento */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <div className="bg-surface-container-low p-6 rounded-xl flex flex-col justify-between">
          <span className="font-label text-[9px] text-outline uppercase tracking-widest font-bold">
            Accuracy
          </span>
          <div>
            <p className="font-headline text-3xl text-primary">{accuracy}%</p>
            <p className="text-[11px] text-on-surface-variant mt-1">
              Training Set Score
            </p>
          </div>
        </div>
        <div className="bg-surface-container-low p-6 rounded-xl flex flex-col justify-between">
          <span className="font-label text-[9px] text-outline uppercase tracking-widest font-bold">
            Data Points
          </span>
          <div>
            <p className="font-headline text-3xl text-secondary">
              {points.length}
            </p>
            <p className="text-[11px] text-on-surface-variant mt-1">
              {points.filter((p) => p.label === 0).length} A /{" "}
              {points.filter((p) => p.label === 1).length} B
            </p>
          </div>
        </div>
        <div className="bg-surface-container-low p-6 rounded-xl md:col-span-2 flex items-center justify-between">
          <div>
            <span className="font-label text-[9px] text-outline uppercase tracking-widest font-bold">
              Model Insight
            </span>
            <p className="font-headline text-base mt-2 italic text-on-surface-variant">
              {params.kernel === "rbf"
                ? "The RBF kernel maps inputs to infinite-dimensional space for non-linear separation."
                : params.kernel === "linear"
                ? "Linear kernel finds a hyperplane with maximum margin between classes."
                : params.kernel === "polynomial"
                ? "Polynomial kernel creates curved boundaries for moderate non-linearity."
                : "Sigmoid kernel approximates neural network-style decision surfaces."}
            </p>
          </div>
          <span className="material-symbols-outlined text-4xl text-tertiary opacity-30">
            query_stats
          </span>
        </div>
      </div>
    </div>
  );
}
