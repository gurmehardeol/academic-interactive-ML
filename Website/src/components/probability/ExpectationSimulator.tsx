"use client";

import { useState, useEffect, useRef, useCallback } from "react";

interface WeightedFace {
  label: string;
  value: number;
  weight: number;
  icon: string;
}

const DEFAULT_FACES: WeightedFace[] = [
  { label: "1", value: 1, weight: 1, icon: "looks_one" },
  { label: "2", value: 2, weight: 1, icon: "looks_two" },
  { label: "3", value: 3, weight: 1, icon: "looks_3" },
  { label: "4", value: 4, weight: 1, icon: "looks_4" },
  { label: "5", value: 5, weight: 1, icon: "looks_5" },
  { label: "6", value: 6, weight: 1, icon: "looks_6" },
];

function computeExpectedValue(faces: WeightedFace[]): number {
  const totalWeight = faces.reduce((s, f) => s + f.weight, 0);
  if (totalWeight === 0) return 0;
  return faces.reduce((s, f) => s + f.value * (f.weight / totalWeight), 0);
}

function sampleWeighted(faces: WeightedFace[]): number {
  const total = faces.reduce((s, f) => s + f.weight, 0);
  let r = Math.random() * total;
  for (const f of faces) {
    r -= f.weight;
    if (r <= 0) return f.value;
  }
  return faces[faces.length - 1].value;
}

