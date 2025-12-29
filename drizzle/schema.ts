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
  // Personality traits (Big Five model: 0-100 scale)
  personalityOpenness: int("personalityOpenness").default(50),
  personalityConscientiousness: int("personalityConscientiousness").default(50),
  personalityExtraversion: int("personalityExtraversion").default(50),
  personalityAgreeableness: int("personalityAgreeableness").default(50),
  personalityNeuroticism: int("personalityNeuroticism").default(50),
  // Communication style
  communicationStyle: json("communicationStyle").$type<{
    formality?: "casual" | "formal" | "mixed";
    verbosity?: "concise" | "moderate" | "verbose";
    emotionalExpression?: "reserved" | "moderate" | "expressive";
    humorLevel?: number; // 0-100
    directness?: number; // 0-100
  }>(),
  // Behavioral tendencies
  behavioralTendencies: json("behavioralTendencies").$type<{
    impulsiveness?: number; // 0-100
    riskTaking?: number; // 0-100
    empathy?: number; // 0-100
    leadership?: number; // 0-100
    independence?: number; // 0-100
  }>(),
  // Autonomy settings for simulation
  autonomyLevel: int("autonomyLevel").default(50), // 0-100, how autonomous the agent is
  autonomyGoals: json("autonomyGoals").$type<string[]>(), // Primary goals guiding autonomous behavior
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Character = typeof characters.$inferSelect;
export type InsertCharacter = typeof characters.$inferInsert;

/**
 * Character Emotional States - Track current emotional state of characters
 */
export const characterEmotionalStates = mysqlTable("character_emotional_states", {
  id: int("id").autoincrement().primaryKey(),
  characterId: int("characterId").notNull(),
  // Current primary emotions (0-100 intensity)
  happiness: int("happiness").default(50),
  sadness: int("sadness").default(0),
  anger: int("anger").default(0),
  fear: int("fear").default(0),
  surprise: int("surprise").default(0),
  disgust: int("disgust").default(0),
  // Emotional needs (0-100 fulfillment level)
  needSafety: int("needSafety").default(50),
  needBelonging: int("needBelonging").default(50),
  needEsteem: int("needEsteem").default(50),
  needAutonomy: int("needAutonomy").default(50),
  needCompetence: int("needCompetence").default(50),
  // Mood and stress
  overallMood: int("overallMood").default(50), // 0-100
  stressLevel: int("stressLevel").default(0), // 0-100
  energyLevel: int("energyLevel").default(50), // 0-100
  // Context
  lastUpdated: timestamp("lastUpdated").defaultNow().notNull(),
  contextNotes: text("contextNotes"),
});

export type CharacterEmotionalState = typeof characterEmotionalStates.$inferSelect;
export type InsertCharacterEmotionalState = typeof characterEmotionalStates.$inferInsert;

/**
 * Character Motivations - Short and long-term goals/motivations
 */
