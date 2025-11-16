"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";

interface Node {
  value: number;
  x: number;
  y: number;
  next?: number;
}

const CANVAS_WIDTH = 1200;
const CANVAS_HEIGHT = 600;

interface GraphNode {
  value: number;
  x: number;
  y: number;
  connections: Set<number>;
}

export default function CollatzConjecture() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const graphCanvasRef = useRef<HTMLCanvasElement>(null);
  const [startNumber, setStartNumber] = useState<string>("27");
  const [sequence, setSequence] = useState<number[]>([]);
  const [nodes, setNodes] = useState<Node[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [allSequences, setAllSequences] = useState<Set<number>>(new Set([1]));
  const [graphNodes, setGraphNodes] = useState<Map<number, GraphNode>>(new Map());
  const [stats, setStats] = useState({
    steps: 0,
    maxValue: 0,
    stoppingTime: 0
  });

  // Pan and zoom state
  const [zoom, setZoom] = useState(1);
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Calculate Collatz sequence
  const calculateSequence = (n: number): number[] => {
    const seq: number[] = [n];
    let current = n;
    let maxIterations = 1000; // Safety limit
    
    while (current !== 1 && maxIterations > 0) {
      if (current % 2 === 0) {
        current = current / 2;
      } else {
        current = 3 * current + 1;
      }
      seq.push(current);
      maxIterations--;
    }
    
    return seq;
  };

  // Position nodes in a nice layout
  const layoutNodes = (seq: number[]): Node[] => {
    const nodeList: Node[] = [];
    const padding = 80;
    const maxWidth = CANVAS_WIDTH - padding * 2;
    const maxHeight = CANVAS_HEIGHT - padding * 2;
    
    // Use a force-directed-like approach but simplified
    const maxValue = Math.max(...seq);
    
    for (let i = 0; i < seq.length; i++) {
      const value = seq[i];
      
      // Position based on sequence index and value
      const xProgress = i / (seq.length - 1);
      const x = padding + xProgress * maxWidth;
      
      // Y position based on value (log scale for better visualization)
      const normalizedValue = Math.log(value) / Math.log(maxValue);
      const y = padding + (1 - normalizedValue) * maxHeight;
      
      nodeList.push({
        value,
        x,
        y,
        next: i < seq.length - 1 ? seq[i + 1] : undefined
      });
    }
    
    return nodeList;
  };

  // Build cumulative graph
  const updateCumulativeGraph = (seq: number[]) => {
    // Add all numbers to the set
    const newAllSequences = new Set(allSequences);
    seq.forEach(num => newAllSequences.add(num));
    setAllSequences(newAllSequences);
    
    // Build graph structure
    const newGraphNodes = new Map(graphNodes);
    
    // Add connections
    for (let i = 0; i < seq.length - 1; i++) {
      const current = seq[i];
      const next = seq[i + 1];
      
      if (!newGraphNodes.has(current)) {
        newGraphNodes.set(current, {
          value: current,
          x: 0,
          y: 0,
          connections: new Set()
        });
      }
      
      newGraphNodes.get(current)!.connections.add(next);
    }
    
    // Ensure endpoint exists
    if (!newGraphNodes.has(1)) {
      newGraphNodes.set(1, {
        value: 1,
        x: 0,
        y: 0,
        connections: new Set()
      });
    }
    
    // Layout the graph
    layoutCumulativeGraph(newGraphNodes);
    setGraphNodes(newGraphNodes);
  };

  // Layout cumulative graph
  const layoutCumulativeGraph = (nodes: Map<number, GraphNode>) => {
    // Simple hierarchical layout based on distance from 1
    const distances = new Map<number, number>();
    const queue: number[] = [1];
    distances.set(1, 0);
    
    // Calculate distances from 1 (reverse traversal)
    const reverseGraph = new Map<number, Set<number>>();
    nodes.forEach((node, value) => {
      node.connections.forEach(conn => {
        if (!reverseGraph.has(conn)) {
          reverseGraph.set(conn, new Set());
        }
        reverseGraph.get(conn)!.add(value);
      });
    });
    
    // BFS to find distances
    while (queue.length > 0) {
      const current = queue.shift()!;
      const currentDist = distances.get(current)!;
      
      const parents = reverseGraph.get(current);
      if (parents) {
        parents.forEach(parent => {
          if (!distances.has(parent)) {
            distances.set(parent, currentDist + 1);
            queue.push(parent);
          }
        });
      }
    }
    
    // Group nodes by distance
    const levels = new Map<number, number[]>();
    distances.forEach((dist, value) => {
      if (!levels.has(dist)) {
        levels.set(dist, []);
      }
      levels.get(dist)!.push(value);
    });
    
    // Position nodes
    const padding = 60;
    const maxWidth = CANVAS_WIDTH - padding * 2;
    const maxHeight = CANVAS_HEIGHT - padding * 2;
    const maxLevel = Math.max(...Array.from(levels.keys()));
    
    levels.forEach((values, level) => {
      const y = padding + (maxLevel - level) * (maxHeight / Math.max(maxLevel, 1));
      const spacing = maxWidth / (values.length + 1);
      
      values.sort((a, b) => a - b);
      values.forEach((value, index) => {
        const node = nodes.get(value)!;
        node.x = padding + spacing * (index + 1);
        node.y = y;
      });
    });
  };

  // Start visualization
  const handleVisualize = () => {
    const num = parseInt(startNumber);
    if (isNaN(num) || num < 1) {
      alert("Please enter a positive integer");
      return;
    }
    
    if (num > 10000) {
      alert("Please enter a number less than 10,000 for better visualization");
      return;
    }

    const seq = calculateSequence(num);
    setSequence(seq);
    
    const maxVal = Math.max(...seq);
    setStats({
      steps: seq.length - 1,
      maxValue: maxVal,
      stoppingTime: seq.length - 1
    });
    
    const nodeLayout = layoutNodes(seq);
    setNodes(nodeLayout);
    
    // Update cumulative graph
    updateCumulativeGraph(seq);
    
    setCurrentStep(0);
    setIsAnimating(true);
  };

  // Animation loop
  useEffect(() => {
    if (!isAnimating || currentStep >= sequence.length - 1) {
      if (isAnimating && currentStep >= sequence.length - 1) {
        setIsAnimating(false);
      }
      return;
    }

    const timer = setTimeout(() => {
      setCurrentStep(prev => prev + 1);
    }, 300); // 300ms per step

    return () => clearTimeout(timer);
  }, [isAnimating, currentStep, sequence.length]);

  // Draw the graph
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || nodes.length === 0) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const isDark = typeof window !== "undefined" && 
                   window.matchMedia("(prefers-color-scheme: dark)").matches;

    // Clear canvas
    ctx.fillStyle = isDark ? "#0a0a0a" : "#ffffff";
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw connections
    ctx.strokeStyle = isDark ? "#444444" : "#cccccc";
    ctx.lineWidth = 2;
    
    for (let i = 0; i <= currentStep && i < nodes.length - 1; i++) {
      const node = nodes[i];
      const nextNode = nodes[i + 1];
      
      // Gradient for active connections
      if (i === currentStep - 1) {
        const gradient = ctx.createLinearGradient(node.x, node.y, nextNode.x, nextNode.y);
        gradient.addColorStop(0, isDark ? "#60a5fa" : "#3b82f6");
        gradient.addColorStop(1, isDark ? "#a78bfa" : "#8b5cf6");
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 3;
      } else {
        ctx.strokeStyle = isDark ? "#444444" : "#cccccc";
        ctx.lineWidth = 2;
      }
      
      // Draw arrow
      ctx.beginPath();
      ctx.moveTo(node.x, node.y);
      ctx.lineTo(nextNode.x, nextNode.y);
      ctx.stroke();
      
      // Draw arrowhead
      const angle = Math.atan2(nextNode.y - node.y, nextNode.x - node.x);
      const arrowSize = 8;
      ctx.beginPath();
      ctx.moveTo(nextNode.x, nextNode.y);
      ctx.lineTo(
        nextNode.x - arrowSize * Math.cos(angle - Math.PI / 6),
        nextNode.y - arrowSize * Math.sin(angle - Math.PI / 6)
      );
      ctx.lineTo(
        nextNode.x - arrowSize * Math.cos(angle + Math.PI / 6),
        nextNode.y - arrowSize * Math.sin(angle + Math.PI / 6)
      );
      ctx.closePath();
      ctx.fill();
    }

    // Draw nodes
    for (let i = 0; i <= currentStep && i < nodes.length; i++) {
      const node = nodes[i];
      
      // Node color based on position
      let nodeColor;
      if (i === 0) {
        nodeColor = isDark ? "#10b981" : "#059669"; // Start: green
      } else if (node.value === 1) {
        nodeColor = isDark ? "#ef4444" : "#dc2626"; // End: red
      } else if (i === currentStep) {
        nodeColor = isDark ? "#f59e0b" : "#d97706"; // Current: orange
      } else {
        nodeColor = isDark ? "#3b82f6" : "#2563eb"; // Default: blue
      }
      
      // Draw node circle
      ctx.fillStyle = nodeColor;
      ctx.beginPath();
      ctx.arc(node.x, node.y, 8, 0, Math.PI * 2);
      ctx.fill();
      
      // Draw value label
      ctx.fillStyle = isDark ? "#ffffff" : "#000000";
      ctx.font = "12px monospace";
      ctx.textAlign = "center";
      ctx.textBaseline = "bottom";
      ctx.fillText(node.value.toString(), node.x, node.y - 12);
    }
  }, [nodes, currentStep]);

  // Handle zoom
  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    const newZoom = Math.max(0.5, Math.min(5, zoom * delta));
    
    // Zoom towards mouse position
    const canvas = graphCanvasRef.current;
    if (canvas) {
      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      
      // Adjust pan to zoom towards mouse
      const scaleFactor = newZoom / zoom;
      setPanX(mouseX - (mouseX - panX) * scaleFactor);
      setPanY(mouseY - (mouseY - panY) * scaleFactor);
    }
    
    setZoom(newZoom);
  };

  // Handle pan start
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - panX, y: e.clientY - panY });
  };

  // Handle pan move
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isDragging) {
      setPanX(e.clientX - dragStart.x);
      setPanY(e.clientY - dragStart.y);
    }
  };

  // Handle pan end
  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Reset view
  const resetView = () => {
    setZoom(1);
    setPanX(0);
    setPanY(0);
  };

  // Draw cumulative graph
  useEffect(() => {
    const canvas = graphCanvasRef.current;
    if (!canvas || graphNodes.size === 0) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const isDark = typeof window !== "undefined" && 
                   window.matchMedia("(prefers-color-scheme: dark)").matches;

    // Clear canvas
    ctx.fillStyle = isDark ? "#0a0a0a" : "#ffffff";
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Save context and apply transformations
    ctx.save();
    ctx.translate(panX, panY);
    ctx.scale(zoom, zoom);

    // Draw all connections
    ctx.strokeStyle = isDark ? "#374151" : "#d1d5db";
    ctx.lineWidth = 1.5;
    
    graphNodes.forEach((node) => {
      node.connections.forEach(targetValue => {
        const target = graphNodes.get(targetValue);
        if (target) {
          // Draw edge
          ctx.beginPath();
          ctx.moveTo(node.x, node.y);
          ctx.lineTo(target.x, target.y);
          ctx.stroke();
          
          // Draw small arrowhead
          const angle = Math.atan2(target.y - node.y, target.x - node.x);
          const arrowSize = 5;
          ctx.fillStyle = isDark ? "#374151" : "#d1d5db";
          ctx.beginPath();
          ctx.moveTo(target.x, target.y);
          ctx.lineTo(
            target.x - arrowSize * Math.cos(angle - Math.PI / 6),
            target.y - arrowSize * Math.sin(angle - Math.PI / 6)
          );
          ctx.lineTo(
            target.x - arrowSize * Math.cos(angle + Math.PI / 6),
            target.y - arrowSize * Math.sin(angle + Math.PI / 6)
          );
          ctx.closePath();
          ctx.fill();
        }
      });
    });

    // Draw nodes
    graphNodes.forEach((node) => {
      // Node color
      let nodeColor;
      if (node.value === 1) {
        nodeColor = isDark ? "#ef4444" : "#dc2626"; // End: red
      } else if (sequence.includes(node.value)) {
        nodeColor = isDark ? "#10b981" : "#059669"; // In current sequence: green
      } else {
        nodeColor = isDark ? "#3b82f6" : "#2563eb"; // Other: blue
      }
      
      // Draw node circle
      ctx.fillStyle = nodeColor;
      ctx.beginPath();
      ctx.arc(node.x, node.y, 6, 0, Math.PI * 2);
      ctx.fill();
      
      // Draw value label for special nodes
      if (node.value === 1 || node.value < 20 || sequence.includes(node.value)) {
        ctx.fillStyle = isDark ? "#ffffff" : "#000000";
        ctx.font = "10px monospace";
        ctx.textAlign = "center";
        ctx.textBaseline = "bottom";
        ctx.fillText(node.value.toString(), node.x, node.y - 10);
      }
    });

    // Restore context
    ctx.restore();

    // Draw zoom indicator
    ctx.fillStyle = isDark ? "rgba(255, 255, 255, 0.7)" : "rgba(0, 0, 0, 0.7)";
    ctx.font = "12px monospace";
    ctx.textAlign = "right";
    ctx.textBaseline = "top";
    ctx.fillText(`Zoom: ${zoom.toFixed(1)}x`, CANVAS_WIDTH - 10, 10);
  }, [graphNodes, sequence, zoom, panX, panY]);

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      {/* Header */}
      <header className="border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors mb-4"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back to Home
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-4xl">🔢</span>
            <div>
              <h1 className="text-4xl font-bold text-black dark:text-white">
                Collatz Conjecture
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                The 3n+1 Problem
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Game Area */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Info Box */}
        <div className="mb-6 p-6 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
          <h2 className="text-xl font-semibold text-blue-900 dark:text-blue-100 mb-2">
            The Conjecture
          </h2>
          <p className="text-blue-800 dark:text-blue-200 leading-relaxed">
            Start with any positive integer n. If n is even, divide it by 2. If n is odd, multiply by 3 and add 1. 
            Repeat. The conjecture states that you will always eventually reach 1, no matter what number you start with.
          </p>
        </div>

        {/* Controls */}
        <div className="mb-6 flex gap-4 items-end">
          <div className="flex-1 max-w-xs">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Starting Number
            </label>
            <input
              type="number"
              value={startNumber}
              onChange={(e) => setStartNumber(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter a number"
              min="1"
              max="10000"
            />
          </div>
          <button
            onClick={handleVisualize}
            disabled={isAnimating}
            className="px-6 py-2 bg-blue-600 dark:bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Visualize
          </button>
          {isAnimating && (
            <button
              onClick={() => setIsAnimating(false)}
              className="px-6 py-2 bg-gray-600 dark:bg-gray-500 text-white font-semibold rounded-lg hover:bg-gray-700 dark:hover:bg-gray-600 transition-colors"
            >
              Stop
            </button>
          )}
        </div>

        {/* Stats */}
        {sequence.length > 0 && (
          <div className="mb-6 grid grid-cols-3 gap-4">
            <div className="p-4 border border-gray-200 dark:border-gray-800 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Steps</p>
              <p className="text-3xl font-bold text-black dark:text-white">{stats.steps}</p>
            </div>
            <div className="p-4 border border-gray-200 dark:border-gray-800 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Max Value</p>
              <p className="text-3xl font-bold text-black dark:text-white">{stats.maxValue}</p>
            </div>
            <div className="p-4 border border-gray-200 dark:border-gray-800 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Current</p>
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                {currentStep < sequence.length ? sequence[currentStep] : 1}
              </p>
            </div>
          </div>
        )}

        {/* Canvas - Current Sequence */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-black dark:text-white mb-2">
            Current Sequence
          </h3>
          <div className="border-2 border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden bg-white dark:bg-black">
            <canvas
              ref={canvasRef}
              width={CANVAS_WIDTH}
              height={CANVAS_HEIGHT}
              className="w-full h-auto"
            />
          </div>
        </div>

        {/* Canvas - Cumulative Graph */}
        {graphNodes.size > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold text-black dark:text-white">
                All Tested Numbers ({graphNodes.size} nodes)
              </h3>
              <button
                onClick={resetView}
                className="px-3 py-1 text-sm bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors"
              >
                Reset View
              </button>
            </div>
            <div className="border-2 border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden bg-white dark:bg-black">
              <canvas
                ref={graphCanvasRef}
                width={CANVAS_WIDTH}
                height={CANVAS_HEIGHT}
                className="w-full h-auto cursor-move"
                onWheel={handleWheel}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
              />
            </div>
            <div className="mt-2 flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
              <p>
                This graph shows how all tested numbers converge towards 1. Green nodes are from the current sequence.
              </p>
              <p className="text-xs">
                🖱️ Scroll to zoom • Drag to pan
              </p>
            </div>
          </div>
        )}

        {/* Legend */}
        {sequence.length > 0 && (
          <div className="flex gap-8 justify-center text-sm">
            <div className="flex flex-col gap-2">
              <p className="font-semibold text-gray-700 dark:text-gray-300">Current Sequence:</p>
              <div className="flex gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-green-600 dark:bg-green-500"></div>
                  <span className="text-gray-600 dark:text-gray-400">Start</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-blue-600 dark:bg-blue-500"></div>
                  <span className="text-gray-600 dark:text-gray-400">Path</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-orange-600 dark:bg-orange-500"></div>
                  <span className="text-gray-600 dark:text-gray-400">Current</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-red-600 dark:bg-red-500"></div>
                  <span className="text-gray-600 dark:text-gray-400">End (1)</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Interesting Numbers */}
        <div className="mt-8 p-6 bg-gray-50 dark:bg-gray-900 rounded-lg">
          <h3 className="text-lg font-semibold text-black dark:text-white mb-3">
            Try These Interesting Numbers
          </h3>
          <div className="flex flex-wrap gap-2">
            {[27, 31, 41, 47, 71, 97, 871, 6171].map((num) => (
              <button
                key={num}
                onClick={() => {
                  setStartNumber(num.toString());
                  setSequence([]);
                  setNodes([]);
                  setCurrentStep(0);
                }}
                className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                {num}
              </button>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

