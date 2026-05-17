const KEY = "dailybrief_streak";

interface StreakData {
  current: number;
  best: number;
  lastDate: string | null;
}

function read(): StreakData {
  if (typeof window === "undefined") return { current: 0, best: 0, lastDate: null };
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { current: 0, best: 0, lastDate: null };
    return JSON.parse(raw);
  } catch {
    return { current: 0, best: 0, lastDate: null };
  }
}

function write(d: StreakData) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(KEY, JSON.stringify(d));
  } catch {}
}

function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function yesterdayOf(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00");
  d.setDate(d.getDate() - 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function getStreakData(): StreakData {
  return read();
}

export function markDayComplete(): StreakData {
  const today = todayStr();
  const data = read();
  if (data.lastDate === today) return data;
  let current = 1;
  if (data.lastDate === yesterdayOf(today)) current = data.current + 1;
  const best = Math.max(data.best, current);
  const next = { current, best, lastDate: today };
  write(next);
  return next;
}
