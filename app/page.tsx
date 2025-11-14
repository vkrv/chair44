import Link from "next/link";

interface Game {
  id: string;
  title: string;
  description: string;
  emoji: string;
}

const games: Game[] = [
  {
    id: "snake",
    title: "Snake Game",
    description: "Classic snake game. Eat food, grow longer, don't hit yourself!",
    emoji: "🐍"
  },
  {
    id: "tic-tac-toe",
    title: "Tic Tac Toe",
    description: "Challenge a friend to the timeless game of X's and O's.",
    emoji: "⭕"
  },
  {
    id: "memory-match",
    title: "Memory Match",
    description: "Test your memory by finding matching pairs of cards.",
    emoji: "🧠"
  },
  {
    id: "2048",
    title: "2048",
    description: "Combine tiles to reach 2048. Simple yet addictive puzzle game.",
    emoji: "🎯"
  },
  {
    id: "whack-a-mole",
    title: "Whack-a-Mole",
    description: "Test your reflexes! Click the moles before they disappear.",
    emoji: "🔨"
  },
  {
    id: "typing-race",
    title: "Typing Race",
    description: "How fast can you type? Challenge yourself and improve your speed.",
    emoji: "⌨️"
  },
  {
    id: "color-match",
    title: "Color Match",
    description: "Match the colors as quickly as possible. Speed and accuracy matter!",
    emoji: "🎨"
  },
  {
    id: "word-puzzle",
    title: "Word Puzzle",
    description: "Find hidden words in a grid of letters. Expand your vocabulary!",
    emoji: "📝"
  }
];

export default function Home() {
  return (
    <div className="min-h-screen bg-white dark:bg-black">
      {/* Header */}
      <header className="border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <h1 className="text-4xl font-bold text-black dark:text-white">
            Chair44
          </h1>
        </div>
      </header>

      {/* Games Grid */}
      <main className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {games.map((game) => (
            <Link
              key={game.id}
              href={`/games/${game.id}`}
              className="group block p-8 border border-gray-200 dark:border-gray-800 rounded-lg transition-all hover:border-gray-400 dark:hover:border-gray-600 hover:shadow-lg"
            >
              <div className="flex items-start gap-4">
                <div className="text-4xl flex-shrink-0 transition-transform group-hover:scale-110">
                  {game.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-2xl font-semibold text-black dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {game.title}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                    {game.description}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-gray-800 mt-20">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <p className="text-center text-gray-600 dark:text-gray-400">
            Made with ❤️ for game lovers
          </p>
        </div>
      </footer>
    </div>
  );
}
