import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, json, boolean } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * API Keys - Securely store user's DreamGen API keys
 */
export const apiKeys = mysqlTable("api_keys", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  keyName: varchar("keyName", { length: 100 }).notNull(),
  encryptedKey: text("encryptedKey").notNull(),
  lastUsed: timestamp("lastUsed"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ApiKey = typeof apiKeys.$inferSelect;
export type InsertApiKey = typeof apiKeys.$inferInsert;

/**
 * Characters - Define characters for role-play and stories
 */
export const characters = mysqlTable("characters", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 200 }).notNull(),
  label: varchar("label", { length: 100 }).notNull(),
  promptDescription: text("promptDescription"),
  displayDescription: text("displayDescription"),
  imageUrl: text("imageUrl"),
  isUserCharacter: boolean("isUserCharacter").default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Character = typeof characters.$inferSelect;
export type InsertCharacter = typeof characters.$inferInsert;

/**
 * Scenarios - Role-play scenarios with settings and characters
 */
export const scenarios = mysqlTable("scenarios", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  title: varchar("title", { length: 300 }).notNull(),
  promptDescription: text("promptDescription"),
  displayDescription: text("displayDescription"),
  imageUrl: text("imageUrl"),
  isPublic: boolean("isPublic").default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Scenario = typeof scenarios.$inferSelect;
export type InsertScenario = typeof scenarios.$inferInsert;

/**
 * Scenario Characters - Link characters to scenarios
 */
export const scenarioCharacters = mysqlTable("scenario_characters", {
  id: int("id").autoincrement().primaryKey(),
  scenarioId: int("scenarioId").notNull(),
  characterId: int("characterId"),
  name: varchar("name", { length: 200 }).notNull(),
  label: varchar("label", { length: 100 }).notNull(),
  promptDescription: text("promptDescription"),
  isUserCharacter: boolean("isUserCharacter").default(false),
  orderIndex: int("orderIndex").default(0),
});

export type ScenarioCharacter = typeof scenarioCharacters.$inferSelect;
export type InsertScenarioCharacter = typeof scenarioCharacters.$inferInsert;

/**
 * Scenario Interactions - Initial interactions for scenarios (intro)
 */
export const scenarioInteractions = mysqlTable("scenario_interactions", {
  id: int("id").autoincrement().primaryKey(),
  scenarioId: int("scenarioId").notNull(),
  interactionType: mysqlEnum("interactionType", ["message", "text", "instruction"]).notNull(),
  characterLabel: varchar("characterLabel", { length: 100 }),
  content: text("content").notNull(),
  isSticky: boolean("isSticky").default(false),
  orderIndex: int("orderIndex").default(0),
});

export type ScenarioInteraction = typeof scenarioInteractions.$inferSelect;
export type InsertScenarioInteraction = typeof scenarioInteractions.$inferInsert;

/**
 * Chat Sessions - Role-play chat sessions
 */
export const chatSessions = mysqlTable("chat_sessions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  scenarioId: int("scenarioId"),
  title: varchar("title", { length: 300 }).notNull(),
  systemPrompt: text("systemPrompt"),
  modelId: varchar("modelId", { length: 100 }).default("lucid-v1-medium"),
  samplingParams: json("samplingParams"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ChatSession = typeof chatSessions.$inferSelect;
export type InsertChatSession = typeof chatSessions.$inferInsert;

/**
 * Chat Messages - Messages in chat sessions
 */
export const chatMessages = mysqlTable("chat_messages", {
  id: int("id").autoincrement().primaryKey(),
  sessionId: int("sessionId").notNull(),
  messageType: mysqlEnum("messageType", ["message", "text", "instruction", "user", "system"]).notNull(),
  characterLabel: varchar("characterLabel", { length: 100 }),
  characterName: varchar("characterName", { length: 200 }),
  content: text("content").notNull(),
  isSticky: boolean("isSticky").default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertChatMessage = typeof chatMessages.$inferInsert;

/**
 * Stories - Story generation projects
 */
export const stories = mysqlTable("stories", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  title: varchar("title", { length: 300 }).notNull(),
  plotDescription: text("plotDescription"),
  styleDescription: text("styleDescription"),
  content: text("content"),
  modelId: varchar("modelId", { length: 100 }).default("lucid-v1-medium"),
  samplingParams: json("samplingParams"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Story = typeof stories.$inferSelect;
export type InsertStory = typeof stories.$inferInsert;

/**
 * Story Characters - Characters in stories
 */
export const storyCharacters = mysqlTable("story_characters", {
  id: int("id").autoincrement().primaryKey(),
  storyId: int("storyId").notNull(),
  name: varchar("name", { length: 200 }).notNull(),
  description: text("description"),
  orderIndex: int("orderIndex").default(0),
});

export type StoryCharacter = typeof storyCharacters.$inferSelect;
export type InsertStoryCharacter = typeof storyCharacters.$inferInsert;

/**
 * Generated Images - Track image generation history
 */
export const generatedImages = mysqlTable("generated_images", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  includePrompt: text("includePrompt").notNull(),
  excludePrompt: text("excludePrompt"),
  cfgScale: int("cfgScale").default(7),
  fidelity: int("fidelity").default(30),
  aspectRatio: varchar("aspectRatio", { length: 20 }).default("square"),
  style: varchar("style", { length: 100 }),
  seed: int("seed"),
  imageUrl: text("imageUrl"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type GeneratedImage = typeof generatedImages.$inferSelect;
export type InsertGeneratedImage = typeof generatedImages.$inferInsert;
