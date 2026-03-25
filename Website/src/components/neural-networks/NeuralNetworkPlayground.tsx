"use client";

import { useState, useEffect, useRef, useCallback } from "react";

type ActivationFn = "relu" | "sigmoid" | "tanh";

interface LayerConfig {
  neurons: number;
}

interface TrainingState {
  isTraining: boolean;
  epoch: number;
  lossHistory: number[];
  valLossHistory: number[];
}

function sigmoid(x: number): number {
  return 1 / (1 + Math.exp(-x));
}

function relu(x: number): number {
  return Math.max(0, x);
}

function tanhFn(x: number): number {
  return Math.tanh(x);
}

function activate(x: number, fn: ActivationFn): number {
  if (fn === "relu") return relu(x);
  if (fn === "tanh") return tanhFn(x);
  return sigmoid(x);
}

// Simulated loss function for display purposes
function simulateLoss(epoch: number, baseLoss: number): number {
  return (
    baseLoss * Math.exp(-0.004 * epoch) +
    0.02 * Math.random() +
    0.03 * Math.cos(epoch * 0.05)
  );
}

export default function NeuralNetworkPlayground() {
  const [layers, setLayers] = useState<LayerConfig[]>([
    { neurons: 3 },
    { neurons: 4 },
    { neurons: 3 },
  ]);
  const [learningRate, setLearningRate] = useState(0.03);
  const [activation, setActivation] = useState<ActivationFn>("relu");
  const [training, setTraining] = useState<TrainingState>({
    isTraining: false,
    epoch: 0,
    lossHistory: [],
    valLossHistory: [],
  });

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const runTrainingStep = useCallback(() => {
    setTraining((prev) => {
      const newEpoch = prev.epoch + 1;
      const loss = simulateLoss(newEpoch, 1.2 - learningRate * 5);
      const valLoss = simulateLoss(newEpoch, 1.5 - learningRate * 4) + 0.02;
      return {
        ...prev,
        epoch: newEpoch,
        lossHistory: [...prev.lossHistory.slice(-99), Math.max(0.01, loss)],
        valLossHistory: [
          ...prev.valLossHistory.slice(-99),
          Math.max(0.015, valLoss),
        ],
      };
    });
  }, [learningRate]);

  useEffect(() => {
    if (training.isTraining) {
      intervalRef.current = setInterval(runTrainingStep, 80);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [training.isTraining, runTrainingStep]);

  const toggleTraining = () => {
    setTraining((prev) => ({ ...prev, isTraining: !prev.isTraining }));
  };

  const resetWeights = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setTraining({ isTraining: false, epoch: 0, lossHistory: [], valLossHistory: [] });
  };

  const addLayer = () => {
    if (layers.length < 5) {
      setLayers((prev) => [...prev.slice(0, -1), { neurons: 3 }, prev[prev.length - 1]]);
    }
  };

  const removeLayer = () => {
    if (layers.length > 1) {
      setLayers((prev) => [...prev.slice(0, -2), prev[prev.length - 1]]);
    }
  };

  const updateNeurons = (index: number, delta: number) => {
    setLayers((prev) =>
      prev.map((l, i) =>
        i === index
          ? { neurons: Math.max(1, Math.min(8, l.neurons + delta)) }
          : l
      )
    );
  };

  const inputNeurons = 2;
  const outputNeurons = 1;
  const allLayers = [
    { neurons: inputNeurons },
    ...layers,
    { neurons: outputNeurons },
  ];

  // SVG network dimensions
  const SVG_W = 700;
  const SVG_H = 360;
  const layerCount = allLayers.length;
  const layerSpacing = SVG_W / (layerCount + 1);

  // Loss chart path
  const chartPath = (() => {
    const hist = training.lossHistory;
    if (hist.length < 2) return "";
    const maxLoss = Math.max(...hist, 0.1);
    const w = 200;
    const h = 120;
    return hist
      .map((v, i) => {
        const x = (i / (hist.length - 1)) * w;
        const y = h - (v / maxLoss) * h;
        return `${i === 0 ? "M" : "L"} ${x} ${y}`;
      })
      .join(" ");
  })();

  const valChartPath = (() => {
    const hist = training.valLossHistory;
    if (hist.length < 2) return "";
    const allHist = [...training.lossHistory, ...hist];
    const maxLoss = Math.max(...allHist, 0.1);
    const w = 200;
    const h = 120;
    return hist
      .map((v, i) => {
        const x = (i / (hist.length - 1)) * w;
        const y = h - (v / maxLoss) * h;
        return `${i === 0 ? "M" : "L"} ${x} ${y}`;
      })
      .join(" ");
  })();

  const currentLoss =
    training.lossHistory.length > 0
      ? training.lossHistory[training.lossHistory.length - 1].toFixed(4)
      : "—";

  return (
    <div className="space-y-12">
      {/* Header */}
      <header className="max-w-4xl">
        <h1 className="font-headline text-5xl md:text-6xl text-on-surface mb-4 leading-tight">
          Neural Networks Playground
        </h1>
        <p className="font-body text-lg text-on-surface-variant max-w-2xl leading-relaxed">
          Experiment with the fundamental building blocks of intelligence. Adjust
          hyperparameters, manipulate layers, and observe how backpropagation
          refines the model in real-time.
        </p>
      </header>

      {/* Main grid */}
      <div className="grid grid-cols-12 gap-8">
        {/* Control panel */}
        <div className="col-span-12 lg:col-span-3 order-2 lg:order-1">
          <div className="bg-surface-container-low rounded-xl p-6 flex flex-col gap-8 lg:sticky top-24">
            {/* Hyperparameters */}
            <section>
              <label className="block font-label text-[11px] uppercase tracking-wider font-bold text-secondary mb-4">
                Hyperparameters
              </label>
              <div className="space-y-5">
                <div>
                  <div className="flex justify-between text-xs mb-2 font-semibold">
                    <span className="text-on-surface">Learning Rate</span>
                    <span className="text-primary">{learningRate}</span>
                  </div>
                  <input
                    className="w-full h-1 bg-surface-container-highest rounded-full appearance-none accent-primary cursor-pointer"
                    type="range"
                    min="0.001"
                    max="0.1"
                    step="0.001"
                    value={learningRate}
                    onChange={(e) =>
                      setLearningRate(parseFloat(e.target.value))
                    }
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-2 text-on-surface">
                    Activation Function
                  </label>
                  <div className="flex flex-col gap-2">
                    {(["relu", "sigmoid", "tanh"] as ActivationFn[]).map(
                      (fn) => (
                        <label
                          key={fn}
                          className="flex items-center gap-3 p-3 rounded-lg bg-surface-container-highest/50 cursor-pointer hover:bg-surface-container-highest transition-all"
                        >
                          <input
                            type="radio"
                            name="activation"
                            checked={activation === fn}
                            onChange={() => setActivation(fn)}
                            className="text-primary focus:ring-primary border-outline-variant"
                          />
                          <span className="text-sm font-medium text-on-surface capitalize">
                            {fn === "relu"
                              ? "ReLU"
                              : fn === "sigmoid"
                              ? "Sigmoid"
                              : "Tanh"}
                          </span>
                        </label>
                      )
                    )}
                  </div>
                </div>
              </div>
            </section>

            {/* Execution */}
            <section>
              <label className="block font-label text-[11px] uppercase tracking-wider font-bold text-secondary mb-4">
                Execution
              </label>
              <button
                onClick={toggleTraining}
                className="w-full bg-gradient-to-br from-primary to-primary-container text-white py-4 rounded-xl font-bold shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-sm">
                  {training.isTraining ? "pause" : "play_arrow"}
                </span>
                {training.isTraining ? "Pause Training" : "Train Model"}
              </button>
              <button
                onClick={resetWeights}
                className="w-full mt-3 border border-outline-variant/20 text-primary py-3 rounded-xl font-semibold hover:bg-primary/5 transition-all"
              >
                Reset Weights
              </button>
            </section>

            {/* Loss graph */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <label className="block font-label text-[11px] uppercase tracking-wider font-bold text-secondary">
                  Training Loss
                </label>
                <span className="font-mono text-xs text-primary font-bold">
                  {currentLoss}
                </span>
              </div>
              <div className="h-32 w-full bg-surface-container-lowest rounded-lg border-b-2 border-secondary relative overflow-hidden">
                <svg
                  viewBox="0 0 200 120"
                  className="w-full h-full"
                  preserveAspectRatio="none"
                >
                  {training.lossHistory.length > 1 ? (
                    <>
                      <path
                        d={valChartPath}
                        fill="none"
                        stroke="#964900"
                        strokeWidth="1.5"
                        opacity="0.5"
                      />
                      <path
                        d={chartPath}
                        fill="none"
                        stroke="#006496"
                        strokeWidth="2"
                      />
                    </>
                  ) : (
                    <path
                      d="M0 110 Q 50 5, 100 50 T 200 15"
                      fill="none"
                      stroke="#006496"
                      strokeWidth="2"
                      opacity="0.3"
                    />
                  )}
                </svg>
                <div className="absolute bottom-1 right-2 text-[8px] font-mono text-on-surface-variant/50">
                  Epoch: {training.epoch}
                </div>
                <div className="absolute top-1 left-2 flex gap-2">
                  <span className="text-[8px] font-bold text-primary">
                    — Train
                  </span>
                  <span className="text-[8px] font-bold text-secondary opacity-60">
                    — Val
                  </span>
                </div>
              </div>
            </section>
          </div>
        </div>

        {/* Network visualization */}
        <div className="col-span-12 lg:col-span-9 order-1 lg:order-2">
          <div className="relative bg-surface-container-lowest rounded-[2rem] p-10 min-h-[580px] flex flex-col justify-center items-center">
            {/* Layer controls */}
            <div className="absolute top-7 left-1/2 -translate-x-1/2 glass-panel px-6 py-3 rounded-full flex items-center gap-6 shadow-sm">
              <div className="flex items-center gap-2">
                <button
                  onClick={removeLayer}
                  disabled={layers.length <= 1}
                  className="w-8 h-8 rounded-full bg-surface-container-highest flex items-center justify-center hover:bg-primary-container hover:text-on-primary-container transition-all disabled:opacity-30"
                >
                  <span className="material-symbols-outlined text-sm">
                    remove
                  </span>
                </button>
                <span className="font-label text-xs font-bold uppercase tracking-widest min-w-28 text-center">
                  {layers.length} Hidden Layer{layers.length !== 1 ? "s" : ""}
                </span>
                <button
                  onClick={addLayer}
                  disabled={layers.length >= 5}
                  className="w-8 h-8 rounded-full bg-surface-container-highest flex items-center justify-center hover:bg-primary-container hover:text-on-primary-container transition-all disabled:opacity-30"
                >
                  <span className="material-symbols-outlined text-sm">add</span>
                </button>
              </div>
              <div className="w-px h-4 bg-outline-variant/30" />
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-tertiary text-base">
                  info
                </span>
                <span className="text-xs font-medium text-on-surface-variant">
                  Click +/- to adjust neurons
                </span>
              </div>
            </div>

            {/* SVG Network */}
            <div className="w-full max-w-3xl">
              <svg
                viewBox={`0 0 ${SVG_W} ${SVG_H}`}
                className="w-full overflow-visible"
              >
                {/* Connection lines */}
                {allLayers.slice(0, -1).map((layer, li) => {
                  const x1 = layerSpacing * (li + 1);
                  const x2 = layerSpacing * (li + 2);
                  const nextLayer = allLayers[li + 1];
                  const lines = [];

                  for (let ni = 0; ni < layer.neurons; ni++) {
                    const y1 =
                      (SVG_H / (layer.neurons + 1)) * (ni + 1);
                    for (let nj = 0; nj < nextLayer.neurons; nj++) {
                      const y2 =
                        (SVG_H / (nextLayer.neurons + 1)) * (nj + 1);
                      const weight = Math.sin(ni * 3.7 + nj * 2.1 + li) * 0.5 + 0.5;
                      const isActive = training.isTraining && Math.random() > 0.7;
                      lines.push(
                        <line
                          key={`${li}-${ni}-${nj}`}
                          x1={x1}
                          y1={y1}
                          x2={x2}
                          y2={y2}
                          stroke={
                            isActive
                              ? "#006496"
                              : weight > 0.6
                              ? "#006496"
                              : "#964900"
                          }
                          strokeWidth={weight * 2.5 + 0.5}
                          opacity={weight * 0.5 + 0.1}
                        />
                      );
                    }
                  }
                  return <g key={li}>{lines}</g>;
                })}

                {/* Nodes */}
                {allLayers.map((layer, li) => {
                  const x = layerSpacing * (li + 1);
                  const isInput = li === 0;
                  const isOutput = li === allLayers.length - 1;
                  const isHidden = !isInput && !isOutput;

                  return (
                    <g key={li}>
                      {Array.from({ length: layer.neurons }, (_, ni) => {
                        const y = (SVG_H / (layer.neurons + 1)) * (ni + 1);
                        const r = isOutput ? 24 : isInput ? 20 : 16;
                        const activation_val =
                          training.epoch > 0
                            ? activate(
                                Math.sin(ni + training.epoch * 0.01),
                                activation
                              )
                            : 0.5;

                        return (
                          <g key={ni}>
                            <circle
                              cx={x}
                              cy={y}
                              r={r}
                              fill={
                                isOutput
                                  ? "#006496"
                                  : `rgba(242, 235, 252, ${0.5 + activation_val * 0.5})`
                              }
                              stroke={
                                isInput ? "#006496" : isOutput ? "none" : "#e6e0f1"
                              }
                              strokeWidth={isInput ? 2 : 1}
                            />
                            {isOutput && (
                              <text
                                x={x}
                                y={y + 5}
                                textAnchor="middle"
                                fill="white"
                                fontSize="12"
                                fontWeight="bold"
                                fontFamily="Inter"
                              >
                                Ŷ
                              </text>
                            )}
                            {isInput && (
                              <text
                                x={x}
                                y={y + 4}
                                textAnchor="middle"
                                fill="#006496"
                                fontSize="10"
                                fontFamily="Inter"
                                fontWeight="600"
                              >
                                X{ni + 1}
                              </text>
                            )}
                            {isHidden && !isOutput && isInput === false && training.isTraining && (
                              <circle
                                cx={x}
                                cy={y}
                                r={r - 4}
                                fill={`rgba(0,100,150,${activation_val * 0.4})`}
                              />
                            )}
                          </g>
                        );
                      })}

                      {/* Neuron +/- for hidden layers */}
                      {isHidden && (
                        <g>
                          <foreignObject
                            x={x - 20}
                            y={SVG_H - 20}
                            width="40"
                            height="20"
                          >
                            <div className="flex gap-1 justify-center">
                              <button
                                onClick={() => updateNeurons(li - 1, -1)}
                                className="text-[8px] text-outline-variant hover:text-secondary w-4 h-4 flex items-center justify-center"
                              >
                                −
                              </button>
                              <button
                                onClick={() => updateNeurons(li - 1, 1)}
                                className="text-[8px] text-outline-variant hover:text-primary w-4 h-4 flex items-center justify-center"
                              >
                                +
                              </button>
                            </div>
                          </foreignObject>
                        </g>
                      )}
                    </g>
                  );
                })}
              </svg>

              {/* Layer labels */}
              <div
                className="flex justify-between px-0"
                style={{
                  paddingLeft: `${(layerSpacing / SVG_W) * 100 - 5}%`,
                  paddingRight: `${(layerSpacing / SVG_W) * 100 - 5}%`,
                }}
              >
                <span className="text-[9px] font-bold uppercase tracking-widest opacity-40">
                  Input
                </span>
                {layers.map((_, i) => (
                  <span
                    key={i}
                    className="text-[9px] font-bold uppercase tracking-widest opacity-40"
                  >
                    Hidden {i + 1}
                  </span>
                ))}
                <span className="text-[9px] font-bold uppercase tracking-widest opacity-40">
                  Output
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Explanatory bento */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-7">
        {[
          {
            icon: "history_edu",
            iconColor: "text-tertiary",
            iconBg: "bg-tertiary-container/20",
            title: "Backpropagation",
            body: "The engine of learning. Errors are calculated at the output and propagated backward through the network to determine how much each weight contributed to the mistake.",
          },
          {
            icon: "balance",
            iconColor: "text-secondary",
            iconBg: "bg-secondary-container/20",
            title: "Weights & Biases",
            body: "Weights control the signal strength between nodes, while biases shift the activation function's output. Together, they allow the model to approximate complex patterns.",
          },
          {
            icon: "downhill_skiing",
            iconColor: "text-primary",
            iconBg: "bg-primary-container/20",
            title: "Gradient Descent",
            body: "Optimization logic that iteratively adjusts weights to minimize the loss function — finding the lowest point in an error landscape.",
          },
        ].map((card) => (
          <div
            key={card.title}
            className="bg-surface-container-low p-8 rounded-2xl flex flex-col gap-4"
          >
            <div
              className={`w-12 h-12 rounded-xl ${card.iconBg} flex items-center justify-center`}
            >
              <span
                className={`material-symbols-outlined ${card.iconColor} text-xl`}
              >
                {card.icon}
              </span>
            </div>
            <h3 className="font-headline text-2xl text-on-surface">
              {card.title}
            </h3>
            <p className="text-on-surface-variant text-sm leading-relaxed">
              {card.body}
            </p>
          </div>
        ))}
      </div>

      {/* Footer */}
      <footer className="border-t border-outline-variant/10 pt-10 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="text-xs font-label tracking-tighter text-on-surface-variant/50 uppercase">
          Produced by the Center for Neural Computation · © 2024 The Academic
          Interactive
        </div>
        <div className="flex gap-10">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] uppercase font-bold tracking-widest text-secondary">
              References
            </span>
            <a href="#" className="text-xs text-primary hover:underline">
              Rumelhart et al. (1986)
            </a>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[10px] uppercase font-bold tracking-widest text-secondary">
              Export
            </span>
            <a href="#" className="text-xs text-primary hover:underline">
              Download Model (JSON)
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
