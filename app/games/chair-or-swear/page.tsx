"use client";

import Link from "next/link";
import { useState } from "react";

export default function ChairOrSwear() {
  const [score, setScore] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);

  const handleStartGame = () => {
    setGameStarted(true);
    setScore(0);
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
            <span className="text-4xl">🪑</span>
            <h1 className="text-4xl font-bold text-black dark:text-white">
              Chair or Swear
            </h1>
          </div>
        </div>
      </header>

      {/* Main Game Area */}
      <main className="max-w-4xl mx-auto px-6 py-12">
        {/* Instructions */}
        <div className="mb-8 p-6 border border-gray-200 dark:border-gray-800 rounded-lg">
          <h2 className="text-2xl font-semibold text-black dark:text-white mb-4">
            How to Play
          </h2>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-2">
            You'll be shown a word. Decide if it's a type of chair or a swear word!
          </p>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
            Click the correct category to score points. Wrong answers end the game.
          </p>
        </div>

        {/* Score Display */}
        {gameStarted && (
          <div className="text-center mb-8">
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-2">Score</p>
            <p className="text-6xl font-bold text-black dark:text-white">{score}</p>
          </div>
        )}

        {/* Game Content */}
        <div className="flex flex-col items-center gap-6">
          {!gameStarted ? (
            <button
              onClick={handleStartGame}
              className="px-8 py-4 text-lg font-semibold bg-black dark:bg-white text-white dark:text-black rounded-lg hover:opacity-80 transition-opacity"
            >
              Start Game
            </button>
          ) : (
            <>
              {/* Word Display - Placeholder */}
              <div className="w-full max-w-2xl p-12 border-2 border-gray-200 dark:border-gray-800 rounded-lg text-center">
                <p className="text-5xl font-bold text-black dark:text-white mb-8">
                  WORD
                </p>
                <p className="text-gray-400 dark:text-gray-600 italic">
                  (Game logic to be implemented)
                </p>
              </div>

              {/* Answer Buttons - Placeholder */}
              <div className="flex gap-4">
                <button className="px-8 py-4 text-lg font-semibold border-2 border-black dark:border-white text-black dark:text-white rounded-lg hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors">
                  🪑 Chair
                </button>
                <button className="px-8 py-4 text-lg font-semibold border-2 border-black dark:border-white text-black dark:text-white rounded-lg hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors">
                  💢 Swear
                </button>
              </div>

              {/* Restart Button */}
              <button
                onClick={handleStartGame}
                className="mt-4 text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors"
              >
                Restart Game
              </button>
            </>
          )}
        </div>

        {/* Additional Info */}
        <div className="mt-12 p-6 bg-gray-50 dark:bg-gray-900 rounded-lg">
          <h3 className="text-lg font-semibold text-black dark:text-white mb-2">
            About This Game
          </h3>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
            This is a fun word recognition game that challenges your ability to distinguish
            between furniture terminology and profanity. Perfect for expanding your
            vocabulary in both categories!
          </p>
        </div>
      </main>
    </div>
  );
}

