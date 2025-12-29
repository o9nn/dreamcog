import { eq, and, or, like, desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { 
  InsertUser, users, 
  apiKeys, InsertApiKey,
  characters, InsertCharacter,
  characterEmotionalStates, InsertCharacterEmotionalState,
  characterMotivations, InsertCharacterMotivation,
  characterMemories, InsertCharacterMemory,
  relationships, InsertRelationship,
  relationshipEvents, InsertRelationshipEvent,
  groups, InsertGroup,
  groupMemberships, InsertGroupMembership,
  worlds, InsertWorld,
  locations, InsertLocation,
  loreEntries, InsertLoreEntry, LoreCategory,
  worldEvents, InsertWorldEvent,
  scheduledEvents, InsertScheduledEvent, ScheduledEventStatus,
  scenarios, InsertScenario,
  scenarioCharacters, InsertScenarioCharacter,
  scenarioInteractions, InsertScenarioInteraction,
  chatSessions, InsertChatSession,
  chatMessages, InsertChatMessage,
  stories, InsertStory,
  storyCharacters, InsertStoryCharacter,
  generatedImages, InsertGeneratedImage
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ============ USER HELPERS ============

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// ============ API KEY HELPERS ============

export async function createApiKey(data: InsertApiKey) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(apiKeys).values(data);
  return result[0].insertId;
}

export async function getApiKeysByUserId(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return db.select({
    id: apiKeys.id,
    keyName: apiKeys.keyName,
    lastUsed: apiKeys.lastUsed,
    createdAt: apiKeys.createdAt,
  }).from(apiKeys).where(eq(apiKeys.userId, userId));
}

export async function getApiKeyById(id: number, userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(apiKeys)
    .where(and(eq(apiKeys.id, id), eq(apiKeys.userId, userId)))
    .limit(1);
  return result[0];
}

export async function deleteApiKey(id: number, userId: number) {
  const db = await getDb();
  if (!db) return;
  
  await db.delete(apiKeys).where(and(eq(apiKeys.id, id), eq(apiKeys.userId, userId)));
}

export async function updateApiKeyLastUsed(id: number) {
  const db = await getDb();
  if (!db) return;
  
  await db.update(apiKeys).set({ lastUsed: new Date() }).where(eq(apiKeys.id, id));
}

// ============ CHARACTER HELPERS ============

export async function createCharacter(data: InsertCharacter) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(characters).values(data);
  return result[0].insertId;
}

export async function getCharactersByUserId(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(characters).where(eq(characters.userId, userId)).orderBy(desc(characters.updatedAt));
}

export async function getCharacterById(id: number, userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(characters)
    .where(and(eq(characters.id, id), eq(characters.userId, userId)))
    .limit(1);
  return result[0];
}

export async function updateCharacter(id: number, userId: number, data: Partial<InsertCharacter>) {
  const db = await getDb();
  if (!db) return;
  
  await db.update(characters).set(data).where(and(eq(characters.id, id), eq(characters.userId, userId)));
}

export async function deleteCharacter(id: number, userId: number) {
  const db = await getDb();
  if (!db) return;
  
  await db.delete(characters).where(and(eq(characters.id, id), eq(characters.userId, userId)));
}

// ============ SCENARIO HELPERS ============

export async function createScenario(data: InsertScenario) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(scenarios).values(data);
  return result[0].insertId;
}

export async function getScenariosByUserId(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(scenarios).where(eq(scenarios.userId, userId)).orderBy(desc(scenarios.updatedAt));
}

export async function getPublicScenarios(searchQuery?: string) {
  const db = await getDb();
  if (!db) return [];
  
  if (searchQuery) {
    return db.select().from(scenarios)
      .where(and(eq(scenarios.isPublic, true), like(scenarios.title, `%${searchQuery}%`)))
      .orderBy(desc(scenarios.createdAt));
  }
  
  return db.select().from(scenarios).where(eq(scenarios.isPublic, true)).orderBy(desc(scenarios.createdAt));
}

export async function getScenarioById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(scenarios).where(eq(scenarios.id, id)).limit(1);
  return result[0];
}

export async function updateScenario(id: number, userId: number, data: Partial<InsertScenario>) {
  const db = await getDb();
  if (!db) return;
  
  await db.update(scenarios).set(data).where(and(eq(scenarios.id, id), eq(scenarios.userId, userId)));
}

