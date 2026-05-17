export interface Topic {
  id: string;
  label: string;
  emoji: string;
  category: string;
}

export const ALL_TOPICS: Topic[] = [
  { id: "world_news", label: "World News", emoji: "🌍", category: "World & Politics" },
  { id: "india_news", label: "India", emoji: "🇮🇳", category: "World & Politics" },
  { id: "us_americas", label: "US & Americas", emoji: "🗽", category: "World & Politics" },
  { id: "europe", label: "Europe", emoji: "🏛️", category: "World & Politics" },
  { id: "middle_east", label: "Middle East", emoji: "🕌", category: "World & Politics" },
  { id: "china_asia", label: "China & Asia", emoji: "🐉", category: "World & Politics" },
  { id: "markets_finance", label: "Markets", emoji: "📈", category: "Business & Economy" },
  { id: "startups_business", label: "Startups", emoji: "🚀", category: "Business & Economy" },
  { id: "crypto_web3", label: "Crypto", emoji: "₿", category: "Business & Economy" },
  { id: "real_estate", label: "Real Estate", emoji: "🏠", category: "Business & Economy" },
  { id: "ai_ml", label: "AI & ML", emoji: "🤖", category: "Technology" },
  { id: "space_astronomy", label: "Space", emoji: "🛰️", category: "Technology" },
  { id: "gadgets_tech", label: "Gadgets", emoji: "📱", category: "Technology" },
  { id: "cybersecurity", label: "Cybersecurity", emoji: "🔒", category: "Technology" },
  { id: "vlsi_semiconductors", label: "Semiconductors", emoji: "💾", category: "Technology" },
  { id: "science_research", label: "Science", emoji: "🔬", category: "Science & Health" },
  { id: "health_medicine", label: "Health", emoji: "🏥", category: "Science & Health" },
  { id: "climate_environment", label: "Climate", emoji: "🌿", category: "Science & Health" },
  { id: "sports", label: "Sports", emoji: "🏆", category: "Culture & Lifestyle" },
  { id: "formula_1", label: "Formula 1", emoji: "🏎️", category: "Culture & Lifestyle" },
  { id: "football_soccer", label: "Football", emoji: "⚽", category: "Culture & Lifestyle" },
  { id: "entertainment", label: "Entertainment", emoji: "🎬", category: "Culture & Lifestyle" },
  { id: "food_culture", label: "Food & Culture", emoji: "🍜", category: "Culture & Lifestyle" },
  { id: "english_vocab", label: "Vocabulary", emoji: "📖", category: "Learning" },
  { id: "history", label: "History", emoji: "🏺", category: "Learning" },
];

export const TOPIC_COLORS: Record<string, string> = {
  world_news: "#3cb9ff",
  india_news: "#ff9933",
  us_americas: "#4a90d9",
  europe: "#5b8dee",
  middle_east: "#f0a500",
  china_asia: "#ff4d4d",
  markets_finance: "#00c896",
  startups_business: "#fb923c",
  crypto_web3: "#f7931a",
  real_estate: "#a78bfa",
  ai_ml: "#00ff9d",
  space_astronomy: "#818cf8",
  gadgets_tech: "#38bdf8",
  cybersecurity: "#f43f5e",
  vlsi_semiconductors: "#00ff9d",
  science_research: "#c084fc",
  health_medicine: "#34d399",
  climate_environment: "#6ee7b7",
  sports: "#fbbf24",
  formula_1: "#ff3c3c",
  football_soccer: "#4ade80",
  entertainment: "#f472b6",
  food_culture: "#fb923c",
  english_vocab: "#f5c842",
  history: "#a3e635",
};

export const CATEGORIES = [
  "World & Politics",
  "Business & Economy",
  "Technology",
  "Science & Health",
  "Culture & Lifestyle",
  "Learning",
];

export function getTopic(id: string): Topic | undefined {
  return ALL_TOPICS.find((t) => t.id === id);
}

export function topicColor(id: string): string {
  return TOPIC_COLORS[id] ?? "#00ff9d";
}
