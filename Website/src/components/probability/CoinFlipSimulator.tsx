"use client";

import { useState, useEffect, useRef, useCallback } from "react";

type SimMode = "coin" | "dice";

interface SimState {
  counts: number[];
  total: number;
  isRunning: boolean;
  speed: number;
}

const COIN_LABELS = ["Heads", "Tails"];
const DICE_LABELS = ["1", "2", "3", "4", "5", "6"];
const COIN_ICONS = ["face", "monetization_on"];

function getRandomOutcome(
  mode: SimMode,
  coinBias: number,
  diceWeights: number[]
): number {
  if (mode === "coin") return Math.random() < coinBias ? 0 : 1;
  const total = diceWeights.reduce((a, b) => a + b, 0);
  const r = Math.random() * total;
  let cumulative = 0;
  for (let i = 0; i < diceWeights.length; i++) {
    cumulative += diceWeights[i];
    if (r < cumulative) return i;
  }
  return diceWeights.length - 1;
}

export default function ProbabilitySimulator() {
  const [mode, setMode] = useState<SimMode>("coin");
  const [state, setState] = useState<SimState>({
    counts: [0, 0],
    total: 0,
    isRunning: false,
    speed: 2.5,
  });
  const [coinBias, setCoinBias] = useState(0.5);
  const [diceWeights, setDiceWeights] = useState([1, 1, 1, 1, 1, 1]);
  const [showParams, setShowParams] = useState(true);
  const [maxFlips, setMaxFlips] = useState(0); // 0 = unlimited
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Animated coin / die — throttled so it doesn’t flash at high speed
  const [lastOutcome, setLastOutcome] = useState<number | null>(null);
  const [flipKey, setFlipKey] = useState(0);
  const lastVisualUpdateRef = useRef<number>(0);

  const numBins = mode === "coin" ? 2 : 6;
  const labels = mode === "coin" ? COIN_LABELS : DICE_LABELS;

  const diceTotal = diceWeights.reduce((a, b) => a + b, 0);
  // Expected probability: for coin it's coinBias (prob of heads), for dice uniform across all faces
  const expectedProb = mode === "coin" ? coinBias : 1 / 6;

  const runStep = useCallback(() => {
    const outcome = getRandomOutcome(mode, coinBias, diceWeights);
    setState((prev) => {
      const newCounts = [...prev.counts];
      newCounts[outcome] = (newCounts[outcome] || 0) + 1;
      return { ...prev, counts: newCounts, total: prev.total + 1 };
    });
    // Throttle coin animation to ~5 fps max so it’s readable at any speed
    const now = Date.now();
    if (now - lastVisualUpdateRef.current > 200) {
      setLastOutcome(outcome);
      setFlipKey((k) => k + 1);
      lastVisualUpdateRef.current = now;
    }
  }, [mode, coinBias, diceWeights]);

  useEffect(() => {
    if (state.isRunning) {
      const delay = Math.max(10, 500 / state.speed);
      intervalRef.current = setInterval(runStep, delay);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [state.isRunning, state.speed, runStep]);

  // Auto-stop when maxFlips reached
  useEffect(() => {
    if (maxFlips > 0 && state.total >= maxFlips && state.isRunning) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setState((prev) => ({ ...prev, isRunning: false }));
    }
  }, [state.total, maxFlips, state.isRunning]);

  const toggleMode = (newMode: SimMode) => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setMode(newMode);
    setState({ counts: [], total: 0, isRunning: false, speed: 2.5 });
    setCoinBias(0.5);
    setDiceWeights([1, 1, 1, 1, 1, 1]);
    setLastOutcome(null);
  };

  const reset = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setState((prev) => ({ ...prev, counts: [], total: 0, isRunning: false }));
    setLastOutcome(null);
  };

  const toggleRun = () => {
    setState((prev) => ({ ...prev, isRunning: !prev.isRunning }));
  };

  const exportCSV = () => {
    const rows = [
      ["Outcome", "Count", "Frequency"],
      ...Array.from({ length: numBins }, (_, i) => {
        const count = state.counts[i] || 0;
        return [
          labels[i],
          count,
          state.total > 0 ? ((count / state.total) * 100).toFixed(2) + "%" : "0%",
        ];
      }),
      ["Total", state.total, ""],
    ];
    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `simulation_${mode}_n${state.total}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const maxCount = Math.max(...(state.counts.length ? state.counts : [1]), 1);

  // Stats
  const empiricalResult =
    state.total > 0 ? (state.counts[0] || 0) / state.total : expectedProb;
  const deviation =
    state.total > 0 ? ((empiricalResult - expectedProb) / expectedProb) * 100 : 0;
  const z = 2.576;
  const confidence =
    state.total > 0
      ? Math.min(
          100,
          (1 -
            (z * Math.sqrt(empiricalResult * (1 - empiricalResult) + (z * z) / (4 * state.total))) /
              (state.total + z * z)) *
            100 +
            50
        )
      : 0;

  // Flat academic palette — steel-blue / amber / forest-green (Seeing Theory-style)
  const BAR_COLORS = ["#2c7be5", "#e8851a", "#3d8b40", "#2c7be5", "#e8851a", "#3d8b40"];

  const BAR_CHART_HEIGHT = 260; // fixed pixel budget for bar area

  return (
    <div className="bg-surface-container-lowest rounded-[2rem] overflow-hidden canvas-shadow flex flex-col">
      {/* Mode toggle + counter row */}
      <div className="flex items-center justify-between px-6 pt-6 pb-2">
        <div className="flex bg-surface-variant/70 backdrop-blur-xl p-1 rounded-full shadow-sm">
          <button
            onClick={() => toggleMode("coin")}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
              mode === "coin"
                ? "bg-primary text-white"
                : "text-on-surface-variant hover:bg-surface-container-highest"
            }`}
          >
            COIN FLIP
          </button>
          <button
            onClick={() => toggleMode("dice")}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
              mode === "dice"
                ? "bg-primary text-white"
                : "text-on-surface-variant hover:bg-surface-container-highest"
            }`}
          >
            DICE ROLL
          </button>
        </div>

        <div className="bg-surface-variant/70 backdrop-blur-xl px-4 py-2 rounded-full shadow-sm flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div
              className={`w-2 h-2 rounded-full ${
                state.isRunning ? "bg-tertiary animate-pulse" : "bg-outline"
              }`}
            />
            <span className="text-[10px] font-bold uppercase tracking-wider">
              {state.isRunning ? "Live" : "Paused"}
            </span>
          </div>
          <span className="text-xs font-mono font-bold text-primary">
            N={state.total.toLocaleString()}
          </span>
        </div>
      </div>

      {/* ─── Animated coin / die result (Seeing Theory-style) ─── */}
      <div className="flex justify-center items-center" style={{ height: 108 }}>
        {lastOutcome !== null ? (
          <div key={flipKey} className="animate-coin-flip flex flex-col items-center gap-1.5">
            {mode === "coin" ? (
              <div
                className="w-[72px] h-[72px] rounded-full flex items-center justify-center font-headline text-4xl font-bold shadow-lg"
                style={{ backgroundColor: lastOutcome === 0 ? "#2c7be5" : "#e8851a", color: "white" }}
              >
                {lastOutcome === 0 ? "H" : "T"}
              </div>
            ) : (
              <div
                className="w-[72px] h-[72px] rounded-2xl flex items-center justify-center font-headline text-4xl font-bold shadow-lg"
                style={{ backgroundColor: BAR_COLORS[lastOutcome], color: "white" }}
              >
                {DICE_LABELS[lastOutcome]}
              </div>
            )}
            <span
              className="text-[10px] font-bold uppercase tracking-widest"
              style={{ color: "rgba(26,29,35,0.4)" }}
            >
              {mode === "coin"
                ? lastOutcome === 0 ? "Heads" : "Tails"
                : `Face ${DICE_LABELS[lastOutcome]}`}
            </span>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2" style={{ opacity: 0.22 }}>
            <div
              className="w-[72px] h-[72px] rounded-full flex items-center justify-center"
              style={{ border: "2.5px dashed #c5cad3" }}
            >
              <span className="material-symbols-outlined text-4xl" style={{ color: "#adb5bd" }}>casino</span>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "#adb5bd" }}>
              Press Run
            </span>
          </div>
        )}
      </div>

      {/* Bar chart — fixed height container so layout never shifts */}
      <div
        className="relative mx-8 my-2"
        style={{ height: BAR_CHART_HEIGHT }}
      >
        {/* Expected probability guideline */}
        {state.total > 0 && (
          <div
            className="absolute left-0 right-0 border-t border-dashed border-primary/30 z-10 pointer-events-none"
            style={{
              bottom:
                36 + (expectedProb) * (BAR_CHART_HEIGHT - 36 - 16),
            }}
          >
            <span className="absolute right-0 -top-3.5 text-[8px] font-mono text-primary/50 font-bold bg-surface-container-lowest px-1">
              E[P]={expectedProb.toFixed(3)}
            </span>
          </div>
        )}

        {/* Bars */}
        <div className="flex items-end gap-3 h-full pb-9 pt-4">
          {Array.from({ length: numBins }, (_, i) => {
            const count = state.counts[i] || 0;
            const innerHeight = BAR_CHART_HEIGHT - 36 - 16; // bottom labels + top pad
            const barHeightPx =
              state.total > 0 ? Math.max((count / maxCount) * innerHeight, 3) : 3;
            // For dice: show expected based on weights
            const expectedThisBin =
              mode === "dice"
                ? diceWeights[i] / diceTotal
                : i === 0
                ? coinBias
                : 1 - coinBias;
            return (
              <div
                key={i}
                className="flex-1 flex flex-col items-center justify-end"
                style={{ height: "100%" }}
              >
                {/* Count label — sits above bar, fixed row height */}
                <div className="h-8 flex items-end justify-center pb-1">
                  {count > 0 && (
                    <span
                      className="font-headline text-base font-bold leading-none"
                      style={{ color: BAR_COLORS[i] }}
                    >
                      {count}
                    </span>
                  )}
                </div>

                {/* Bar */}
                <div
                  className="w-full rounded-t-xl relative overflow-hidden transition-[height] duration-300"
                  style={{ height: `${barHeightPx}px` }}
                >
                  <div
                    className="absolute inset-0 rounded-t-xl"
                    style={{ backgroundColor: BAR_COLORS[i] + "bb" }}
                  />
                  {/* Expected marker line on bar */}
                  {mode === "dice" && (
                    <div
                      className="absolute left-0 right-0 border-t border-primary/40 pointer-events-none"
                      style={{
                        bottom: `${expectedThisBin * innerHeight}px`,
                      }}
                    />
                  )}
                </div>

                {/* Label row */}
                <div className="flex flex-col items-center pt-1.5">
                  {mode === "coin" && (
                    <span className="material-symbols-outlined text-2xl text-on-surface-variant/20 leading-none mb-0.5">
                      {COIN_ICONS[i]}
                    </span>
                  )}
                  <span className="font-sans font-bold uppercase text-[10px] tracking-widest text-on-surface-variant">
                    {labels[i]}
                  </span>
                  {state.total > 0 && (
                    <span className="text-[9px] font-mono text-on-surface-variant/60">
                      {((count / state.total) * 100).toFixed(1)}%
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Parameters panel */}
      {showParams && (
        <div className="mx-6 mb-3 bg-surface-container-low/70 rounded-2xl px-5 py-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/60 mb-3">
            {mode === "coin" ? "Coin Bias" : "Face Weights"}
          </p>
          {mode === "coin" ? (
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="font-body text-on-surface-variant">
                  P(Heads)
                </span>
                <span className="font-mono font-bold text-primary">
                  {coinBias.toFixed(2)}
                </span>
              </div>
              <input
                type="range"
                min="0.01"
                max="0.99"
                step="0.01"
                value={coinBias}
                onChange={(e) => setCoinBias(parseFloat(e.target.value))}
                className="w-full cursor-pointer accent-primary"
              />
              <div className="flex justify-between text-[9px] text-on-surface-variant/50 font-mono">
                <span>Tails-biased</span>
                <span>Fair</span>
                <span>Heads-biased</span>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-6 gap-3">
              {diceWeights.map((w, i) => (
                <div key={i} className="flex flex-col items-center gap-1">
                  <span className="text-[10px] font-mono font-bold text-on-surface-variant/70">
                    {DICE_LABELS[i]}
                  </span>
                  <input
                    type="range"
                    min="0.1"
                    max="5"
                    step="0.1"
                    value={w}
                    onChange={(e) => {
                      const nw = [...diceWeights];
                      nw[i] = parseFloat(e.target.value);
                      setDiceWeights(nw);
                    }}
                    className="h-16 cursor-pointer accent-secondary"
                    style={{ writingMode: "vertical-lr", direction: "rtl" }}
                  />
                  <span className="text-[9px] font-mono text-secondary">
                    {((w / diceTotal) * 100).toFixed(0)}%
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Max simulations */}
          <div className="mt-4 pt-4 border-t border-outline-variant/10 space-y-2">
            <div className="flex justify-between text-xs">
              <span className="font-body text-on-surface-variant">Stop after N flips</span>
              <span className="font-mono font-bold text-primary">
                {maxFlips === 0 ? "∞ unlimited" : maxFlips.toLocaleString()}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="10000"
              step="100"
              value={maxFlips}
              onChange={(e) => setMaxFlips(parseInt(e.target.value))}
              className="w-full cursor-pointer accent-primary"
            />
            <div className="flex justify-between text-[9px] text-on-surface-variant/50 font-mono">
              <span>Unlimited</span>
              <span>10,000</span>
            </div>
          </div>
        </div>
      )}

      {/* Playback controls */}
      <div className="bg-surface-container-high/40 backdrop-blur-md px-6 py-4 flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-5">
          <div className="space-y-1">
            <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/60">
              Speed
            </p>
            <div className="flex items-center gap-2">
              <input
                className="w-28 cursor-pointer accent-primary"
                type="range"
                min="0.5"
                max="10"
                step="0.5"
                value={state.speed}
                onChange={(e) =>
                  setState((prev) => ({
                    ...prev,
                    speed: parseFloat(e.target.value),
                  }))
                }
              />
              <span className="text-xs font-mono font-bold text-primary w-8">
                {state.speed}x
              </span>
            </div>
          </div>
          <div className="w-px h-8 bg-outline-variant/30" />
          <div className="flex items-center gap-2">
            <button
              onClick={reset}
              className="w-10 h-10 rounded-full border border-outline-variant/30 flex items-center justify-center text-on-surface-variant hover:bg-surface-container-lowest transition-colors"
            >
              <span className="material-symbols-outlined text-sm">restart_alt</span>
            </button>
            <button
              onClick={toggleRun}
              className="h-10 px-5 bg-on-background text-background rounded-full font-bold flex items-center gap-2 hover:opacity-90 active:scale-95 transition-all text-sm"
            >
              <span className="material-symbols-outlined text-sm">
                {state.isRunning ? "pause" : "play_arrow"}
              </span>
              {state.isRunning ? "PAUSE" : "RUN"}
            </button>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowParams((p) => !p)}
            className={`px-3 py-2 rounded-lg border text-xs font-bold flex items-center gap-2 transition-colors ${
              showParams
                ? "bg-primary/10 border-primary/40 text-primary"
                : "bg-surface-container-lowest border-outline-variant/20 text-on-surface-variant hover:bg-surface-container-high"
            }`}
          >
            <span className="material-symbols-outlined text-sm">settings_input_component</span>
            PARAMETERS
          </button>
          <button
            onClick={exportCSV}
            disabled={state.total === 0}
            className="px-3 py-2 bg-surface-container-lowest rounded-lg border border-outline-variant/20 text-xs font-bold text-on-surface-variant flex items-center gap-2 hover:bg-surface-container-high transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <span className="material-symbols-outlined text-sm">download</span>
            EXPORT
          </button>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-3 gap-4 px-6 pb-6 pt-4 bg-surface-container-high/20">
        <div className="bg-surface-container-low p-4 rounded-2xl space-y-2">
          <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/60">
            Expected P(Heads)
          </p>
          <p className="font-headline text-2xl text-on-surface">
            {expectedProb.toFixed(3)}
          </p>
          <div className="w-full h-1 bg-outline-variant/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${expectedProb * 100}%` }}
            />
          </div>
        </div>
        <div className="bg-surface-container-low p-4 rounded-2xl space-y-2">
          <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/60">
            Empirical P(Heads)
          </p>
          <p className="font-headline text-2xl text-on-surface">
            {empiricalResult.toFixed(3)}
          </p>
          <div className="flex items-center gap-1 text-[10px] font-bold text-tertiary">
            <span className="material-symbols-outlined text-xs">
              {deviation >= 0 ? "arrow_upward" : "arrow_downward"}
            </span>
            {Math.abs(deviation).toFixed(1)}% from expected
          </div>
        </div>
        <div className="bg-surface-container-low p-4 rounded-2xl space-y-2">
          <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/60">
            Confidence
          </p>
          <p className="font-headline text-2xl text-on-surface">
            {state.total > 30 ? `${confidence.toFixed(1)}%` : "—"}
          </p>
          <p className="text-[10px] font-medium text-on-surface-variant/60 italic">
            99% Wilson score
          </p>
        </div>
      </div>
    </div>
  );
}