export async function deleteScenario(id: number, userId: number) {
  const db = await getDb();
  if (!db) return;
  
  await db.delete(scenarioInteractions).where(eq(scenarioInteractions.scenarioId, id));
  await db.delete(scenarioCharacters).where(eq(scenarioCharacters.scenarioId, id));
  await db.delete(scenarios).where(and(eq(scenarios.id, id), eq(scenarios.userId, userId)));
}

// ============ SCENARIO CHARACTER HELPERS ============

export async function addScenarioCharacter(data: InsertScenarioCharacter) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(scenarioCharacters).values(data);
  return result[0].insertId;
}

export async function getScenarioCharacters(scenarioId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(scenarioCharacters)
    .where(eq(scenarioCharacters.scenarioId, scenarioId))
    .orderBy(scenarioCharacters.orderIndex);
}

export async function deleteScenarioCharacter(id: number) {
  const db = await getDb();
  if (!db) return;
  
  await db.delete(scenarioCharacters).where(eq(scenarioCharacters.id, id));
}

// ============ SCENARIO INTERACTION HELPERS ============

export async function addScenarioInteraction(data: InsertScenarioInteraction) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(scenarioInteractions).values(data);
  return result[0].insertId;
}

export async function getScenarioInteractions(scenarioId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(scenarioInteractions)
    .where(eq(scenarioInteractions.scenarioId, scenarioId))
    .orderBy(scenarioInteractions.orderIndex);
}

export async function updateScenarioInteraction(id: number, data: Partial<InsertScenarioInteraction>) {
  const db = await getDb();
  if (!db) return;
  
  await db.update(scenarioInteractions).set(data).where(eq(scenarioInteractions.id, id));
}

export async function deleteScenarioInteraction(id: number) {
  const db = await getDb();
  if (!db) return;
  
  await db.delete(scenarioInteractions).where(eq(scenarioInteractions.id, id));
}

// ============ CHAT SESSION HELPERS ============

export async function createChatSession(data: InsertChatSession) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(chatSessions).values(data);
  return result[0].insertId;
}

export async function getChatSessionsByUserId(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(chatSessions).where(eq(chatSessions.userId, userId)).orderBy(desc(chatSessions.updatedAt));
}

export async function getChatSessionById(id: number, userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(chatSessions)
    .where(and(eq(chatSessions.id, id), eq(chatSessions.userId, userId)))
    .limit(1);
  return result[0];
}

export async function updateChatSession(id: number, userId: number, data: Partial<InsertChatSession>) {
  const db = await getDb();
  if (!db) return;
  
  await db.update(chatSessions).set(data).where(and(eq(chatSessions.id, id), eq(chatSessions.userId, userId)));
}

export async function deleteChatSession(id: number, userId: number) {
  const db = await getDb();
  if (!db) return;
  
  await db.delete(chatMessages).where(eq(chatMessages.sessionId, id));
  await db.delete(chatSessions).where(and(eq(chatSessions.id, id), eq(chatSessions.userId, userId)));
}

// ============ CHAT MESSAGE HELPERS ============

export async function addChatMessage(data: InsertChatMessage) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(chatMessages).values(data);
  return result[0].insertId;
}

export async function getChatMessages(sessionId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(chatMessages)
    .where(eq(chatMessages.sessionId, sessionId))
    .orderBy(chatMessages.createdAt);
}

export async function deleteChatMessage(id: number) {
  const db = await getDb();
  if (!db) return;
  
  await db.delete(chatMessages).where(eq(chatMessages.id, id));
}

// ============ STORY HELPERS ============

export async function createStory(data: InsertStory) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(stories).values(data);
  return result[0].insertId;
}

export async function getStoriesByUserId(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(stories).where(eq(stories.userId, userId)).orderBy(desc(stories.updatedAt));
}

export async function getStoryById(id: number, userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(stories)
    .where(and(eq(stories.id, id), eq(stories.userId, userId)))
    .limit(1);
  return result[0];
}

export async function updateStory(id: number, userId: number, data: Partial<InsertStory>) {
  const db = await getDb();
  if (!db) return;
  
  await db.update(stories).set(data).where(and(eq(stories.id, id), eq(stories.userId, userId)));
}

export async function deleteStory(id: number, userId: number) {
  const db = await getDb();
  if (!db) return;
  
  await db.delete(storyCharacters).where(eq(storyCharacters.storyId, id));
  await db.delete(stories).where(and(eq(stories.id, id), eq(stories.userId, userId)));
}

// ============ STORY CHARACTER HELPERS ============

export async function addStoryCharacter(data: InsertStoryCharacter) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(storyCharacters).values(data);
  return result[0].insertId;
}

