import { getTopic } from "@/data/topics";

const TOPIC_FOCUS: Record<string, string> = {
  world_news: "major global news, geopolitics, diplomacy, conflict updates",
  india_news: "Indian politics, policy, economy, major national stories",
  us_americas: "US politics, policy, and major North/South American news",
  europe: "European politics, EU policy, major continental stories",
  middle_east: "Middle East politics, conflict, energy, and diplomacy",
  china_asia: "China and broader Asia: politics, economy, technology",
  markets_finance: "global markets, equities, bonds, FX, central banks",
  startups_business: "startups, funding rounds, tech business deals, IPOs",
  crypto_web3: "crypto markets, regulation, on-chain news, web3 products",
  real_estate: "global property markets, rates impact, housing trends",
  ai_ml: "AI/ML research, model releases, AI products, AI policy",
  space_astronomy: "space launches, missions, astronomy discoveries",
  gadgets_tech: "consumer hardware, phones, laptops, wearables, reviews",
  cybersecurity: "breaches, vulnerabilities, ransomware, security policy",
  vlsi_semiconductors: "chips, foundries, EDA, semis supply chain",
  science_research: "notable peer-reviewed science findings across fields",
  health_medicine: "clinical findings, public health, biotech, pharma",
  climate_environment: "climate science, policy, energy transition",
  sports: "major global sports headlines (multi-sport roundup)",
  formula_1: "Formula 1 racing news, results, team updates",
  football_soccer: "global football: leagues, transfers, results",
  entertainment: "film, TV, streaming, music, celebrity news",
  food_culture: "food, restaurants, culture, travel",
  english_vocab: "5 advanced English vocabulary words with meaning & usage",
  history: "a focused 'on this day' / deep-dive history brief",
};

export function buildPrompt(topicId: string, wordTarget: number): string {
  const topic = getTopic(topicId);
  const label = topic?.label ?? topicId;
  const focus = TOPIC_FOCUS[topicId] ?? label;

  if (topicId === "english_vocab") {
    return `You are writing a short daily English vocabulary brief.

Pick 5 advanced but useful English words. For each: bold the word, give its part of speech in italics, then a clear definition, then one natural example sentence.

Format strictly as Markdown:
## Today's 5 Words
- **word** *(part of speech)* — definition. _Example: "..."_

Aim for roughly ${wordTarget} words total. No preamble, no closing remarks.`;
  }

  if (topicId === "history") {
    return `You are writing a daily history brief in the style of "On this day".

Pick 1 significant historical event tied to today's date (or a notable anniversary this week). Provide: a markdown H2 headline naming the event, a punchy intro paragraph, and 3-5 bullets giving context, key figures (bold names), and lasting impact.

Aim for roughly ${wordTarget} words. Use Markdown (## headline, **bold** key facts, * for emphasis, - for bullets). No preamble.`;
  }

  return `You are writing a concise daily news brief for the topic: ${label}.
Focus area: ${focus}.

Cover the most important recent developments. Use Markdown:
- A single H2 headline at the top summarizing the most important story
- 2-4 short paragraphs of grounded reporting
- Bold the most important entities, numbers, and facts with **bold**
- Use - bullets for lists of related items where helpful
- Be neutral, specific, fact-dense. No filler, no AI disclaimers, no "as an AI..." text. No preamble.

Length: roughly ${wordTarget} words. Today's date: ${new Date().toISOString().slice(0, 10)}.`;
}
