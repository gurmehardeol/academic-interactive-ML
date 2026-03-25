"use client";

import { useEffect, useRef, useState } from "react";

interface Point {
  x: number;
  y: number;
}

interface Params {
  slope: number;
  intercept: number;
}

interface Props {
  density?: number;
  noiseLevel?: number;
  showBestFit?: boolean;
  showResiduals?: boolean;
  showConfidence?: boolean;
}

function generateDataset(n: number, noise: number): Point[] {
  const pts: Point[] = [];
  for (let i = 0; i < n; i++) {
    const x = Math.random() * 8 - 4;
    const y = 1.5 * x + 1 + (Math.random() - 0.5) * noise * 4;
    pts.push({ x, y });
  }
  return pts;
}

function computeOLS(points: Point[]): Params {
  if (points.length < 2) return { slope: 1.5, intercept: 1 };
  const n = points.length;
  const sumX = points.reduce((s, p) => s + p.x, 0);
  const sumY = points.reduce((s, p) => s + p.y, 0);
  const sumXY = points.reduce((s, p) => s + p.x * p.y, 0);
  const sumX2 = points.reduce((s, p) => s + p.x * p.x, 0);
  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;
  return { slope, intercept };
}

function computeMSE(points: Point[], params: Params): number {
  if (points.length === 0) return 0;
  const sum = points.reduce((s, p) => {
    const pred = params.slope * p.x + params.intercept;
    return s + (pred - p.y) ** 2;
  }, 0);
  return sum / points.length;
}