export async function getStoryCharacters(storyId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(storyCharacters)
    .where(eq(storyCharacters.storyId, storyId))
    .orderBy(storyCharacters.orderIndex);
}

export async function updateStoryCharacter(id: number, data: Partial<InsertStoryCharacter>) {
  const db = await getDb();
  if (!db) return;
  
  await db.update(storyCharacters).set(data).where(eq(storyCharacters.id, id));
}

export async function deleteStoryCharacter(id: number) {
  const db = await getDb();
  if (!db) return;
  
  await db.delete(storyCharacters).where(eq(storyCharacters.id, id));
}

// ============ GENERATED IMAGE HELPERS ============

export async function createGeneratedImage(data: InsertGeneratedImage) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(generatedImages).values(data);
  return result[0].insertId;
}

export async function getGeneratedImagesByUserId(userId: number, limit = 50) {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(generatedImages)
    .where(eq(generatedImages.userId, userId))
    .orderBy(desc(generatedImages.createdAt))
    .limit(limit);
}

export async function deleteGeneratedImage(id: number, userId: number) {
  const db = await getDb();
  if (!db) return;
  
  await db.delete(generatedImages).where(and(eq(generatedImages.id, id), eq(generatedImages.userId, userId)));
}

// ============ CHARACTER EMOTIONAL STATE HELPERS ============

export async function getCharacterEmotionalState(characterId: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(characterEmotionalStates)
    .where(eq(characterEmotionalStates.characterId, characterId))
    .limit(1);
  return result[0];
}

export async function upsertCharacterEmotionalState(data: InsertCharacterEmotionalState) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Check if exists
  const existing = await getCharacterEmotionalState(data.characterId);
  
  if (existing) {
    await db.update(characterEmotionalStates)
      .set({ ...data, lastUpdated: new Date() })
      .where(eq(characterEmotionalStates.characterId, data.characterId));
    return existing.id;
  } else {
    const result = await db.insert(characterEmotionalStates).values(data);
    return result[0].insertId;
  }
}

// ============ CHARACTER MOTIVATION HELPERS ============

export async function createCharacterMotivation(data: InsertCharacterMotivation) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(characterMotivations).values(data);
  return result[0].insertId;
}

export async function getCharacterMotivations(characterId: number, activeOnly = false) {
  const db = await getDb();
  if (!db) return [];
  
  if (activeOnly) {
    return db.select().from(characterMotivations)
      .where(and(eq(characterMotivations.characterId, characterId), eq(characterMotivations.isActive, true)))
      .orderBy(desc(characterMotivations.priority));
  }
  
  return db.select().from(characterMotivations)
    .where(eq(characterMotivations.characterId, characterId))
    .orderBy(desc(characterMotivations.priority));
}

export async function updateCharacterMotivation(id: number, data: Partial<InsertCharacterMotivation>) {
  const db = await getDb();
  if (!db) return;
  
  await db.update(characterMotivations).set(data).where(eq(characterMotivations.id, id));
}

export async function deleteCharacterMotivation(id: number) {
  const db = await getDb();
  if (!db) return;
  
  await db.delete(characterMotivations).where(eq(characterMotivations.id, id));
}

// ============ RELATIONSHIP HELPERS ============

export async function createRelationship(data: InsertRelationship) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(relationships).values(data);
  return result[0].insertId;
}

export async function getCharacterRelationships(characterId: number) {
  const db = await getDb();
  if (!db) return [];
  
  // Get relationships where character is either party
  const results = await db.select().from(relationships)
    .where(
      or(
        eq(relationships.characterId1, characterId),
        eq(relationships.characterId2, characterId)
      )
    );
  
  return results;
}

export async function getRelationshipBetween(characterId1: number, characterId2: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(relationships)
    .where(
      and(
        eq(relationships.characterId1, characterId1),
        eq(relationships.characterId2, characterId2)
      )
    )
    .limit(1);
  
  if (result[0]) return result[0];
  
  // Check reverse direction
  const result2 = await db.select().from(relationships)
    .where(
      and(
        eq(relationships.characterId1, characterId2),
        eq(relationships.characterId2, characterId1)
      )
    )
    .limit(1);
  
  return result2[0];
}

export async function updateRelationship(id: number, data: Partial<InsertRelationship>) {
  const db = await getDb();
  if (!db) return;
  
  await db.update(relationships).set(data).where(eq(relationships.id, id));
}

export async function deleteRelationship(id: number) {
  const db = await getDb();
  if (!db) return;
  
  await db.delete(relationshipEvents).where(eq(relationshipEvents.relationshipId, id));
  await db.delete(relationships).where(eq(relationships.id, id));
}

