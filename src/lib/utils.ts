import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, isToday, isYesterday, differenceInCalendarDays } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatEntryDate(date: Date): string {
  if (isToday(date)) return "Today";
  if (isYesterday(date)) return "Yesterday";
  return format(date, "MMMM d, yyyy");
}

export function formatTime(date: Date): string {
  return format(date, "h:mm a");
}

export function todayString(): string {
  return format(new Date(), "yyyy-MM-dd");
}

export function calculateStreak(
  lastCheckInDate: string | null,
  currentStreak: number
): { newStreak: number; isNewDay: boolean } {
  const today = todayString();

  if (!lastCheckInDate) {
    return { newStreak: 1, isNewDay: true };
  }

  if (lastCheckInDate === today) {
    return { newStreak: currentStreak, isNewDay: false };
  }

  const daysDiff = differenceInCalendarDays(
    new Date(today),
    new Date(lastCheckInDate)
  );

  if (daysDiff === 1) {
    return { newStreak: currentStreak + 1, isNewDay: true };
  }

  return { newStreak: 1, isNewDay: true };
}

export function getMoodColor(score: number): string {
  const colors: Record<number, string> = {
    1: "#E57373",
    2: "#FFB74D",
    3: "#FFD54F",
    4: "#AED581",
    5: "#81C784",
  };
  return colors[score] || "#FFD54F";
}
