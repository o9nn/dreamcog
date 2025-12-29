/**
 * Unified type exports
 * Import shared types from this single entry point.
 */

export type * from "../drizzle/schema";
export * from "./_core/errors";

// Sampling parameters for text generation
export interface SamplingParams {
  temperature?: number;
  topP?: number;
  topK?: number;
  minP?: number;
  maxTokens?: number;
  presencePenalty?: number;
  frequencyPenalty?: number;
  repetitionPenalty?: number;
  stopSequences?: string[];
}

// Message types for chat
export type MessageType = "message" | "text" | "instruction" | "user" | "system";

// Interaction types for scenarios
export type InteractionType = "message" | "text" | "instruction";

// Available models
export const MODELS = [
  { id: "lucid-v1-medium", name: "Lucid V1 Medium", size: "sm" },
  { id: "lucid-v1-extra-large", name: "Lucid V1 Extra Large", size: "xl" },
] as const;

export type ModelId = typeof MODELS[number]["id"];

// Image generation options
export const ASPECT_RATIOS = [
  { id: "square", name: "Square (1:1)", width: 1024, height: 1024 },
  { id: "portrait", name: "Portrait (3:4)", width: 768, height: 1024 },
  { id: "landscape", name: "Landscape (4:3)", width: 1024, height: 768 },
] as const;

export const IMAGE_STYLES = [
  { id: "none", name: "None" },
  { id: "anime", name: "Anime" },
  { id: "realistic", name: "Realistic" },
  { id: "fantasy", name: "Fantasy" },
  { id: "dark", name: "Dark/Gothic" },
  { id: "vibrant", name: "Vibrant" },
] as const;

// Default values
export const DEFAULT_SAMPLING_PARAMS: SamplingParams = {
  temperature: 0.8,
  topP: 0.95,
  topK: 50,
  minP: 0.05,
  maxTokens: 500,
  presencePenalty: 0,
  frequencyPenalty: 0,
  repetitionPenalty: 1.0,
};

// Personality trait defaults (Big Five model)
export const DEFAULT_PERSONALITY_TRAITS = {
  openness: 50,
  conscientiousness: 50,
  extraversion: 50,
  agreeableness: 50,
  neuroticism: 50,
};

// Emotional state defaults
export const DEFAULT_EMOTIONAL_STATE = {
  happiness: 50,
  sadness: 0,
  anger: 0,
  fear: 0,
  surprise: 0,
  disgust: 0,
  needSafety: 50,
  needBelonging: 50,
  needEsteem: 50,
  needAutonomy: 50,
  needCompetence: 50,
  overallMood: 50,
  stressLevel: 0,
  energyLevel: 50,
};

// Relationship types
export const RELATIONSHIP_TYPES = [
  { id: "friend", name: "Friend" },
  { id: "enemy", name: "Enemy" },
  { id: "rival", name: "Rival" },
  { id: "family", name: "Family" },
  { id: "romantic", name: "Romantic" },
  { id: "mentor", name: "Mentor" },
  { id: "ally", name: "Ally" },
  { id: "neutral", name: "Neutral" },
  { id: "complex", name: "Complex" },
] as const;

// Group types
export const GROUP_TYPES = [
  { id: "family", name: "Family" },
  { id: "organization", name: "Organization" },
  { id: "faction", name: "Faction" },
  { id: "community", name: "Community" },
  { id: "team", name: "Team" },
  { id: "guild", name: "Guild" },
  { id: "clan", name: "Clan" },
  { id: "other", name: "Other" },
] as const;

// Location types
export const LOCATION_TYPES = [
  { id: "city", name: "City" },
  { id: "building", name: "Building" },
  { id: "wilderness", name: "Wilderness" },
  { id: "dungeon", name: "Dungeon" },
  { id: "realm", name: "Realm" },
  { id: "dimension", name: "Dimension" },
  { id: "other", name: "Other" },
] as const;

// Lore categories
export const LORE_CATEGORIES = [
  { id: "history", name: "History" },
  { id: "legend", name: "Legend" },
  { id: "culture", name: "Culture" },
  { id: "religion", name: "Religion" },
  { id: "politics", name: "Politics" },
  { id: "science", name: "Science" },
  { id: "magic", name: "Magic" },
  { id: "species", name: "Species" },
  { id: "language", name: "Language" },
  { id: "artifact", name: "Artifact" },
  { id: "other", name: "Other" },
] as const;

// Event types for world events
export const WORLD_EVENT_TYPES = [
  { id: "battle", name: "Battle" },
  { id: "discovery", name: "Discovery" },
  { id: "political", name: "Political" },
  { id: "natural", name: "Natural Disaster" },
  { id: "magical", name: "Magical Event" },
  { id: "social", name: "Social Event" },
  { id: "economic", name: "Economic Event" },
  { id: "other", name: "Other" },
] as const;

// Memory types
export const MEMORY_TYPES = [
  { id: "event", name: "Event" },
  { id: "interaction", name: "Interaction" },
  { id: "knowledge", name: "Knowledge" },
  { id: "emotion", name: "Emotion" },
  { id: "skill", name: "Skill" },
  { id: "trauma", name: "Trauma" },
  { id: "achievement", name: "Achievement" },
] as const;