// ============ RELATIONSHIP EVENT HELPERS ============

export async function addRelationshipEvent(data: InsertRelationshipEvent) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(relationshipEvents).values(data);
  return result[0].insertId;
}

export async function getRelationshipEvents(relationshipId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(relationshipEvents)
    .where(eq(relationshipEvents.relationshipId, relationshipId))
    .orderBy(desc(relationshipEvents.eventDate));
}

// ============ GROUP HELPERS ============

export async function createGroup(data: InsertGroup) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(groups).values(data);
  return result[0].insertId;
}

export async function getGroupsByUserId(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(groups).where(eq(groups.userId, userId)).orderBy(desc(groups.updatedAt));
}

export async function getGroupById(id: number, userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(groups)
    .where(and(eq(groups.id, id), eq(groups.userId, userId)))
    .limit(1);
  return result[0];
}

export async function updateGroup(id: number, userId: number, data: Partial<InsertGroup>) {
  const db = await getDb();
  if (!db) return;
  
  await db.update(groups).set(data).where(and(eq(groups.id, id), eq(groups.userId, userId)));
}

export async function deleteGroup(id: number, userId: number) {
  const db = await getDb();
  if (!db) return;
  
  await db.delete(groupMemberships).where(eq(groupMemberships.groupId, id));
  await db.delete(groups).where(and(eq(groups.id, id), eq(groups.userId, userId)));
}

// ============ GROUP MEMBERSHIP HELPERS ============

export async function addGroupMembership(data: InsertGroupMembership) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(groupMemberships).values(data);
  return result[0].insertId;
}

export async function getGroupMembers(groupId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(groupMemberships)
    .where(eq(groupMemberships.groupId, groupId))
    .orderBy(desc(groupMemberships.influence));
}

export async function getCharacterGroups(characterId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(groupMemberships)
    .where(eq(groupMemberships.characterId, characterId));
}

export async function updateGroupMembership(id: number, data: Partial<InsertGroupMembership>) {
  const db = await getDb();
  if (!db) return;
  
  await db.update(groupMemberships).set(data).where(eq(groupMemberships.id, id));
}

export async function deleteGroupMembership(id: number) {
  const db = await getDb();
  if (!db) return;
  
  await db.delete(groupMemberships).where(eq(groupMemberships.id, id));
}

// ============ WORLD HELPERS ============

export async function createWorld(data: InsertWorld) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(worlds).values(data);
  return result[0].insertId;
}

export async function getWorldsByUserId(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(worlds).where(eq(worlds.userId, userId)).orderBy(desc(worlds.updatedAt));
}

export async function getWorldById(id: number, userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(worlds)
    .where(and(eq(worlds.id, id), eq(worlds.userId, userId)))
    .limit(1);
  return result[0];
}

export async function updateWorld(id: number, userId: number, data: Partial<InsertWorld>) {
  const db = await getDb();
  if (!db) return;
  
  await db.update(worlds).set(data).where(and(eq(worlds.id, id), eq(worlds.userId, userId)));
}

export async function deleteWorld(id: number, userId: number) {
  const db = await getDb();
  if (!db) return;
  
  // Delete related data
  await db.delete(scheduledEvents).where(eq(scheduledEvents.worldId, id));
  await db.delete(worldEvents).where(eq(worldEvents.worldId, id));
  await db.delete(loreEntries).where(eq(loreEntries.worldId, id));
  
  // Delete all locations in a single query
  await db.delete(locations).where(eq(locations.worldId, id));
  
  await db.delete(worlds).where(and(eq(worlds.id, id), eq(worlds.userId, userId)));
}

// ============ LOCATION HELPERS ============

export async function createLocation(data: InsertLocation) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(locations).values(data);
  return result[0].insertId;
}

export async function getLocationsByWorldId(worldId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(locations)
    .where(eq(locations.worldId, worldId))
    .orderBy(locations.name);
}

export async function getLocationById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(locations).where(eq(locations.id, id)).limit(1);
  return result[0];
}

export async function updateLocation(id: number, data: Partial<InsertLocation>) {
  const db = await getDb();
  if (!db) return;
  
  await db.update(locations).set(data).where(eq(locations.id, id));
}

export async function deleteLocation(id: number) {
  const db = await getDb();
  if (!db) return;
  
  await db.delete(locations).where(eq(locations.id, id));
}

// ============ LORE ENTRY HELPERS ============

export async function createLoreEntry(data: InsertLoreEntry) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(loreEntries).values(data);
  return result[0].insertId;
}