export default function ExpectationSimulator() {
  const [faces, setFaces] = useState<WeightedFace[]>(DEFAULT_FACES);
  const [samples, setSamples] = useState<number[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [speed, setSpeed] = useState(3);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const ev = computeExpectedValue(faces);
  const totalWeight = faces.reduce((s, f) => s + f.weight, 0);

  const runStep = useCallback(() => {
    const val = sampleWeighted(faces);
    setSamples((prev) => [...prev.slice(-299), val]);
  }, [faces]);

  useEffect(() => {
    if (isRunning) {
      const delay = Math.max(8, 400 / speed);
      intervalRef.current = setInterval(runStep, delay);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, speed, runStep]);

  const reset = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setIsRunning(false);
    setSamples([]);
  };

  const updateWeight = (index: number, weight: number) => {
    setFaces((prev) =>
      prev.map((f, i) => (i === index ? { ...f, weight: Math.max(0.1, weight) } : f))
    );
  };

  // Running average
  const runningAvg =
    samples.length > 0
      ? samples.reduce((a, b) => a + b, 0) / samples.length
      : null;

  // Running average history (last 200 points)
  const runningAvgHistory = (() => {
    const hist: number[] = [];
    let sum = 0;
    for (let i = 0; i < samples.length; i++) {
      sum += samples[i];
      hist.push(sum / (i + 1));
    }
    return hist.slice(-200);
  })();

  // SVG chart for running average convergence
  const W = 560;
  const H = 220;
  const PAD = { top: 20, right: 20, bottom: 30, left: 40 };
  const minY = 1;
  const maxY = 6;
  const toSvgX = (i: number, len: number) =>
    PAD.left + (i / Math.max(len - 1, 1)) * (W - PAD.left - PAD.right);
  const toSvgY = (v: number) =>
    PAD.top + ((maxY - v) / (maxY - minY)) * (H - PAD.top - PAD.bottom);

  const avgPath =
    runningAvgHistory.length > 1
      ? runningAvgHistory
          .map(
            (v, i) =>
              `${i === 0 ? "M" : "L"} ${toSvgX(i, runningAvgHistory.length)} ${toSvgY(v)}`
          )
          .join(" ")
      : "";

  const barColors = [
    "#006496",
    "#964900",
    "#536600",
    "#006496",
    "#964900",
    "#536600",
  ];

  // Outcome frequency counts
  const counts = faces.map(
    (f) => samples.filter((s) => s === f.value).length
  );
  const maxCount = Math.max(...counts, 1);

  return (
    <div className="bg-surface-container-lowest rounded-[2rem] relative overflow-hidden canvas-shadow flex flex-col">
      {/* Status chip */}
      <div className="absolute top-6 right-6 z-10">
        <div className="bg-surface-variant/70 backdrop-blur-xl px-4 py-2 rounded-full shadow-sm flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div
              className={`w-2 h-2 rounded-full ${
                isRunning ? "bg-tertiary animate-pulse" : "bg-outline"
              }`}
            />
            <span className="text-[10px] font-bold uppercase tracking-wider">
              {isRunning ? "Sampling" : "Paused"}
            </span>
          </div>
          <span className="text-xs font-mono font-bold text-primary">
            N={samples.length.toLocaleString()}
          </span>
        </div>
      </div>

      <div className="flex-1 p-8 grid grid-cols-1 lg:grid-cols-2 gap-8 mt-4">
        {/* Left: weight controls + bar chart */}
        <div className="flex flex-col gap-5">
          <div className="space-y-1">
            <h3 className="font-label text-[10px] uppercase tracking-widest font-bold text-outline">
              Outcome Weights
            </h3>
            <p className="text-[11px] font-body text-on-surface-variant/70 leading-relaxed">
              Drag any slider to make that face more or less likely. Equal weights = fair die.
            </p>
          </div>
          <div className="grid grid-cols-6 gap-2">
            {faces.map((face, i) => {
              const expectedContrib = (face.weight / totalWeight) * face.value;
              return (
                <div key={i} className="flex flex-col items-center gap-2">
                  <span
                    className="text-xs font-mono font-bold"
                    style={{ color: barColors[i] }}
                  >
                    {((face.weight / totalWeight) * 100).toFixed(0)}%
                  </span>
                  <div className="relative h-24 w-full flex items-end justify-center">
                    <div
                      className="w-full rounded-t-lg transition-all duration-300"
                      style={{
                        height: `${(face.weight / Math.max(...faces.map((f) => f.weight))) * 80}px`,
                        background: `linear-gradient(to top, ${barColors[i]}40, ${barColors[i]}90)`,
                        minHeight: "4px",
                      }}
                    />
                  </div>
                  <input
                    type="range"
                    min="0.1"
                    max="5"
                    step="0.1"
                    value={face.weight}
                    onChange={(e) =>
                      updateWeight(i, parseFloat(e.target.value))
                    }
                    className="w-full h-1 appearance-none rounded-full cursor-pointer"
                    style={{ accentColor: barColors[i] }}
                  />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
                    {face.label}
                  </span>
                  <span className="text-[9px] text-outline-variant font-mono" title={`Contribution to E[X]: ${face.value} × ${(face.weight/totalWeight).toFixed(3)} = ${expectedContrib.toFixed(3)}`}>
                    {face.value}×{(face.weight/totalWeight).toFixed(2)}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Live formula */}
          <div className="bg-surface-container-low rounded-xl px-4 py-3">
            <p className="text-[9px] font-bold uppercase tracking-widest text-on-surface-variant/50 mb-1.5">Live calculation</p>
            <p className="font-mono text-[10px] text-on-surface-variant leading-relaxed break-all">
              E[X] = {faces.map((f) => `${f.value}×${(f.weight/totalWeight).toFixed(2)}`).join(' + ')}
              {' '}= <span className="font-bold text-primary">{ev.toFixed(3)}</span>
            </p>
          </div>

          {/* E[X] display */}
          <div className="p-5 bg-surface-container-low rounded-xl flex items-end justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/60 mb-1">
                Theoretical E[X]
              </p>
              <p className="font-headline text-4xl text-primary">
                {ev.toFixed(4)}
              </p>
            </div>
            {runningAvg !== null && (
              <div className="text-right">
                <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/60 mb-1">
                  Sample Mean x̄
                </p>
                <p className="font-headline text-4xl text-secondary">
                  {runningAvg.toFixed(4)}
                </p>
                <p
                  className={`text-[10px] font-bold mt-1 ${
                    Math.abs(runningAvg - ev) < 0.05
                      ? "text-tertiary"
                      : "text-outline-variant"
                  }`}
                >
                  Δ = {(runningAvg - ev).toFixed(4)}
                </p>
              </div>
            )}
          </div>

          {/* Frequency histogram */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-outline mb-3">
              Observed Frequencies
            </p>
            <div className="flex gap-2 items-end h-20">
              {faces.map((face, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className="w-full rounded-t transition-all duration-300"
                    style={{
                      height: `${(counts[i] / maxCount) * 60}px`,
                      minHeight: "2px",
                      backgroundColor: `${barColors[i]}70`,
                    }}
                  />
                  <span
                    className="text-[9px] font-bold"
                    style={{ color: barColors[i] }}
                  >
                    {face.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: convergence chart */}
        <div className="flex flex-col gap-4">
          <div className="space-y-0.5">
            <h3 className="font-label text-[10px] uppercase tracking-widest font-bold text-outline">
              Running Average Convergence
            </h3>
            <p className="text-[11px] font-body text-on-surface-variant/70">
              As you collect more rolls, the orange line settles onto the blue target.
            </p>
          </div>

          {/* Chart legend */}
          <div className="flex gap-5">
            <div className="flex items-center gap-1.5">
              <svg width="24" height="10"><line x1="0" y1="5" x2="24" y2="5" stroke="#006496" strokeWidth="2" strokeDasharray="5 3"/></svg>
              <span className="text-[10px] font-bold text-primary">E[X] — theoretical target</span>
            </div>
            <div className="flex items-center gap-1.5">
              <svg width="24" height="10"><line x1="0" y1="5" x2="24" y2="5" stroke="#964900" strokeWidth="2"/></svg>
              <span className="text-[10px] font-bold text-secondary">x̄ — actual sample mean</span>
            </div>
          </div>

          <div className="flex-1 bg-surface-container-low rounded-xl p-3 relative">
            <svg
              viewBox={`0 0 ${W} ${H}`}
              className="w-full h-full"
              preserveAspectRatio="xMidYMid meet"
            >
              {/* Horizontal grid lines */}
              {[1, 2, 3, 4, 5, 6].map((v) => (
                <g key={v}>
                  <line
                    x1={PAD.left}
                    y1={toSvgY(v)}
                    x2={W - PAD.right}
                    y2={toSvgY(v)}
                    stroke="#bfc7d1"
                    strokeWidth="0.5"
                    strokeOpacity="0.5"
                    strokeDasharray="4 3"
                  />
                  <text
                    x={PAD.left - 6}
                    y={toSvgY(v) + 4}
                    textAnchor="end"
                    fontSize="8"
                    fontFamily="Inter"
                    fill="#707881"
                  >
                    {v}
                  </text>
                </g>
              ))}

              {/* E[X] target line */}
              <line
                x1={PAD.left}
                y1={toSvgY(ev)}
                x2={W - PAD.right}
                y2={toSvgY(ev)}
                stroke="#006496"
                strokeWidth="1.5"
                strokeDasharray="6 3"
                opacity="0.6"
              />
              <text
                x={W - PAD.right - 2}
                y={toSvgY(ev) - 4}
                textAnchor="end"
                fontSize="9"
                fontFamily="'Noto Serif', serif"
                fill="#006496"
                fontStyle="italic"
              >
                E[X] = {ev.toFixed(3)}
              </text>

              {/* Running average path */}
              {avgPath && (
                <path
                  d={avgPath}
                  fill="none"
                  stroke="#964900"
                  strokeWidth="2"
                  strokeLinejoin="round"
                />
              )}

              {/* Current sample mean dot */}
              {runningAvgHistory.length > 0 && (
                <circle
                  cx={toSvgX(
                    runningAvgHistory.length - 1,
                    runningAvgHistory.length
                  )}
                  cy={toSvgY(
                    runningAvgHistory[runningAvgHistory.length - 1]
                  )}
                  r="4"
                  fill="#964900"
                />
              )}

              {/* Axes */}
              <line
                x1={PAD.left}
                y1={PAD.top}
                x2={PAD.left}
                y2={H - PAD.bottom}
                stroke="#bfc7d1"
                strokeWidth="1"
              />
              <line
                x1={PAD.left}
                y1={H - PAD.bottom}
                x2={W - PAD.right}
                y2={H - PAD.bottom}
                stroke="#bfc7d1"
                strokeWidth="1"
              />

              {/* Axis labels */}
              <text
                x={W / 2}
                y={H - 4}
                textAnchor="middle"
                fontSize="8"
                fontFamily="Inter"
                fill="#707881"
                fontWeight="700"
              >
                TRIALS (N)
              </text>
              <text
                x={10}
                y={H / 2}
                textAnchor="middle"
                fontSize="8"
                fontFamily="Inter"
                fill="#707881"
                fontWeight="700"
                transform={`rotate(-90, 10, ${H / 2})`}
              >
                SAMPLE MEAN
              </text>
            </svg>

            {samples.length === 0 && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                <span className="material-symbols-outlined text-3xl text-on-surface-variant/20">play_circle</span>
                <p className="font-headline italic text-on-surface-variant/40 text-base">
                  Press Run to watch the Law of Large Numbers in action
                </p>
                <p className="text-[11px] font-body text-on-surface-variant/30">
                  Orange line (x̄) will converge to blue dashed line (E[X])
                </p>
              </div>
            )}
          </div>

          {/* Variance display */}
          {samples.length > 1 && (
            <div className="grid grid-cols-3 gap-3">
              {[
                {
                  label: "Variance σ² (spread)",
                  value: (() => {
                    const mean = runningAvg!;
                    return (
                      samples.reduce((s, x) => s + (x - mean) ** 2, 0) /
                      samples.length
                    ).toFixed(4);
                  })(),
                  color: "text-primary",
                },
                {
                  label: "Std Dev σ (±range)",
                  value: (() => {
                    const mean = runningAvg!;
                    return Math.sqrt(
                      samples.reduce((s, x) => s + (x - mean) ** 2, 0) /
                        samples.length
                    ).toFixed(4);
                  })(),
                  color: "text-secondary",
                },
                {
                  label: "|x̄ − E[X]| (error)",
                  value: Math.abs((runningAvg ?? ev) - ev).toFixed(4),
                  color: "text-tertiary",
                },
              ].map(({ label, value, color }) => (
                <div
                  key={label}
                  className="bg-surface-container-highest/40 rounded-xl p-3"
                >
                  <p className="text-[9px] font-bold uppercase tracking-widest text-on-surface-variant/60 mb-1">
                    {label}
                  </p>
                  <p className={`font-headline text-lg ${color}`}>{value}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Playback controls */}
      <div className="bg-surface-container-high/40 backdrop-blur-md px-8 py-5 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="space-y-1">
            <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/60">
              Speed
            </p>
            <div className="flex items-center gap-2">
              <input
                className="w-24 h-1 bg-primary/20 rounded-lg appearance-none cursor-pointer accent-primary"
                type="range"
                min="0.5"
                max="10"
                step="0.5"
                value={speed}
                onChange={(e) => setSpeed(parseFloat(e.target.value))}
              />
              <span className="text-xs font-mono font-bold text-primary w-8">
                {speed}x
              </span>
            </div>
          </div>
          <div className="w-[1px] h-8 bg-outline-variant/30" />
          <div className="flex items-center gap-3">
            <button
              onClick={reset}
              className="w-10 h-10 rounded-full border border-outline-variant/30 flex items-center justify-center text-on-surface-variant hover:bg-surface-container-lowest transition-colors"
            >
              <span className="material-symbols-outlined text-sm">restart_alt</span>
            </button>
            <button
              onClick={() => setIsRunning((r) => !r)}
              className="h-12 px-6 bg-on-background text-background rounded-full font-bold flex items-center gap-2 hover:opacity-90 active:scale-95 transition-all text-sm"
            >
              <span className="material-symbols-outlined text-sm">
                {isRunning ? "pause" : "play_arrow"}
              </span>
              {isRunning ? "PAUSE" : "RUN SIMULATION"}
            </button>
          </div>
        </div>
        <div className="text-right hidden md:block">
          <p className="text-[9px] font-bold uppercase tracking-widest text-on-surface-variant/40">
            Formula
          </p>
          <code className="text-sm font-mono text-tertiary">
            E[X] = Σ x · P(x)
          </code>
        </div>
      </div>
    </div>
  );
}
