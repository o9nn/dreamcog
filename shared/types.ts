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