export async function getLoreEntriesByWorldId(worldId: number, category?: LoreCategory) {
  const db = await getDb();
  if (!db) return [];
  
  if (category) {
    return db.select().from(loreEntries)
      .where(and(eq(loreEntries.worldId, worldId), eq(loreEntries.category, category)))
      .orderBy(desc(loreEntries.updatedAt));
  }
  
  return db.select().from(loreEntries)
    .where(eq(loreEntries.worldId, worldId))
    .orderBy(desc(loreEntries.updatedAt));
}

export async function getLoreEntryById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(loreEntries).where(eq(loreEntries.id, id)).limit(1);
  return result[0];
}

export async function updateLoreEntry(id: number, data: Partial<InsertLoreEntry>) {
  const db = await getDb();
  if (!db) return;
  
  await db.update(loreEntries).set(data).where(eq(loreEntries.id, id));
}

export async function deleteLoreEntry(id: number) {
  const db = await getDb();
  if (!db) return;
  
  await db.delete(loreEntries).where(eq(loreEntries.id, id));
}

// ============ WORLD EVENT HELPERS ============

export async function createWorldEvent(data: InsertWorldEvent) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(worldEvents).values(data);
  return result[0].insertId;
}

export async function getWorldEventsByWorldId(worldId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(worldEvents)
    .where(eq(worldEvents.worldId, worldId))
    .orderBy(desc(worldEvents.importance), desc(worldEvents.updatedAt));
}

export async function getWorldEventById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(worldEvents).where(eq(worldEvents.id, id)).limit(1);
  return result[0];
}

export async function updateWorldEvent(id: number, data: Partial<InsertWorldEvent>) {
  const db = await getDb();
  if (!db) return;
  
  await db.update(worldEvents).set(data).where(eq(worldEvents.id, id));
}

export async function deleteWorldEvent(id: number) {
  const db = await getDb();
  if (!db) return;
  
  await db.delete(worldEvents).where(eq(worldEvents.id, id));
}

// ============ CHARACTER MEMORY HELPERS ============

export async function addCharacterMemory(data: InsertCharacterMemory) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(characterMemories).values(data);
  return result[0].insertId;
}

export async function getCharacterMemories(characterId: number, limit = 50) {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(characterMemories)
    .where(and(eq(characterMemories.characterId, characterId), eq(characterMemories.isRepressed, false)))
    .orderBy(desc(characterMemories.importance), desc(characterMemories.memoryDate))
    .limit(limit);
}

export async function updateCharacterMemory(id: number, data: Partial<InsertCharacterMemory>) {
  const db = await getDb();
  if (!db) return;
  
  await db.update(characterMemories).set(data).where(eq(characterMemories.id, id));
}

export async function deleteCharacterMemory(id: number) {
  const db = await getDb();
  if (!db) return;
  
  await db.delete(characterMemories).where(eq(characterMemories.id, id));
}

// ============ SCHEDULED EVENT HELPERS ============

export async function createScheduledEvent(data: InsertScheduledEvent) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(scheduledEvents).values(data);
  return result[0].insertId;
}

export async function getScheduledEventsByWorldId(worldId: number, statusFilter?: ScheduledEventStatus) {
  const db = await getDb();
  if (!db) return [];
  
  if (statusFilter) {
    return db.select().from(scheduledEvents)
      .where(and(eq(scheduledEvents.worldId, worldId), eq(scheduledEvents.status, statusFilter)))
      .orderBy(scheduledEvents.scheduledFor);
  }
  
  return db.select().from(scheduledEvents)
    .where(eq(scheduledEvents.worldId, worldId))
    .orderBy(scheduledEvents.scheduledFor);
}

export async function getPendingScheduledEvents(worldId: number) {
  const db = await getDb();
  if (!db) return [];
  
  const now = new Date();
  return db.select().from(scheduledEvents)
    .where(
      and(
        eq(scheduledEvents.worldId, worldId),
        eq(scheduledEvents.status, "pending")
      )
    )
    .orderBy(scheduledEvents.priority, scheduledEvents.scheduledFor);
}

export async function updateScheduledEvent(id: number, data: Partial<InsertScheduledEvent>) {
  const db = await getDb();
  if (!db) return;
  
  await db.update(scheduledEvents).set(data).where(eq(scheduledEvents.id, id));
}

export async function deleteScheduledEvent(id: number) {
  const db = await getDb();
  if (!db) return;
  
  await db.delete(scheduledEvents).where(eq(scheduledEvents.id, id));
}
