"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { getRandomWord, checkAnswer, type GameWord } from "@/lib/chair-or-swear-data";

type GameState = "idle" | "playing" | "correct" | "wrong" | "gameOver";

export default function ChairOrSwear() {
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [gameState, setGameState] = useState<GameState>("idle");
  const [currentWord, setCurrentWord] = useState<GameWord | null>(null);
  const [feedback, setFeedback] = useState("");
  const [wordKey, setWordKey] = useState(0); // Key to trigger animation

  // Load high score from localStorage on mount
  useEffect(() => {
    const savedHighScore = localStorage.getItem("chairOrSwearHighScore");
    if (savedHighScore) {
      setHighScore(parseInt(savedHighScore, 10));
    }
  }, []);

  const handleStartGame = () => {
    setGameState("playing");
    setScore(0);
    setFeedback("");
    loadNextWord();
  };

  const loadNextWord = () => {
    const word = getRandomWord();
    setCurrentWord(word);
    setGameState("playing");
    setWordKey(prev => prev + 1); // Increment key to trigger animation
  };

  const handleAnswer = (guess: "chair" | "swear") => {
    if (!currentWord || gameState !== "playing") return;

    const isCorrect = checkAnswer(currentWord.word, guess);

    if (isCorrect) {
      const newScore = score + 1;
      setScore(newScore);
      setGameState("correct");
      setFeedback("Correct! 🎉");

      // Update high score if needed
      if (newScore > highScore) {
        setHighScore(newScore);
        localStorage.setItem("chairOrSwearHighScore", newScore.toString());
      }

      // Load next word after a short delay
      setTimeout(() => {
        loadNextWord();
      }, 800);
    } else {
      setGameState("wrong");
      const correctAnswer = currentWord.type === "chair" ? "IKEA chair" : "Swedish swear";
      setFeedback(`Wrong! "${currentWord.word}" is a ${correctAnswer}.`);

      // Show game over after a delay
      setTimeout(() => {
        setGameState("gameOver");
      }, 2000);
    }
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
            You'll be shown a Swedish word. Decide if it's an IKEA chair name or a Swedish swear word!
          </p>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
            Click the correct category to score points. Wrong answers end the game.
          </p>
        </div>

        {/* Score Display */}
        {gameState !== "idle" && (
          <div className="flex justify-center gap-12 mb-8">
            <div className="text-center">
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-2">Score</p>
              <p className="text-6xl font-bold text-black dark:text-white">{score}</p>
            </div>
            <div className="text-center">
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-2">High Score</p>
              <p className="text-6xl font-bold text-blue-600 dark:text-blue-400">{highScore}</p>
            </div>
          </div>
        )}

        {/* Game Content */}
        <div className="flex flex-col items-center gap-6">
          {gameState === "idle" ? (
            <button
              onClick={handleStartGame}
              className="px-8 py-4 text-lg font-semibold bg-black dark:bg-white text-white dark:text-black rounded-lg hover:opacity-80 transition-opacity"
            >
              Start Game
            </button>
          ) : gameState === "gameOver" ? (
            <>
              {/* Game Over Screen */}
              <div className="w-full max-w-2xl p-12 border-2 border-gray-200 dark:border-gray-800 rounded-lg text-center animate-fade-in">
                <p className="text-4xl font-bold text-black dark:text-white mb-4">
                  Game Over!
                </p>
                <p className="text-2xl text-gray-600 dark:text-gray-400 mb-2">
                  Final Score: {score}
                </p>
                {score === highScore && score > 0 && (
                  <p className="text-lg text-blue-600 dark:text-blue-400 mb-6 animate-bounce">
                    🎉 New High Score! 🎉
                  </p>
                )}
                <button
                  onClick={handleStartGame}
                  className="mt-4 px-8 py-4 text-lg font-semibold bg-black dark:bg-white text-white dark:text-black rounded-lg hover:opacity-80 transition-opacity"
                >
                  Play Again
                </button>
              </div>
            </>
          ) : (
            <>
              {/* Word Display */}
              <div className="w-full max-w-2xl p-12 border-2 border-gray-200 dark:border-gray-800 rounded-lg text-center">
                <p 
                  key={wordKey}
                  className="text-5xl font-bold text-black dark:text-white mb-8 animate-word-appear"
                >
                  {currentWord?.word || "..."}
                </p>
                
                {/* Feedback */}
                {feedback && (
                  <p className={`text-xl font-semibold animate-fade-in ${
                    gameState === "correct" 
                      ? "text-green-600 dark:text-green-400" 
                      : "text-red-600 dark:text-red-400"
                  }`}>
                    {feedback}
                  </p>
                )}
              </div>

              {/* Answer Buttons */}
              <div className="flex gap-4">
                <button
                  onClick={() => handleAnswer("chair")}
                  disabled={gameState !== "playing"}
                  className="px-8 py-4 text-lg font-semibold border-2 border-black dark:border-white text-black dark:text-white rounded-lg hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  🪑 IKEA Chair
                </button>
                <button
                  onClick={() => handleAnswer("swear")}
                  disabled={gameState !== "playing"}
                  className="px-8 py-4 text-lg font-semibold border-2 border-black dark:border-white text-black dark:text-white rounded-lg hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  💢 Swedish Swear
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
            This is a fun Swedish word recognition game! Can you tell the difference between
            IKEA furniture names and Swedish profanity? It's harder than you think! Perfect for
            Scandiphiles, IKEA enthusiasts, or anyone who wants to test their Swedish vocabulary.
          </p>
        </div>
      </main>
    </div>
  );
}