export default function RegressionCanvas({
  density = 28,
  noiseLevel = 0.85,
  showBestFit = false,
  showResiduals = true,
  showConfidence = false,
}: Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [points, setPoints] = useState<Point[]>(() =>
    generateDataset(density, noiseLevel)
  );
  const [userLine, setUserLine] = useState<Params>({ slope: 1.0, intercept: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ x: number; y: number } | null>(null);
  const paramStartRef = useRef<Params>({ slope: 1.0, intercept: 0 });
  const dragModeRef = useRef<"left" | "right" | "body">("body");

  const olsParams = computeOLS(points);
  const currentParams = showBestFit ? olsParams : userLine;
  const mse = computeMSE(points, userLine);
  const olsMSE = computeMSE(points, olsParams);

  const W = 600;
  const H = 400;
  const PAD = 50;

  // Coordinate transforms
  const xExtent = [-5, 5];
  const yExtent = [-8, 10];
  const toSvgX = (x: number) =>
    PAD + ((x - xExtent[0]) / (xExtent[1] - xExtent[0])) * (W - 2 * PAD);
  const toSvgY = (y: number) =>
    H - PAD - ((y - yExtent[0]) / (yExtent[1] - yExtent[0])) * (H - 2 * PAD);
  const toDataX = (sx: number) =>
    ((sx - PAD) / (W - 2 * PAD)) * (xExtent[1] - xExtent[0]) + xExtent[0];
  const toDataY = (sy: number) =>
    ((H - PAD - sy) / (H - 2 * PAD)) * (yExtent[1] - yExtent[0]) + yExtent[0];

  const lineY1 = currentParams.slope * xExtent[0] + currentParams.intercept;
  const lineY2 = currentParams.slope * xExtent[1] + currentParams.intercept;

  const handleMouseDown = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = svgRef.current!.getBoundingClientRect();
    const scaleX = W / rect.width;
    const scaleY = H / rect.height;
    const sx = (e.clientX - rect.left) * scaleX;
    const sy = (e.clientY - rect.top) * scaleY;
    // Check proximity to endpoint handles at x = ±4
    const lhx = toSvgX(-4), lhy = toSvgY(userLine.slope * -4 + userLine.intercept);
    const rhx = toSvgX(4),  rhy = toSvgY(userLine.slope *  4 + userLine.intercept);
    if (Math.hypot(sx - lhx, sy - lhy) < 26) {
      dragModeRef.current = "left";
    } else if (Math.hypot(sx - rhx, sy - rhy) < 26) {
      dragModeRef.current = "right";
    } else {
      dragModeRef.current = "body";
    }
    dragStartRef.current = { x: sx, y: sy };
    paramStartRef.current = { ...userLine };
    setIsDragging(true);
  };

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!isDragging || !dragStartRef.current) return;
    const rect = svgRef.current!.getBoundingClientRect();
    const scaleX = W / rect.width;
    const scaleY = H / rect.height;
    const sx = (e.clientX - rect.left) * scaleX;
    const sy = (e.clientY - rect.top) * scaleY;
    const mode = dragModeRef.current;
    if (mode === "body") {
      // Translate: vertical drag shifts intercept only
      const dy = toDataY(sy) - toDataY(dragStartRef.current.y);
      setUserLine({
        slope: paramStartRef.current.slope,
        intercept: Math.max(-10, Math.min(10, paramStartRef.current.intercept + dy)),
      });
    } else if (mode === "left") {
      // Drag left handle; right end (x=4) stays fixed
      const newYLeft = toDataY(sy);
      const yRight = paramStartRef.current.slope * 4 + paramStartRef.current.intercept;
      const newSlope = (yRight - newYLeft) / 8;
      setUserLine({
        slope: Math.max(-5, Math.min(5, newSlope)),
        intercept: Math.max(-10, Math.min(10, newYLeft - newSlope * -4)),
      });
    } else {
      // Drag right handle; left end (x=-4) stays fixed
      const newYRight = toDataY(sy);
      const yLeft = paramStartRef.current.slope * -4 + paramStartRef.current.intercept;
      const newSlope = (newYRight - yLeft) / 8;
      setUserLine({
        slope: Math.max(-5, Math.min(5, newSlope)),
        intercept: Math.max(-10, Math.min(10, yLeft - newSlope * -4)),
      });
    }
  };

  const handleMouseUp = () => setIsDragging(false);

  const regenerate = () => {
    const newPts = generateDataset(density, noiseLevel);
    setPoints(newPts);
    setUserLine({ slope: 1.0, intercept: 0 });
  };

  useEffect(() => {
    setPoints(generateDataset(density, noiseLevel));
  }, [density, noiseLevel]);

  // Confidence band (±1.96*sigma)
  const sigma = Math.sqrt(mse);
  const confBandPath = `
    M ${toSvgX(xExtent[0])} ${toSvgY(olsParams.slope * xExtent[0] + olsParams.intercept + 1.96 * sigma)}
    L ${toSvgX(xExtent[1])} ${toSvgY(olsParams.slope * xExtent[1] + olsParams.intercept + 1.96 * sigma)}
    L ${toSvgX(xExtent[1])} ${toSvgY(olsParams.slope * xExtent[1] + olsParams.intercept - 1.96 * sigma)}
    L ${toSvgX(xExtent[0])} ${toSvgY(olsParams.slope * xExtent[0] + olsParams.intercept - 1.96 * sigma)}
    Z
  `;

  return (
    <div className="flex flex-col gap-6">
      {/* Main SVG canvas */}
      <div className="bg-surface-container-lowest rounded-xl p-6 canvas-grid relative overflow-hidden">
        <div className="mb-3 flex items-start justify-between">
          <div>
            <h2 className="font-headline text-2xl font-light tracking-tight text-on-surface mb-1">
              Linear Fit Exploration
            </h2>
            <p className="font-body text-sm text-on-surface-variant max-w-md">
              Drag the regression line to observe how MSE changes. Compare to
              the optimal OLS fit.
            </p>
          </div>
          <div className="glass-panel px-5 py-2 rounded-full flex items-center gap-3">
            <span className="font-label text-[10px] uppercase tracking-widest text-secondary font-bold">
              Current MSE
            </span>
            <span className="font-headline text-lg tabular-nums">
              {mse.toFixed(2)}
            </span>
            {showBestFit && (
              <span className="text-[10px] text-tertiary font-bold">
                (OLS: {olsMSE.toFixed(2)})
              </span>
            )}
          </div>
        </div>

        <svg
          ref={svgRef}
          viewBox={`0 0 ${W} ${H}`}
          className={`w-full ${isDragging ? "cursor-grabbing" : "cursor-grab"}`}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {/* Grid lines */}
          {[-4, -2, 0, 2, 4].map((v) => (
            <g key={v}>
              <line
                x1={toSvgX(v)}
                y1={PAD}
                x2={toSvgX(v)}
                y2={H - PAD}
                stroke="#bfc7d1"
                strokeWidth="0.5"
                strokeOpacity="0.4"
              />
              <line
                x1={PAD}
                y1={toSvgY(v * 1.5)}
                x2={W - PAD}
                y2={toSvgY(v * 1.5)}
                stroke="#bfc7d1"
                strokeWidth="0.5"
                strokeOpacity="0.4"
              />
            </g>
          ))}

          {/* Axes */}
          <line
            x1={PAD}
            y1={toSvgY(0)}
            x2={W - PAD}
            y2={toSvgY(0)}
            stroke="#bfc7d1"
            strokeWidth="1.5"
          />
          <line
            x1={toSvgX(0)}
            y1={PAD}
            x2={toSvgX(0)}
            y2={H - PAD}
            stroke="#bfc7d1"
            strokeWidth="1.5"
          />

          {/* Confidence band */}
          {showConfidence && (
            <path d={confBandPath} fill="#006496" fillOpacity="0.07" />
          )}

          {/* OLS best-fit line */}
          {showBestFit && (
            <line
              x1={toSvgX(xExtent[0])}
              y1={toSvgY(lineY1)}
              x2={toSvgX(xExtent[1])}
              y2={toSvgY(lineY2)}
              stroke="#536600"
              strokeWidth="1.5"
              strokeDasharray="6 3"
              opacity="0.7"
            />
          )}

          {/* Residual lines */}
          {showResiduals &&
            points.map((p, i) => {
              const pred = userLine.slope * p.x + userLine.intercept;
              return (
                <line
                  key={i}
                  x1={toSvgX(p.x)}
                  y1={toSvgY(p.y)}
                  x2={toSvgX(p.x)}
                  y2={toSvgY(pred)}
                  stroke="#964900"
                  strokeWidth="1"
                  strokeDasharray="3 2"
                  opacity="0.4"
                />
              );
            })}

          {/* User's regression line */}
          <line
            x1={toSvgX(xExtent[0])}
            y1={toSvgY(userLine.slope * xExtent[0] + userLine.intercept)}
            x2={toSvgX(xExtent[1])}
            y2={toSvgY(userLine.slope * xExtent[1] + userLine.intercept)}
            stroke="#964900"
            strokeWidth="2.5"
          />

          {/* Endpoint drag handles */}
          {!showBestFit && (
            <>
              <circle
                cx={toSvgX(-4)}
                cy={toSvgY(userLine.slope * -4 + userLine.intercept)}
                r={8}
                fill="#964900"
                stroke="white"
                strokeWidth="2.5"
                style={{ cursor: "ew-resize" }}
              />
              <circle
                cx={toSvgX(4)}
                cy={toSvgY(userLine.slope * 4 + userLine.intercept)}
                r={8}
                fill="#964900"
                stroke="white"
                strokeWidth="2.5"
                style={{ cursor: "ew-resize" }}
              />
              <text
                x={toSvgX(0)}
                y={toSvgY(userLine.intercept) + (userLine.intercept > 3 ? 18 : -10)}
                textAnchor="middle"
                fontSize="8"
                fontFamily="Inter"
                fill="rgba(150,73,0,0.45)"
              >
                drag body ↕ · handles to rotate
              </text>
            </>
          )}

          {/* Data points */}
          {points.map((p, i) => (
            <circle
              key={i}
              cx={toSvgX(p.x)}
              cy={toSvgY(p.y)}
              r="4"
              fill="#536600"
              fillOpacity="0.85"
              className="drop-shadow-sm"
            />
          ))}

          {/* Axis labels */}
          <text
            x={W / 2}
            y={H - 8}
            textAnchor="middle"
            fontSize="9"
            fontFamily="Inter"
            fill="#707881"
            fontWeight="700"
            style={{ textTransform: "uppercase", letterSpacing: "0.1em" }}
          >
            INDEPENDENT VARIABLE (X)
          </text>
          <text
            x={14}
            y={H / 2}
            textAnchor="middle"
            fontSize="9"
            fontFamily="Inter"
            fill="#707881"
            fontWeight="700"
            transform={`rotate(-90, 14, ${H / 2})`}
            style={{ textTransform: "uppercase", letterSpacing: "0.1em" }}
          >
            DEPENDENT VARIABLE (Y)
          </text>

          {/* Line equation */}
          <text
            x={W - PAD - 4}
            y={PAD + 16}
            textAnchor="end"
            fontSize="11"
            fontFamily="'Noto Serif', serif"
            fill="#964900"
            fontStyle="italic"
          >
            ŷ = {userLine.slope.toFixed(2)}x + {userLine.intercept.toFixed(2)}
          </text>
        </svg>
      </div>
    </div>
  );
}
