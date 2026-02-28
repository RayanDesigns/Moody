export interface UserProfile {
  displayName: string;
  email: string;
  createdAt: Date;
  currentStreak: number;
  longestStreak: number;
  lastCheckInDate: string; // YYYY-MM-DD
}

export interface SentimentAnalysis {
  score: number; // 1-5
  primaryEmotion: string;
  emotions: string[];
  triggers: string[];
  summary: string;
}

export interface JournalEntry {
  id: string;
  content: string;
  moodScore: number; // 1-5
  moodEmoji: string;
  createdAt: Date;
  sentiment: SentimentAnalysis | null;
  aiResponse: string | null;
  promptUsed: string | null;
}

export interface MoodRecord {
  date: string; // YYYY-MM-DD
  score: number; // 1-5
  emoji: string;
  note?: string;
  createdAt: Date;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export const MOOD_OPTIONS = [
  { score: 1, emoji: "😢", label: "Awful", color: "#E57373" },
  { score: 2, emoji: "😟", label: "Bad", color: "#FFB74D" },
  { score: 3, emoji: "😐", label: "Okay", color: "#FFD54F" },
  { score: 4, emoji: "😊", label: "Good", color: "#AED581" },
  { score: 5, emoji: "😄", label: "Great", color: "#81C784" },
] as const;
