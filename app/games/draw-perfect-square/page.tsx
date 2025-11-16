"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { playSuccessSound, playErrorSound } from "@/lib/sound-effects";

interface Point {
  x: number;
  y: number;
}

const CANVAS_SIZE = 600;
const CENTER = { x: CANVAS_SIZE / 2, y: CANVAS_SIZE / 2 };

export default function DrawPerfectSquare() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawnPath, setDrawnPath] = useState<Point[]>([]);
  const [perfectSquare, setPerfectSquare] = useState<Point[]>([]);
  const [score, setScore] = useState<number | null>(null);
  const [realtimeScore, setRealtimeScore] = useState<number>(0);
  const [attempts, setAttempts] = useState(0);
  const [highScore, setHighScore] = useState(0);

  // Load high score from localStorage
  useEffect(() => {
    const savedHighScore = localStorage.getItem("drawSquareHighScore");
    if (savedHighScore) {
      setHighScore(parseFloat(savedHighScore));
    }
  }, []);

  const getBoundingBox = (path: Point[]): { minX: number; maxX: number; minY: number; maxY: number; width: number; height: number } => {
    if (path.length === 0) return { minX: 0, maxX: 0, minY: 0, maxY: 0, width: 0, height: 0 };
    
    let minX = path[0].x;
    let maxX = path[0].x;
    let minY = path[0].y;
    let maxY = path[0].y;
    
    for (const point of path) {
      minX = Math.min(minX, point.x);
      maxX = Math.max(maxX, point.x);
      minY = Math.min(minY, point.y);
      maxY = Math.max(maxY, point.y);
    }
    
    return {
      minX,
      maxX,
      minY,
      maxY,
      width: maxX - minX,
      height: maxY - minY
    };
  };

  // Get vibrant color based on accuracy (0 = bad/red, 100 = good/green)
  const getAccuracyColor = (accuracy: number): string => {
    // Clamp between 0 and 100
    const clamped = Math.max(0, Math.min(100, accuracy));
    
    // Red → Orange → Yellow → Green gradient
    if (clamped < 33) {
      // Red to Orange (0-33%)
      const t = clamped / 33;
      const r = 255;
      const g = Math.round(69 + (165 - 69) * t); // 69 to 234
      const b = 0;
      return `rgb(${r}, ${g}, ${b})`;
    } else if (clamped < 66) {
      // Orange to Yellow (33-66%)
      const t = (clamped - 33) / 33;
      const r = Math.round(255 - (255 - 234) * t); // 255 to 234
      const g = Math.round(165 + (179 - 165) * t); // 165 to 179
      const b = 0;
      return `rgb(${r}, ${g}, ${b})`;
    } else {
      // Yellow to Green (66-100%)
      const t = (clamped - 66) / 34;
      const r = Math.round(234 - 234 * t); // 234 to 0
      const g = Math.round(179 + (220 - 179) * t); // 179 to 220
      const b = Math.round(0 + (60) * t); // 0 to 60
      return `rgb(${r}, ${g}, ${b})`;
    }
  };

  // Get color based on overall score for text
  const getScoreColor = (scoreValue: number): string => {
    if (scoreValue >= 95) return "#22c55e"; // green-500
    if (scoreValue >= 85) return "#3b82f6"; // blue-500
    if (scoreValue >= 70) return "#eab308"; // yellow-500
    if (scoreValue >= 50) return "#f97316"; // orange-500
    return "#ef4444"; // red-500
  };

  const getScoreColorDark = (scoreValue: number): string => {
    if (scoreValue >= 95) return "#4ade80"; // green-400
    if (scoreValue >= 85) return "#60a5fa"; // blue-400
    if (scoreValue >= 70) return "#facc15"; // yellow-400
    if (scoreValue >= 50) return "#fb923c"; // orange-400
    return "#f87171"; // red-400
  };

  // Calculate real-time score while drawing
  useEffect(() => {
    if (isDrawing && drawnPath.length > 20) {
      const perfect = calculatePerfectSquare(drawnPath);
      const currentScore = calculateSquarePerfection(drawnPath, perfect);
      setRealtimeScore(currentScore);
    } else if (!isDrawing && score === null) {
      setRealtimeScore(0);
    }
  }, [drawnPath, isDrawing, score]);

  // Draw on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const isDark = typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches;

    // Clear canvas
    ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    // Draw center point
    ctx.fillStyle = isDark ? "#888888" : "#666666";
    ctx.beginPath();
    ctx.arc(CENTER.x, CENTER.y, 6, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw center crosshair
    ctx.strokeStyle = isDark ? "#666666" : "#999999";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(CENTER.x - 15, CENTER.y);
    ctx.lineTo(CENTER.x + 15, CENTER.y);
    ctx.moveTo(CENTER.x, CENTER.y - 15);
    ctx.lineTo(CENTER.x, CENTER.y + 15);
    ctx.stroke();

    // Draw perfect square guide (always visible when available)
    if (perfectSquare.length === 4) {
      // Draw as dashed line during drawing, solid when complete
      if (score === null) {
        ctx.setLineDash([5, 5]);
        ctx.strokeStyle = isDark ? "rgba(96, 165, 250, 0.4)" : "rgba(37, 99, 235, 0.4)";
        ctx.lineWidth = 2;
      } else {
        ctx.setLineDash([]);
        ctx.fillStyle = isDark ? "rgba(96, 165, 250, 0.15)" : "rgba(37, 99, 235, 0.1)";
        ctx.strokeStyle = isDark ? "rgba(96, 165, 250, 0.8)" : "rgba(37, 99, 235, 0.8)";
        ctx.lineWidth = 3;
      }
      
      ctx.beginPath();
      ctx.moveTo(perfectSquare[0].x, perfectSquare[0].y);
      for (let i = 1; i < perfectSquare.length; i++) {
        ctx.lineTo(perfectSquare[i].x, perfectSquare[i].y);
      }
      ctx.closePath();
      
      if (score !== null) {
        ctx.fill();
      }
      ctx.stroke();
      ctx.setLineDash([]);
      
      // Draw lines from center to corners when complete
      if (score !== null) {
        ctx.strokeStyle = isDark ? "rgba(96, 165, 250, 0.3)" : "rgba(37, 99, 235, 0.3)";
        ctx.lineWidth = 1;
        for (let i = 0; i < 4; i++) {
          ctx.beginPath();
          ctx.moveTo(CENTER.x, CENTER.y);
          ctx.lineTo(perfectSquare[i].x, perfectSquare[i].y);
          ctx.stroke();
        }
      }
    }

    // Draw user's path with per-segment color based on accuracy
    if (drawnPath.length > 1) {
      ctx.lineWidth = 5;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      // Calculate perfect square for current path
      const currentPerfect = drawnPath.length > 20 ? calculatePerfectSquare(drawnPath) : perfectSquare;
      
      if (currentPerfect.length === 4) {
        // Calculate max possible deviation (for normalization)
        const bbox = getBoundingBox(drawnPath);
        const maxDimension = Math.max(bbox.width, bbox.height);
        const maxDeviation = maxDimension * 0.2; // 20% of max dimension
        
        // Draw each segment with its own color
        for (let i = 1; i < drawnPath.length; i++) {
          const point = drawnPath[i];
          
          // Find minimum distance to any edge of perfect square
          let minDist = Infinity;
          for (let j = 0; j < 4; j++) {
            const p1 = currentPerfect[j];
            const p2 = currentPerfect[(j + 1) % 4];
            const dist = distanceToLineSegment(point, p1, p2);
            minDist = Math.min(minDist, dist);
          }
          
          // Convert distance to accuracy percentage (closer = higher %)
          const accuracy = Math.max(0, 100 - (minDist / maxDeviation) * 100);
          const color = getAccuracyColor(accuracy);
          
          ctx.strokeStyle = color;
          ctx.beginPath();
          ctx.moveTo(drawnPath[i - 1].x, drawnPath[i - 1].y);
          ctx.lineTo(point.x, point.y);
          ctx.stroke();
        }
      } else {
        // Fallback: draw in gray if no perfect square yet
        ctx.strokeStyle = isDark ? "#666666" : "#999999";
        ctx.beginPath();
        ctx.moveTo(drawnPath[0].x, drawnPath[0].y);
        for (let i = 1; i < drawnPath.length; i++) {
          ctx.lineTo(drawnPath[i].x, drawnPath[i].y);
        }
        ctx.stroke();
      }
    }
  }, [isDrawing, drawnPath, perfectSquare, score, realtimeScore]);

  const calculateDistance = (p1: Point, p2: Point): number => {
    return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
  };

  const calculatePerfectSquare = (path: Point[]): Point[] => {
    if (path.length < 2) return [];
    
    // Calculate average distance from center point
    let totalDistance = 0;
    for (const point of path) {
      const dist = calculateDistance(point, CENTER);
      totalDistance += dist;
    }
    const avgDistance = totalDistance / path.length;
    
    // Calculate side length from average distance
    // For a square, distance from center to edge = sideLength / 2
    // Distance from center to corner = sideLength * sqrt(2) / 2
    // We use average, which is somewhere between these
    const sideLength = avgDistance * 1.4; // Adjusted multiplier
    const halfSide = sideLength / 2;
    
    // Create axis-aligned perfect square centered at CENTER
    return [
      { x: CENTER.x - halfSide, y: CENTER.y - halfSide }, // Top-left
      { x: CENTER.x + halfSide, y: CENTER.y - halfSide }, // Top-right
      { x: CENTER.x + halfSide, y: CENTER.y + halfSide }, // Bottom-right
      { x: CENTER.x - halfSide, y: CENTER.y + halfSide }, // Bottom-left
    ];
  };

  const calculateSquarePerfection = (path: Point[], perfectSq: Point[]): number => {
    if (path.length < 10) return 0;

    const bbox = getBoundingBox(path);
    
    // Calculate aspect ratio (how close to 1:1)
    const aspectRatio = Math.min(bbox.width, bbox.height) / Math.max(bbox.width, bbox.height);
    const aspectScore = aspectRatio * 100;
    
    // Calculate how much the path deviates from the perfect square
    const perfectSideLength = calculateDistance(perfectSq[0], perfectSq[1]);
    let totalDeviation = 0;
    
    for (const point of path) {
      // Find the minimum distance from this point to any edge of the perfect square
      let minDist = Infinity;
      
      for (let i = 0; i < 4; i++) {
        const p1 = perfectSq[i];
        const p2 = perfectSq[(i + 1) % 4];
        const dist = distanceToLineSegment(point, p1, p2);
        minDist = Math.min(minDist, dist);
      }
      
      totalDeviation += minDist;
    }
    
    const avgDeviation = totalDeviation / path.length;
    const deviationRatio = avgDeviation / perfectSideLength;
    const pathScore = Math.max(0, 100 - (deviationRatio * 300));
    
    // Combine scores (aspect ratio is more important)
    const finalScore = (aspectScore * 0.6) + (pathScore * 0.4);
    
    return Math.round(finalScore * 10) / 10;
  };

  const distanceToLineSegment = (point: Point, lineStart: Point, lineEnd: Point): number => {
    const dx = lineEnd.x - lineStart.x;
    const dy = lineEnd.y - lineStart.y;
    const lengthSquared = dx * dx + dy * dy;
    
    if (lengthSquared === 0) return calculateDistance(point, lineStart);
    
    let t = ((point.x - lineStart.x) * dx + (point.y - lineStart.y) * dy) / lengthSquared;
    t = Math.max(0, Math.min(1, t));
    
    const projectionX = lineStart.x + t * dx;
    const projectionY = lineStart.y + t * dy;
    
    return calculateDistance(point, { x: projectionX, y: projectionY });
  };


  const getCanvasPoint = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>): Point => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    const scaleX = CANVAS_SIZE / rect.width;
    const scaleY = CANVAS_SIZE / rect.height;

    if ("touches" in e) {
      const touch = e.touches[0];
      return {
        x: (touch.clientX - rect.left) * scaleX,
        y: (touch.clientY - rect.top) * scaleY,
      };
    } else {
      return {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY,
      };
    }
  };

  const handleStart = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const point = getCanvasPoint(e);

    setIsDrawing(true);
    setDrawnPath([point]);
    setScore(null);
    setPerfectSquare([]);
    setRealtimeScore(0);
  };

  const handleMove = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    if (!isDrawing) return;

    const point = getCanvasPoint(e);
    setDrawnPath(prev => [...prev, point]);
  };

  const handleEnd = () => {
    if (!isDrawing || drawnPath.length < 10) {
      setIsDrawing(false);
      setDrawnPath([]);
      setPerfectSquare([]);
      return;
    }

    setIsDrawing(false);
    setAttempts(prev => prev + 1);

    // Calculate perfect square based on drawn path (already set during drawing)
    const perfect = calculatePerfectSquare(drawnPath);
    setPerfectSquare(perfect);

    // Calculate how close they were
    const perfection = calculateSquarePerfection(drawnPath, perfect);
    setScore(perfection);

    // Update high score if needed
    if (perfection > highScore) {
      setHighScore(perfection);
      localStorage.setItem("drawSquareHighScore", perfection.toString());
      playSuccessSound();
    } else if (perfection > 85) {
      playSuccessSound();
    } else if (perfection < 50) {
      playErrorSound();
    }
  };

  const handleReset = () => {
    setIsDrawing(false);
    setDrawnPath([]);
    setPerfectSquare([]);
    setScore(null);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      {/* Header */}
      <header className="border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-6xl mx-auto px-6 py-6">
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
            <span className="text-4xl">⬜</span>
            <h1 className="text-4xl font-bold text-black dark:text-white">
              Draw a Perfect Square
            </h1>
          </div>
        </div>
      </header>

      {/* Main Game Area */}
      <main className="max-w-5xl mx-auto px-6 py-8">
        {/* Score Display */}
        {score !== null ? (
          <div className="text-center mb-6 animate-fade-in">
            <p className={`text-8xl font-bold mb-2 ${
              score >= 95 ? "text-green-600 dark:text-green-400" :
              score >= 85 ? "text-blue-600 dark:text-blue-400" :
              score >= 70 ? "text-yellow-600 dark:text-yellow-400" :
              score >= 50 ? "text-orange-600 dark:text-orange-400" :
              "text-red-600 dark:text-red-400"
            }`}>
              {score}%
            </p>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              {score >= 99 ? "🎯 PERFECT!" :
               score >= 95 ? "⭐ Nearly Perfect!" :
               score >= 85 ? "👍 Excellent!" :
               score >= 70 ? "👌 Good!" :
               score >= 50 ? "🤔 Not Bad" :
               "😅 Keep Trying!"}
            </p>
          </div>
        ) : isDrawing && realtimeScore > 0 ? (
          <div className="text-center mb-6">
            <p className={`text-7xl font-bold mb-2 transition-colors duration-200 ${
              realtimeScore >= 95 ? "text-green-600 dark:text-green-400" :
              realtimeScore >= 85 ? "text-blue-600 dark:text-blue-400" :
              realtimeScore >= 70 ? "text-yellow-600 dark:text-yellow-400" :
              realtimeScore >= 50 ? "text-orange-600 dark:text-orange-400" :
              "text-red-600 dark:text-red-400"
            }`}>
              {realtimeScore.toFixed(1)}%
            </p>
            <p className="text-lg text-gray-400 dark:text-gray-600">
              Keep going...
            </p>
          </div>
        ) : (
          <div className="text-center mb-6">
            <p className="text-2xl text-gray-400 dark:text-gray-600 mb-2">
              Draw a perfect square
            </p>
            {attempts > 0 && (
              <p className="text-sm text-gray-500 dark:text-gray-500">
                Best: {highScore.toFixed(1)}%
              </p>
            )}
          </div>
        )}

        {/* Canvas */}
        <div className="flex justify-center">
          <div className="relative">
            <canvas
              ref={canvasRef}
              width={CANVAS_SIZE}
              height={CANVAS_SIZE}
              onMouseDown={handleStart}
              onMouseMove={handleMove}
              onMouseUp={handleEnd}
              onMouseLeave={handleEnd}
              onTouchStart={handleStart}
              onTouchMove={handleMove}
              onTouchEnd={handleEnd}
              className="touch-none cursor-crosshair bg-white dark:bg-gray-950 rounded-lg shadow-lg"
              style={{ width: "100%", maxWidth: "600px", height: "auto" }}
            />
            {score !== null && (
              <button
                onClick={handleReset}
                className="absolute top-4 right-4 px-4 py-2 text-sm font-semibold bg-white/90 dark:bg-black/90 text-black dark:text-white rounded-lg hover:bg-white dark:hover:bg-black transition-colors shadow-lg"
              >
                Try Again
              </button>
            )}
          </div>
        </div>

        {/* Stats */}
        {attempts > 0 && (
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-500">
              Attempts: {attempts} • Best: {highScore.toFixed(1)}%
            </p>
          </div>
        )}
      </main>
    </div>
  );
}

