import wordsData from "@/data/chair-or-swear-words.json";

export interface WordData {
  chairs: string[];
  swears: string[];
  metadata: {
    version: string;
    lastUpdated: string;
    chairCount: number;
    swearCount: number;
    difficulty: string;
    notes: string;
  };
}

export interface GameWord {
  word: string;
  type: "chair" | "swear";
}

/**
 * Get all chair and swear words from the JSON data
 */
export function getWordData(): WordData {
  return wordsData as WordData;
}

/**
 * Get a random word from either chairs or swears
 */
export function getRandomWord(): GameWord {
  const data = getWordData();
  const isChair = Math.random() > 0.5;
  
  if (isChair) {
    const randomIndex = Math.floor(Math.random() * data.chairs.length);
    return {
      word: data.chairs[randomIndex],
      type: "chair"
    };
  } else {
    const randomIndex = Math.floor(Math.random() * data.swears.length);
    return {
      word: data.swears[randomIndex],
      type: "swear"
    };
  }
}

/**
 * Get a list of random words for a game session
 * @param count Number of words to generate
 * @param avoidDuplicates Whether to avoid duplicate words in the session
 */
export function getGameWords(count: number, avoidDuplicates: boolean = true): GameWord[] {
  const words: GameWord[] = [];
  const usedWords = new Set<string>();
  
  for (let i = 0; i < count; i++) {
    let word = getRandomWord();
    
    if (avoidDuplicates) {
      // Keep trying until we get a unique word
      while (usedWords.has(word.word)) {
        word = getRandomWord();
      }
      usedWords.add(word.word);
    }
    
    words.push(word);
  }
  
  return words;
}

/**
 * Shuffle an array (Fisher-Yates algorithm)
 */
export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Check if a guess is correct
 */
export function checkAnswer(word: string, guess: "chair" | "swear"): boolean {
  const data = getWordData();
  
  if (guess === "chair") {
    return data.chairs.includes(word);
  } else {
    return data.swears.includes(word);
  }
}