export const characterMotivations = mysqlTable("character_motivations", {
  id: int("id").autoincrement().primaryKey(),
  characterId: int("characterId").notNull(),
  motivationType: mysqlEnum("motivationType", ["short_term", "long_term", "core_value"]).notNull(),
  description: text("description").notNull(),
  priority: int("priority").default(5), // 1-10
  isActive: boolean("isActive").default(true),
  progress: int("progress").default(0), // 0-100
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type CharacterMotivation = typeof characterMotivations.$inferSelect;
export type InsertCharacterMotivation = typeof characterMotivations.$inferInsert;

/**
 * Relationships - Character-to-character relationships
 */
export const relationships = mysqlTable("relationships", {
  id: int("id").autoincrement().primaryKey(),
  characterId1: int("characterId1").notNull(),
  characterId2: int("characterId2").notNull(),
  relationshipType: mysqlEnum("relationshipType", [
    "friend", "enemy", "rival", "family", "romantic", "mentor", "ally", "neutral", "complex"
  ]).notNull(),
  // Relationship dynamics (0-100 scale)
  trust: int("trust").default(50),
  affection: int("affection").default(50),
  respect: int("respect").default(50),
  loyalty: int("loyalty").default(50),
  dependency: int("dependency").default(50),
  tension: int("tension").default(0),
  // Description and history
  description: text("description"),
  isDynamic: boolean("isDynamic").default(true), // Can this relationship evolve?
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Relationship = typeof relationships.$inferSelect;
export type InsertRelationship = typeof relationships.$inferInsert;

/**
 * Relationship Events - Track significant events in relationships
 */
export const relationshipEvents = mysqlTable("relationship_events", {
  id: int("id").autoincrement().primaryKey(),
  relationshipId: int("relationshipId").notNull(),
  eventType: mysqlEnum("eventType", [
    "first_meeting", "conflict", "bonding", "betrayal", "reconciliation", "milestone", "other"
  ]).notNull(),
  description: text("description").notNull(),
  impactOnTrust: int("impactOnTrust").default(0), // -100 to +100
  impactOnAffection: int("impactOnAffection").default(0),
  impactOnRespect: int("impactOnRespect").default(0),
  eventDate: timestamp("eventDate").defaultNow().notNull(),
  worldEventId: int("worldEventId"), // Link to world events if applicable
});

export type RelationshipEvent = typeof relationshipEvents.$inferSelect;
export type InsertRelationshipEvent = typeof relationshipEvents.$inferInsert;

/**
 * Groups - Social groups and communities
 */
export const groups = mysqlTable("groups", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 200 }).notNull(),
  groupType: mysqlEnum("groupType", [
    "family", "organization", "faction", "community", "team", "guild", "clan", "other"
  ]).notNull(),
  description: text("description"),
  purpose: text("purpose"),
  hierarchy: json("hierarchy").$type<{
    type?: "flat" | "hierarchical" | "council";
    positions?: string[];
  }>(),
  influence: int("influence").default(50), // 0-100, influence level in the world
  worldId: int("worldId"), // Link to world/setting
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Group = typeof groups.$inferSelect;
export type InsertGroup = typeof groups.$inferInsert;

/**
 * Group Memberships - Link characters to groups with roles
 */
export const groupMemberships = mysqlTable("group_memberships", {
  id: int("id").autoincrement().primaryKey(),
  groupId: int("groupId").notNull(),
  characterId: int("characterId").notNull(),
  role: varchar("role", { length: 100 }),
  position: varchar("position", { length: 100 }),
  joinedAt: timestamp("joinedAt").defaultNow().notNull(),
  status: mysqlEnum("status", ["active", "inactive", "former"]).default("active"),
  influence: int("influence").default(50), // Character's influence within the group
});

export type GroupMembership = typeof groupMemberships.$inferSelect;
export type InsertGroupMembership = typeof groupMemberships.$inferInsert;

/**
 * Worlds - World/setting definitions for narratives
 */
export const worlds = mysqlTable("worlds", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 200 }).notNull(),
  description: text("description"),
  genre: varchar("genre", { length: 100 }),
  timeperiod: varchar("timeperiod", { length: 100 }),
  technologyLevel: varchar("technologyLevel", { length: 100 }),
  magicSystem: text("magicSystem"),
  culturalNotes: text("culturalNotes"),
  rules: json("rules").$type<{
    physicsRules?: string[];
    socialRules?: string[];
    magicRules?: string[];
  }>(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type World = typeof worlds.$inferSelect;
export type InsertWorld = typeof worlds.$inferInsert;

/**
 * Locations - Specific locations within worlds
 */
export const locations = mysqlTable("locations", {
  id: int("id").autoincrement().primaryKey(),
  worldId: int("worldId").notNull(),
  name: varchar("name", { length: 200 }).notNull(),
  locationType: mysqlEnum("locationType", [
    "city", "building", "wilderness", "dungeon", "realm", "dimension", "other"
  ]).notNull(),
  description: text("description"),
  parentLocationId: int("parentLocationId"), // For nested locations
  attributes: json("attributes").$type<{
    climate?: string;
    population?: string;
    danger?: number; // 0-100
    resources?: string[];
    notableFeatures?: string[];
  }>(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Location = typeof locations.$inferSelect;
export type InsertLocation = typeof locations.$inferInsert;

/**
 * Lore Entries - Knowledge base for world building
 */
export const loreEntries = mysqlTable("lore_entries", {
  id: int("id").autoincrement().primaryKey(),
  worldId: int("worldId").notNull(),
  category: mysqlEnum("category", [
    "history", "legend", "culture", "religion", "politics", "science", "magic", "species", "language", "artifact", "other"
  ]).notNull(),
  title: varchar("title", { length: 300 }).notNull(),
  content: text("content").notNull(),
  isPublic: boolean("isPublic").default(true), // Known by most in the world
  isSecret: boolean("isSecret").default(false), // Hidden knowledge
  relatedLocationId: int("relatedLocationId"),
  relatedCharacterId: int("relatedCharacterId"),
  tags: json("tags").$type<string[]>(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type LoreEntry = typeof loreEntries.$inferSelect;
export type InsertLoreEntry = typeof loreEntries.$inferInsert;

/**
 * World Events - Timeline of events in the world
 */
export const worldEvents = mysqlTable("world_events", {
  id: int("id").autoincrement().primaryKey(),
  worldId: int("worldId").notNull(),
  title: varchar("title", { length: 300 }).notNull(),
  description: text("description").notNull(),
  eventType: mysqlEnum("eventType", [
    "battle", "discovery", "political", "natural", "magical", "social", "economic", "other"
  ]).notNull(),
  importance: int("importance").default(5), // 1-10
  // Time tracking
  eventDate: varchar("eventDate", { length: 200 }), // Flexible date format for fictional calendars
  duration: varchar("duration", { length: 100 }),
  // Impact
  locationId: int("locationId"),
  involvedCharacterIds: json("involvedCharacterIds").$type<number[]>(),
  involvedGroupIds: json("involvedGroupIds").$type<number[]>(),
  consequences: text("consequences"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type WorldEvent = typeof worldEvents.$inferSelect;
export type InsertWorldEvent = typeof worldEvents.$inferInsert;

/**
 * Character Memories - Track character experiences and memories
 */
export const characterMemories = mysqlTable("character_memories", {
  id: int("id").autoincrement().primaryKey(),
  characterId: int("characterId").notNull(),
  memoryType: mysqlEnum("memoryType", [
    "event", "interaction", "knowledge", "emotion", "skill", "trauma", "achievement"
  ]).notNull(),
  content: text("content").notNull(),
  emotionalImpact: int("emotionalImpact").default(0), // -100 to +100
  importance: int("importance").default(5), // 1-10
  worldEventId: int("worldEventId"),
  relatedCharacterId: int("relatedCharacterId"),
  locationId: int("locationId"),
  memoryDate: timestamp("memoryDate").defaultNow().notNull(),
  lastRecalled: timestamp("lastRecalled"),
  isRepressed: boolean("isRepressed").default(false),
});

export type CharacterMemory = typeof characterMemories.$inferSelect;
export type InsertCharacterMemory = typeof characterMemories.$inferInsert;

/**
 * Scheduled Events - Future events and triggers for simulation
 */
export const scheduledEvents = mysqlTable("scheduled_events", {
  id: int("id").autoincrement().primaryKey(),
  worldId: int("worldId").notNull(),
  eventName: varchar("eventName", { length: 300 }).notNull(),
  description: text("description"),
  scheduledFor: timestamp("scheduledFor").notNull(),
  eventTrigger: json("eventTrigger").$type<{
    triggerType?: "time" | "condition" | "manual";
    conditions?: string[];
  }>(),
  targetCharacterIds: json("targetCharacterIds").$type<number[]>(),
  targetLocationId: int("targetLocationId"),
  priority: int("priority").default(5),
  isRecurring: boolean("isRecurring").default(false),
  status: mysqlEnum("status", ["pending", "active", "completed", "cancelled"]).default("pending"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ScheduledEvent = typeof scheduledEvents.$inferSelect;
export type InsertScheduledEvent = typeof scheduledEvents.$inferInsert;

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
