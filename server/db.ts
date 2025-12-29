import { eq, and, like, desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { 
  InsertUser, users, 
  apiKeys, InsertApiKey,
  characters, InsertCharacter,
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
