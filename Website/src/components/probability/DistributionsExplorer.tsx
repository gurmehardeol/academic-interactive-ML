"use client";

import { useState, useMemo } from "react";

// ─── Math helpers ─────────────────────────────────────────────────────────────

function factorial(n: number): number {
  if (n <= 1) return 1;
  let r = 1;
  for (let i = 2; i <= n; i++) r *= i;
  return r;
}

function combination(n: number, k: number): number {
  if (k < 0 || k > n) return 0;
  if (k === 0 || k === n) return 1;
  // Use log-space to avoid overflow
  let logResult = 0;
  for (let i = 0; i < k; i++) {
    logResult += Math.log(n - i) - Math.log(i + 1);
  }
  return Math.exp(logResult);
}

function normalPDF(x: number, mu: number, sigma: number): number {
  return (
    (1 / (sigma * Math.sqrt(2 * Math.PI))) *
    Math.exp(-0.5 * ((x - mu) / sigma) ** 2)
  );
}

function binomialPMF(k: number, n: number, p: number): number {
  return combination(n, k) * Math.pow(p, k) * Math.pow(1 - p, n - k);
}

function poissonPMF(k: number, lambda: number): number {
  // log-space: k*ln(lambda) - lambda - ln(k!)
  let logFact = 0;
  for (let i = 2; i <= k; i++) logFact += Math.log(i);
  return Math.exp(k * Math.log(Math.max(lambda, 1e-10)) - lambda - logFact);
}

// Rational approximation for the normal inverse CDF (Acklam's algorithm)
function normInv(p: number): number {
  const a = [-3.969683028665376e1, 2.209460984245205e2, -2.759285104469687e2, 1.383577518672690e2, -3.066479806614716e1, 2.506628277459239];
  const b = [-5.447609879822406e1, 1.615858368580409e2, -1.556989798598866e2, 6.680131188771972e1, -1.328068155288572e1];
  const c = [-7.784894002430293e-3, -3.223964580411365e-1, -2.400758277161838, -2.549732539343734, 4.374664141464968, 2.938163982698783];
  const d = [7.784695709041462e-3, 3.224671290700398e-1, 2.445134137142996, 3.754408661907416];
  const pLow = 0.02425, pHigh = 1 - pLow;
  if (p < pLow) {
    const q = Math.sqrt(-2 * Math.log(p));
    return (((((c[0]*q+c[1])*q+c[2])*q+c[3])*q+c[4])*q+c[5]) / ((((d[0]*q+d[1])*q+d[2])*q+d[3])*q+1);
  } else if (p <= pHigh) {
    const q = p - 0.5, r = q * q;
    return (((((a[0]*r+a[1])*r+a[2])*r+a[3])*r+a[4])*r+a[5])*q / (((((b[0]*r+b[1])*r+b[2])*r+b[3])*r+b[4])*r+1);
  } else {
    const q = Math.sqrt(-2 * Math.log(1 - p));
    return -(((((c[0]*q+c[1])*q+c[2])*q+c[3])*q+c[4])*q+c[5]) / ((((d[0]*q+d[1])*q+d[2])*q+d[3])*q+1);
  }
}

// ─── Types ───────────────────────────────────────────────────────────────────

type DistType = "normal" | "binomial" | "poisson";

// ─── SVG chart helper ─────────────────────────────────────────────────────────

interface ChartPoint {
  x: number;
  y: number;
  label?: string;
}

interface DistChartProps {
  points: ChartPoint[];
  isContinuous: boolean;
  color: string;
  secondaryColor: string;
  ev: number;
  stdDev: number;
  p25: number;
  p5: number;
  p75: number;
  p95: number;
  showEV: boolean;
  showSD: boolean;
  showPercentiles: boolean;
  xMin: number;
  xMax: number;
  yMax: number;
}

function DistChart({
  points,
  isContinuous,
  color,
  secondaryColor,
  ev,
  stdDev,
  p25,
  p5,
  p75,
  p95,
  showEV,
  showSD,
  showPercentiles,
  xMin,
  xMax,
  yMax,
}: DistChartProps) {
  const W = 560;
  const H = 260;
  const PAD = { top: 24, right: 20, bottom: 36, left: 44 };
  const plotW = W - PAD.left - PAD.right;
  const plotH = H - PAD.top - PAD.bottom;

  const toSvgX = (x: number) =>
    PAD.left + ((x - xMin) / (xMax - xMin)) * plotW;
  const toSvgY = (y: number) =>
    PAD.top + plotH - (y / Math.max(yMax, 1e-10)) * plotH;

  const areaPath = isContinuous
    ? [
        `M ${toSvgX(points[0].x)} ${PAD.top + plotH}`,
        ...points.map((p) => `L ${toSvgX(p.x)} ${toSvgY(p.y)}`),
        `L ${toSvgX(points[points.length - 1].x)} ${PAD.top + plotH}`,
        "Z",
      ].join(" ")
    : "";

  const linePath = isContinuous
    ? points
        .map((p, i) => `${i === 0 ? "M" : "L"} ${toSvgX(p.x)} ${toSvgY(p.y)}`)
        .join(" ")
    : "";

  // Grid
  const yTicks = [0.25, 0.5, 0.75, 1.0].map((f) => yMax * f);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full" preserveAspectRatio="xMidYMid meet">
      {/* Grid */}
      {yTicks.map((v, i) => (
        <g key={i}>
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
            x={PAD.left - 5}
            y={toSvgY(v) + 4}
            textAnchor="end"
            fontSize="8"
            fontFamily="Inter"
            fill="#707881"
          >
            {v < 0.01 ? v.toFixed(4) : v < 0.1 ? v.toFixed(3) : v.toFixed(2)}
          </text>
        </g>
      ))}

      {/* SDrange shading */}
      {showSD && isContinuous && (
        <rect
          x={toSvgX(ev - stdDev)}
          y={PAD.top}
          width={toSvgX(ev + stdDev) - toSvgX(ev - stdDev)}
          height={plotH}
          fill={color}
          fillOpacity="0.07"
        />
      )}

      {/* Area fill (continuous) */}
      {isContinuous && (
        <path d={areaPath} fill={color} fillOpacity="0.12" />
      )}

      {/* Bars (discrete) */}
      {!isContinuous &&
        points.map((p) => {
          const barW = Math.max(2, (plotW / (xMax - xMin)) * 0.6);
          const x = toSvgX(p.x) - barW / 2;
          const y = toSvgY(p.y);
          const barH = PAD.top + plotH - y;
          return (
            <g key={p.x}>
              <rect
                x={x}
                y={y}
                width={barW}
                height={Math.max(0, barH)}
                fill={color}
                fillOpacity="0.75"
                rx="1"
              />
            </g>
          );
        })}

      {/* Line (continuous) */}
      {isContinuous && (
        <path d={linePath} fill="none" stroke={color} strokeWidth="2.5" />
      )}

      {/* E[X] line */}
      {showEV && (
        <>
          <line
            x1={toSvgX(ev)}
            y1={PAD.top}
            x2={toSvgX(ev)}
            y2={PAD.top + plotH}
            stroke="#006496"
            strokeWidth="1.5"
            strokeDasharray="5 3"
            opacity="0.8"
          />
          <text
            x={toSvgX(ev) + 4}
            y={PAD.top + 14}
            fontSize="9"
            fontFamily="'Noto Serif', serif"
            fill="#006496"
            fontStyle="italic"
          >
            μ = {ev.toFixed(2)}
          </text>
        </>
      )}

      {/* SD brackets */}
      {showSD && isContinuous && (
        <>
          <line
            x1={toSvgX(ev - stdDev)}
            y1={PAD.top}
            x2={toSvgX(ev - stdDev)}
            y2={PAD.top + plotH}
            stroke={secondaryColor}
            strokeWidth="1"
            strokeDasharray="3 2"
            opacity="0.5"
          />
          <line
            x1={toSvgX(ev + stdDev)}
            y1={PAD.top}
            x2={toSvgX(ev + stdDev)}
            y2={PAD.top + plotH}
            stroke={secondaryColor}
            strokeWidth="1"
            strokeDasharray="3 2"
            opacity="0.5"
          />
          <text
            x={toSvgX(ev + stdDev) + 4}
            y={PAD.top + 28}
            fontSize="9"
            fontFamily="'Noto Serif', serif"
            fill={secondaryColor}
            fontStyle="italic"
          >
            +σ
          </text>
          <text
            x={toSvgX(ev - stdDev) + 4}
            y={PAD.top + 28}
            fontSize="9"
            fontFamily="'Noto Serif', serif"
            fill={secondaryColor}
            fontStyle="italic"
          >
            −σ
          </text>
        </>
      )}

      {/* Percentile shading + lines — symmetric (P5/P25 on left, P75/P95 on right) */}
      {showPercentiles && (
        <>
          {/* Middle 50% band: P25 → P75 */}
          <rect
            x={toSvgX(Math.max(p25, xMin))}
            y={PAD.top}
            width={Math.max(0, toSvgX(Math.min(p75, xMax)) - toSvgX(Math.max(p25, xMin)))}
            height={plotH}
            fill="#536600"
            fillOpacity="0.08"
          />
          {/* Middle 90% outer band: P5 → P25 and P75 → P95 */}
          <rect
            x={toSvgX(Math.max(p5, xMin))}
            y={PAD.top}
            width={Math.max(0, toSvgX(Math.min(p25, xMax)) - toSvgX(Math.max(p5, xMin)))}
            height={plotH}
            fill="#964900"
            fillOpacity="0.06"
          />
          <rect
            x={toSvgX(Math.max(p75, xMin))}
            y={PAD.top}
            width={Math.max(0, toSvgX(Math.min(p95, xMax)) - toSvgX(Math.max(p75, xMin)))}
            height={plotH}
            fill="#964900"
            fillOpacity="0.06"
          />

          {/* P25 line */}
          {p25 >= xMin && p25 <= xMax && (
            <g>
              <line x1={toSvgX(p25)} y1={PAD.top} x2={toSvgX(p25)} y2={PAD.top + plotH}
                stroke="#536600" strokeWidth="1.5" strokeDasharray="4 2" opacity="0.85" />
              <text x={toSvgX(p25) - 3} y={PAD.top + plotH - 6} fontSize="8" fontFamily="Inter"
                fill="#536600" fontWeight="700" textAnchor="end">P25</text>
            </g>
          )}
          {/* P75 line */}
          {p75 >= xMin && p75 <= xMax && (
            <g>
              <line x1={toSvgX(p75)} y1={PAD.top} x2={toSvgX(p75)} y2={PAD.top + plotH}
                stroke="#536600" strokeWidth="1.5" strokeDasharray="4 2" opacity="0.85" />
              <text x={toSvgX(p75) + 3} y={PAD.top + plotH - 6} fontSize="8" fontFamily="Inter"
                fill="#536600" fontWeight="700">P75</text>
            </g>
          )}
          {/* P5 line */}
          {p5 >= xMin && p5 <= xMax && (
            <g>
              <line x1={toSvgX(p5)} y1={PAD.top} x2={toSvgX(p5)} y2={PAD.top + plotH}
                stroke="#964900" strokeWidth="1.5" strokeDasharray="4 2" opacity="0.85" />
              <text x={toSvgX(p5) - 3} y={PAD.top + plotH - 6} fontSize="8" fontFamily="Inter"
                fill="#964900" fontWeight="700" textAnchor="end">P5</text>
            </g>
          )}
          {/* P95 line */}
          {p95 >= xMin && p95 <= xMax && (
            <g>
              <line x1={toSvgX(p95)} y1={PAD.top} x2={toSvgX(p95)} y2={PAD.top + plotH}
                stroke="#964900" strokeWidth="1.5" strokeDasharray="4 2" opacity="0.85" />
              <text x={toSvgX(p95) + 3} y={PAD.top + plotH - 6} fontSize="8" fontFamily="Inter"
                fill="#964900" fontWeight="700">P95</text>
            </g>
          )}
        </>
      )}

      {/* Axes */}
      <line x1={PAD.left} y1={PAD.top} x2={PAD.left} y2={PAD.top + plotH} stroke="#bfc7d1" strokeWidth="1" />
      <line x1={PAD.left} y1={PAD.top + plotH} x2={W - PAD.right} y2={PAD.top + plotH} stroke="#bfc7d1" strokeWidth="1" />

      {/* X-axis ticks */}
      {points
        .filter((_, i) => isContinuous ? i % Math.ceil(points.length / 8) === 0 : true)
        .map((p) => (
          <g key={`tick-${p.x}`}>
            <line
              x1={toSvgX(p.x)}
              y1={PAD.top + plotH}
              x2={toSvgX(p.x)}
              y2={PAD.top + plotH + 4}
              stroke="#bfc7d1"
              strokeWidth="1"
            />
            <text
              x={toSvgX(p.x)}
              y={PAD.top + plotH + 14}
              textAnchor="middle"
              fontSize="8"
              fontFamily="Inter"
              fill="#707881"
            >
              {isContinuous ? p.x.toFixed(1) : p.x}
            </text>
          </g>
        ))}
    </svg>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function DistributionsExplorer() {
  const [distType, setDistType] = useState<DistType>("normal");
  // Normal params
  const [mu, setMu] = useState(0);
  const [sigma, setSigma] = useState(1);
  // Binomial params
  const [binN, setBinN] = useState(20);
  const [binP, setBinP] = useState(0.4);
  // Poisson params
  const [lambda, setLambda] = useState(4);
  // Overlay toggles
  const [showEV, setShowEV] = useState(true);
  const [showSD, setShowSD] = useState(true);
  const [showPercentiles, setShowPercentiles] = useState(false);

  const { points, ev, stdDev, variance, isContinuous, xMin, xMax, yMax, formula, description, p25, p5, p75, p95 } =
    useMemo(() => {
      if (distType === "normal") {
        const range = sigma * 4;
        const xMin = mu - range;
        const xMax = mu + range;
        const steps = 200;
        const pts = Array.from({ length: steps + 1 }, (_, i) => {
          const x = xMin + (i / steps) * (xMax - xMin);
          return { x, y: normalPDF(x, mu, sigma) };
        });
        const yMax = Math.max(...pts.map((p) => p.y)) * 1.15;
        return {
          points: pts,
          ev: mu,
          stdDev: sigma,
          variance: sigma ** 2,
          isContinuous: true,
          xMin,
          xMax,
          yMax,
          p25: mu + sigma * normInv(0.25),
          p5:  mu + sigma * normInv(0.05),
          p75: mu + sigma * normInv(0.75),
          p95: mu + sigma * normInv(0.95),
          formula: "f(x) = (1/σ√2π) · e^(-(x-μ)²/2σ²)",
          description:
            "The bell curve. Symmetric around μ, with spread controlled by σ. Arises naturally via the Central Limit Theorem.",
        };
      }

      if (distType === "binomial") {
        const pts = Array.from({ length: binN + 1 }, (_, k) => ({
          x: k,
          y: binomialPMF(k, binN, binP),
          label: String(k),
        }));
        const ev = binN * binP;
        const variance = binN * binP * (1 - binP);
        const yMax = Math.max(...pts.map((p) => p.y)) * 1.2;
        let binP25 = -1, binP5 = -1, binP75 = -1, binP95 = -1, cumBin = 0;
        for (let k = 0; k <= binN; k++) {
          cumBin += binomialPMF(k, binN, binP);
          if (cumBin >= 0.05 && binP5  === -1) binP5  = k;
          if (cumBin >= 0.25 && binP25 === -1) binP25 = k;
          if (cumBin >= 0.75 && binP75 === -1) binP75 = k;
          if (cumBin >= 0.95 && binP95 === -1) binP95 = k;
        }
        return {
          points: pts,
          ev,
          stdDev: Math.sqrt(variance),
          variance,
          isContinuous: false,
          xMin: -0.5,
          xMax: binN + 0.5,
          yMax,
          p25: binP25 === -1 ? 0    : binP25,
          p5:  binP5  === -1 ? 0    : binP5,
          p75: binP75 === -1 ? binN : binP75,
          p95: binP95 === -1 ? binN : binP95,
          formula: "P(X=k) = C(n,k) · pᵏ · (1−p)ⁿ⁻ᵏ",
          description:
            "Models the number of successes in n independent Bernoulli trials, each with probability p.",
        };
      }

      // Poisson
      const maxK = Math.min(Math.ceil(lambda + 4 * Math.sqrt(lambda) + 5), 50);
      const pts = Array.from({ length: maxK + 1 }, (_, k) => ({
        x: k,
        y: poissonPMF(k, lambda),
        label: String(k),
      }));
      const yMax = Math.max(...pts.map((p) => p.y)) * 1.2;
      let poisP25 = -1, poisP5 = -1, poisP75 = -1, poisP95 = -1, cumPois = 0;
      for (let k = 0; k <= maxK; k++) {
        cumPois += poissonPMF(k, lambda);
        if (cumPois >= 0.05 && poisP5  === -1) poisP5  = k;
        if (cumPois >= 0.25 && poisP25 === -1) poisP25 = k;
        if (cumPois >= 0.75 && poisP75 === -1) poisP75 = k;
        if (cumPois >= 0.95 && poisP95 === -1) poisP95 = k;
      }
      return {
        points: pts,
        ev: lambda,
        stdDev: Math.sqrt(lambda),
        variance: lambda,
        isContinuous: false,
        xMin: -0.5,
        xMax: maxK + 0.5,
        yMax,
        p25: poisP25 === -1 ? 0    : poisP25,
        p5:  poisP5  === -1 ? 0    : poisP5,
        p75: poisP75 === -1 ? maxK : poisP75,
        p95: poisP95 === -1 ? maxK : poisP95,
        formula: "P(X=k) = (λᵏ · e⁻λ) / k!",
        description:
          "Models the number of events occurring in a fixed interval when events happen at a constant average rate λ.",
      };
    }, [distType, mu, sigma, binN, binP, lambda]);

  const distTabs: { key: DistType; label: string; color: string }[] = [
    { key: "normal", label: "Normal", color: "#006496" },
    { key: "binomial", label: "Binomial", color: "#964900" },
    { key: "poisson", label: "Poisson", color: "#536600" },
  ];

  const activeColor =
    distType === "normal" ? "#006496" : distType === "binomial" ? "#964900" : "#536600";
  const secondaryColor =
    distType === "normal" ? "#964900" : distType === "binomial" ? "#536600" : "#964900";

  return (
    <div className="bg-surface-container-lowest rounded-[2rem] overflow-hidden canvas-shadow flex flex-col">
      {/* Distribution type selector */}
      <div className="px-8 pt-7 pb-4 flex items-center justify-between flex-wrap gap-4">
        <div className="flex bg-surface-variant/70 backdrop-blur-xl p-1 rounded-full shadow-sm">
          {distTabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setDistType(tab.key)}
              className={`px-5 py-2 rounded-full text-xs font-bold transition-all ${
                distType === tab.key
                  ? "bg-white text-on-surface shadow-sm"
                  : "text-on-surface-variant hover:bg-white/40"
              }`}
              style={distType === tab.key ? { color: tab.color } : {}}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Overlay toggles */}
        <div className="flex gap-4 flex-wrap">
          {[
            { label: "E[X]", value: showEV, set: setShowEV },
            { label: "± σ", value: showSD, set: setShowSD },
            { label: "P75/P95", value: showPercentiles, set: setShowPercentiles },
          ].map(({ label, value, set }) => (
            <label key={label} className="flex items-center gap-2 cursor-pointer">
              <button
                onClick={() => set(!value)}
                className={`w-8 h-4 rounded-full relative transition-colors ${
                  value ? "bg-primary/80" : "bg-outline-variant/30"
                }`}
              >
                <div
                  className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all shadow-sm ${
                    value ? "right-0.5" : "left-0.5"
                  }`}
                />
              </button>
              <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant/70">
                {label}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div className="px-6 h-72">
        <DistChart
          points={points}
          isContinuous={isContinuous}
          color={activeColor}
          secondaryColor={secondaryColor}
          ev={ev}
          stdDev={stdDev}
          p25={p25}
          p5={p5}
          p75={p75}
          p95={p95}
          showEV={showEV}
          showSD={showSD}
          showPercentiles={showPercentiles}
          xMin={xMin}
          xMax={xMax}
          yMax={yMax}
        />
      </div>

      {/* Description + formula */}
      <div className="px-8 py-4 bg-surface-container-low/40 mx-6 mb-4 rounded-xl flex items-center justify-between gap-4">
        <p className="text-sm font-body text-on-surface-variant leading-relaxed flex-1">
          {description}
        </p>
        <code
          className="text-[11px] font-mono flex-shrink-0 px-3 py-2 rounded-lg bg-surface-container-lowest"
          style={{ color: activeColor }}
        >
          {formula}
        </code>
      </div>

      {/* Parameter controls */}
      <div className="px-8 pb-6">
        <p className="text-[10px] font-bold uppercase tracking-widest text-outline mb-5">
          Parameters
        </p>

        {distType === "normal" && (
          <div className="grid grid-cols-2 gap-8">
            {[
              {
                label: "Mean μ",
                value: mu,
                set: setMu,
                min: -5,
                max: 5,
                step: 0.1,
                display: mu.toFixed(1),
              },
              {
                label: "Std Dev σ",
                value: sigma,
                set: setSigma,
                min: 0.1,
                max: 4,
                step: 0.05,
                display: sigma.toFixed(2),
              },
            ].map(({ label, value, set, min, max, step, display }) => (
              <div key={label} className="space-y-2">
                <div className="flex justify-between">
                  <label className="text-xs font-medium text-on-surface">
                    {label}
                  </label>
                  <span
                    className="text-[10px] font-mono font-bold"
                    style={{ color: activeColor }}
                  >
                    {display}
                  </span>
                </div>
                <input
                  type="range"
                  min={min}
                  max={max}
                  step={step}
                  value={value}
                  onChange={(e) => set(parseFloat(e.target.value))}
                  className="w-full h-1 rounded-full appearance-none cursor-pointer"
                  style={{ accentColor: activeColor }}
                />
              </div>
            ))}
          </div>
        )}

        {distType === "binomial" && (
          <div className="grid grid-cols-2 gap-8">
            {[
              {
                label: "Trials n",
                value: binN,
                set: (v: number) => setBinN(Math.round(v)),
                min: 1,
                max: 50,
                step: 1,
                display: String(binN),
              },
              {
                label: "Probability p",
                value: binP,
                set: setBinP,
                min: 0.01,
                max: 0.99,
                step: 0.01,
                display: binP.toFixed(2),
              },
            ].map(({ label, value, set, min, max, step, display }) => (
              <div key={label} className="space-y-2">
                <div className="flex justify-between">
                  <label className="text-xs font-medium text-on-surface">
                    {label}
                  </label>
                  <span
                    className="text-[10px] font-mono font-bold"
                    style={{ color: activeColor }}
                  >
                    {display}
                  </span>
                </div>
                <input
                  type="range"
                  min={min}
                  max={max}
                  step={step}
                  value={value}
                  onChange={(e) => set(parseFloat(e.target.value))}
                  className="w-full h-1 rounded-full appearance-none cursor-pointer"
                  style={{ accentColor: activeColor }}
                />
              </div>
            ))}
          </div>
        )}

        {distType === "poisson" && (
          <div className="max-w-sm space-y-2">
            <div className="flex justify-between">
              <label className="text-xs font-medium text-on-surface">
                Rate λ (events per interval)
              </label>
              <span
                className="text-[10px] font-mono font-bold"
                style={{ color: activeColor }}
              >
                {lambda.toFixed(1)}
              </span>
            </div>
            <input
              type="range"
              min={0.1}
              max={20}
              step={0.1}
              value={lambda}
              onChange={(e) => setLambda(parseFloat(e.target.value))}
              className="w-full h-1 rounded-full appearance-none cursor-pointer"
              style={{ accentColor: activeColor }}
            />
          </div>
        )}
      </div>

      {/* Stats footer */}
      <div className="grid grid-cols-3 gap-4 px-6 pb-7 pt-2">
        {[
          {
            label: "Mean E[X]",
            value: ev.toFixed(4),
            color: "text-primary",
          },
          {
            label: "Variance σ²",
            value: variance.toFixed(4),
            color: "text-secondary",
          },
          {
            label: "Std Dev σ",
            value: stdDev.toFixed(4),
            color: "text-tertiary",
          },
        ].map(({ label, value, color }) => (
          <div
            key={label}
            className="bg-surface-container-low p-4 rounded-2xl space-y-1"
          >
            <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/60">
              {label}
            </p>
            <p className={`font-headline text-2xl ${color}`}>{value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
