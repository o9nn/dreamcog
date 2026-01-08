import { COOKIE_NAME } from "@shared/const";
import { z } from "zod";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import * as db from "./db";
import { 
  encryptApiKey, 
  getDecryptedApiKey, 
  chatCompletion, 
  textCompletion,
  buildStoryPrompt,
  buildRolePlayPrompt,
  AVAILABLE_MODELS,
  DEFAULT_SAMPLING_PARAMS,
  type SamplingParams,
  type ChatMessage,
  type RoleConfig,
} from "./dreamgen";

// Sampling params schema
const samplingParamsSchema = z.object({
  temperature: z.number().min(0).max(2).optional(),
  topP: z.number().min(0).max(1).optional(),
  topK: z.number().min(1).max(100).optional(),
  minP: z.number().min(0).max(1).optional(),
  maxTokens: z.number().min(1).max(4096).optional(),
  presencePenalty: z.number().min(-2).max(2).optional(),
  frequencyPenalty: z.number().min(-2).max(2).optional(),
  repetitionPenalty: z.number().min(0.1).max(2).optional(),
  stopSequences: z.array(z.string()).optional(),
});

export const appRouter = router({
  system: systemRouter,
  
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  // API Key Management
  apiKeys: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return db.getApiKeysByUserId(ctx.user.id);
    }),
    
    create: protectedProcedure
      .input(z.object({
        keyName: z.string().min(1).max(100),
        apiKey: z.string().min(10),
      }))
      .mutation(async ({ ctx, input }) => {
        const encryptedKey = encryptApiKey(input.apiKey);
        const id = await db.createApiKey({
          userId: ctx.user.id,
          keyName: input.keyName,
          encryptedKey,
        });
        return { id };
      }),
    
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await db.deleteApiKey(input.id, ctx.user.id);
        return { success: true };
      }),
    
    verify: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const apiKey = await getDecryptedApiKey(input.id, ctx.user.id);
        if (!apiKey) {
          return { valid: false, error: "API key not found" };
        }
        
        try {
          const response = await fetch("https://dreamgen.com/api/openai/v1/models", {
            headers: { Authorization: `Bearer ${apiKey}` },
          });
          return { valid: response.ok };
        } catch {
          return { valid: false, error: "Failed to verify" };
        }
      }),
  }),

  // Character Management
  characters: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return db.getCharactersByUserId(ctx.user.id);
    }),
    
    get: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ ctx, input }) => {
        return db.getCharacterById(input.id, ctx.user.id);
      }),
    
    create: protectedProcedure
      .input(z.object({
        name: z.string().min(1).max(200),
        label: z.string().min(1).max(100).regex(/^[a-z0-9_]+$/),
        promptDescription: z.string().optional(),
        displayDescription: z.string().optional(),
        imageUrl: z.string().optional(),
        isUserCharacter: z.boolean().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const id = await db.createCharacter({
          userId: ctx.user.id,
          ...input,
        });
        return { id };
      }),
    
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().min(1).max(200).optional(),
        label: z.string().min(1).max(100).regex(/^[a-z0-9_]+$/).optional(),
        promptDescription: z.string().optional(),
        displayDescription: z.string().optional(),
        imageUrl: z.string().optional(),
        isUserCharacter: z.boolean().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { id, ...data } = input;
        await db.updateCharacter(id, ctx.user.id, data);
        return { success: true };
      }),
    
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await db.deleteCharacter(input.id, ctx.user.id);
        return { success: true };
      }),
  }),

  // Scenario Management
  scenarios: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return db.getScenariosByUserId(ctx.user.id);
    }),
    
    listPublic: publicProcedure
      .input(z.object({ search: z.string().optional() }).optional())
      .query(async ({ input }) => {
        return db.getPublicScenarios(input?.search);
      }),
    
    get: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const scenario = await db.getScenarioById(input.id);
        if (!scenario) return null;
        
        const characters = await db.getScenarioCharacters(input.id);
        const interactions = await db.getScenarioInteractions(input.id);
        
        return { ...scenario, characters, interactions };
      }),
    
    create: protectedProcedure
      .input(z.object({
        title: z.string().min(1).max(300),
        promptDescription: z.string().optional(),
        displayDescription: z.string().optional(),
        imageUrl: z.string().optional(),
        isPublic: z.boolean().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const id = await db.createScenario({
          userId: ctx.user.id,
          ...input,
        });
        return { id };
      }),
    
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        title: z.string().min(1).max(300).optional(),
        promptDescription: z.string().optional(),
        displayDescription: z.string().optional(),
        imageUrl: z.string().optional(),
        isPublic: z.boolean().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { id, ...data } = input;
        await db.updateScenario(id, ctx.user.id, data);
        return { success: true };
      }),
    
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await db.deleteScenario(input.id, ctx.user.id);
        return { success: true };
      }),
    
    copy: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const scenario = await db.getScenarioById(input.id);
        if (!scenario) throw new Error("Scenario not found");
        
        const newId = await db.createScenario({
          userId: ctx.user.id,
          title: `${scenario.title} (Copy)`,
          promptDescription: scenario.promptDescription,
          displayDescription: scenario.displayDescription,
          imageUrl: scenario.imageUrl,
          isPublic: false,
        });
        
        const characters = await db.getScenarioCharacters(input.id);
        for (const char of characters) {
          await db.addScenarioCharacter({
            scenarioId: newId,
            name: char.name,
            label: char.label,
            promptDescription: char.promptDescription,
            isUserCharacter: char.isUserCharacter,
            orderIndex: char.orderIndex,
          });
        }
        
        const interactions = await db.getScenarioInteractions(input.id);
        for (const interaction of interactions) {
          await db.addScenarioInteraction({
            scenarioId: newId,
            interactionType: interaction.interactionType,
            characterLabel: interaction.characterLabel,
            content: interaction.content,
            isSticky: interaction.isSticky,
            orderIndex: interaction.orderIndex,
          });
        }
        
        return { id: newId };
      }),
    
    // Scenario Characters
    addCharacter: protectedProcedure
      .input(z.object({
        scenarioId: z.number(),
        name: z.string().min(1).max(200),
        label: z.string().min(1).max(100).regex(/^[a-z0-9_]+$/),
        promptDescription: z.string().optional(),
        isUserCharacter: z.boolean().optional(),
        orderIndex: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        const id = await db.addScenarioCharacter(input);
        return { id };
      }),
    
    removeCharacter: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteScenarioCharacter(input.id);
        return { success: true };
      }),
    
    // Scenario Interactions
    addInteraction: protectedProcedure
      .input(z.object({
        scenarioId: z.number(),
        interactionType: z.enum(["message", "text", "instruction"]),
        characterLabel: z.string().optional(),
        content: z.string().min(1),
        isSticky: z.boolean().optional(),
        orderIndex: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        const id = await db.addScenarioInteraction(input);
        return { id };
      }),
    
    updateInteraction: protectedProcedure
      .input(z.object({
        id: z.number(),
        content: z.string().optional(),
        isSticky: z.boolean().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await db.updateScenarioInteraction(id, data);
        return { success: true };
      }),
    
    removeInteraction: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteScenarioInteraction(input.id);
        return { success: true };
      }),
  }),

  // Chat Sessions
  chat: router({
    listSessions: protectedProcedure.query(async ({ ctx }) => {
      return db.getChatSessionsByUserId(ctx.user.id);
    }),
    
    getSession: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ ctx, input }) => {
        const session = await db.getChatSessionById(input.id, ctx.user.id);
        if (!session) return null;
        
        const messages = await db.getChatMessages(input.id);
        return { ...session, messages };
      }),
    
    createSession: protectedProcedure
      .input(z.object({
        title: z.string().min(1).max(300),
        scenarioId: z.number().optional(),
        systemPrompt: z.string().optional(),
        modelId: z.string().optional(),
        samplingParams: samplingParamsSchema.optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const id = await db.createChatSession({
          userId: ctx.user.id,
          title: input.title,
          scenarioId: input.scenarioId ?? null,
          systemPrompt: input.systemPrompt ?? null,
          modelId: input.modelId ?? "lucid-v1-medium",
          samplingParams: input.samplingParams ?? DEFAULT_SAMPLING_PARAMS,
        });
        return { id };
      }),
    
    updateSession: protectedProcedure
      .input(z.object({
        id: z.number(),
        title: z.string().optional(),
        systemPrompt: z.string().optional(),
        modelId: z.string().optional(),
        samplingParams: samplingParamsSchema.optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { id, ...data } = input;
        await db.updateChatSession(id, ctx.user.id, data);
        return { success: true };
      }),
    
    deleteSession: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await db.deleteChatSession(input.id, ctx.user.id);
        return { success: true };
      }),
    
    addMessage: protectedProcedure
      .input(z.object({
        sessionId: z.number(),
        messageType: z.enum(["message", "text", "instruction", "user", "system"]),
        characterLabel: z.string().optional(),
        characterName: z.string().optional(),
        content: z.string().min(1),
        isSticky: z.boolean().optional(),
      }))
      .mutation(async ({ input }) => {
        const id = await db.addChatMessage(input);
        return { id };
      }),
    
    deleteMessage: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteChatMessage(input.id);
        return { success: true };
      }),
  }),

  // Story Management
  stories: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return db.getStoriesByUserId(ctx.user.id);
    }),
    
    get: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ ctx, input }) => {
        const story = await db.getStoryById(input.id, ctx.user.id);
        if (!story) return null;
        
        const characters = await db.getStoryCharacters(input.id);
        return { ...story, characters };
      }),
    
    create: protectedProcedure
      .input(z.object({
        title: z.string().min(1).max(300),
        plotDescription: z.string().optional(),
        styleDescription: z.string().optional(),
        modelId: z.string().optional(),
        samplingParams: samplingParamsSchema.optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const id = await db.createStory({
          userId: ctx.user.id,
          title: input.title,
          plotDescription: input.plotDescription ?? null,
          styleDescription: input.styleDescription ?? null,
          modelId: input.modelId ?? "lucid-v1-medium",
          samplingParams: input.samplingParams ?? DEFAULT_SAMPLING_PARAMS,
        });
        return { id };
      }),
    
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        title: z.string().optional(),
        plotDescription: z.string().optional(),
        styleDescription: z.string().optional(),
        content: z.string().optional(),
        modelId: z.string().optional(),
        samplingParams: samplingParamsSchema.optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { id, ...data } = input;
        await db.updateStory(id, ctx.user.id, data);
        return { success: true };
      }),
    
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await db.deleteStory(input.id, ctx.user.id);
        return { success: true };
      }),
    
    addCharacter: protectedProcedure
      .input(z.object({
        storyId: z.number(),
        name: z.string().min(1).max(200),
        description: z.string().optional(),
        orderIndex: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        const id = await db.addStoryCharacter(input);
        return { id };
      }),
    
    updateCharacter: protectedProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().optional(),
        description: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await db.updateStoryCharacter(id, data);
        return { success: true };
      }),
    
    removeCharacter: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteStoryCharacter(input.id);
        return { success: true };
      }),
  }),

  // Image Generation
  images: router({
    list: protectedProcedure
      .input(z.object({ limit: z.number().optional() }).optional())
      .query(async ({ ctx, input }) => {
        return db.getGeneratedImagesByUserId(ctx.user.id, input?.limit ?? 50);
      }),
    
    save: protectedProcedure
      .input(z.object({
        includePrompt: z.string().min(1),
        excludePrompt: z.string().optional(),
        cfgScale: z.number().optional(),
        fidelity: z.number().optional(),
        aspectRatio: z.string().optional(),
        style: z.string().optional(),
        seed: z.number().optional(),
        imageUrl: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const id = await db.createGeneratedImage({
          userId: ctx.user.id,
          ...input,
        });
        return { id };
      }),
    
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await db.deleteGeneratedImage(input.id, ctx.user.id);
        return { success: true };
      }),
  }),

  // Generation endpoints
  generate: router({
    models: publicProcedure.query(() => AVAILABLE_MODELS),

    defaultParams: publicProcedure.query(() => DEFAULT_SAMPLING_PARAMS),
  }),

  // ============ ADVANCED CHARACTER FEATURES ============

  // Character Emotional States
  characterEmotions: router({
    get: protectedProcedure
      .input(z.object({ characterId: z.number() }))
      .query(async ({ ctx, input }) => {
        // Verify character ownership
        const character = await db.getCharacterById(input.characterId, ctx.user.id);
        if (!character) return null;
        return db.getCharacterEmotionalState(input.characterId);
      }),

    upsert: protectedProcedure
      .input(z.object({
        characterId: z.number(),
        happiness: z.number().min(0).max(100).optional(),
        sadness: z.number().min(0).max(100).optional(),
        anger: z.number().min(0).max(100).optional(),
        fear: z.number().min(0).max(100).optional(),
        surprise: z.number().min(0).max(100).optional(),
        disgust: z.number().min(0).max(100).optional(),
        needSafety: z.number().min(0).max(100).optional(),
        needBelonging: z.number().min(0).max(100).optional(),
        needEsteem: z.number().min(0).max(100).optional(),
        needAutonomy: z.number().min(0).max(100).optional(),
        needCompetence: z.number().min(0).max(100).optional(),
        overallMood: z.number().min(0).max(100).optional(),
        stressLevel: z.number().min(0).max(100).optional(),
        energyLevel: z.number().min(0).max(100).optional(),
        contextNotes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const character = await db.getCharacterById(input.characterId, ctx.user.id);
        if (!character) throw new Error("Character not found");

        const id = await db.upsertCharacterEmotionalState(input);
        return { id };
      }),
  }),

  // Character Motivations
  characterMotivations: router({
    list: protectedProcedure
      .input(z.object({
        characterId: z.number(),
        activeOnly: z.boolean().optional(),
      }))
      .query(async ({ ctx, input }) => {
        const character = await db.getCharacterById(input.characterId, ctx.user.id);
        if (!character) return [];
        return db.getCharacterMotivations(input.characterId, input.activeOnly ?? false);
      }),

    create: protectedProcedure
      .input(z.object({
        characterId: z.number(),
        motivationType: z.enum(["short_term", "long_term", "core_value"]),
        description: z.string().min(1),
        priority: z.number().min(1).max(10).optional(),
        isActive: z.boolean().optional(),
        progress: z.number().min(0).max(100).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const character = await db.getCharacterById(input.characterId, ctx.user.id);
        if (!character) throw new Error("Character not found");

        const id = await db.createCharacterMotivation(input);
        return { id };
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        characterId: z.number(), // For ownership verification
        description: z.string().optional(),
        priority: z.number().min(1).max(10).optional(),
        isActive: z.boolean().optional(),
        progress: z.number().min(0).max(100).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const character = await db.getCharacterById(input.characterId, ctx.user.id);
        if (!character) throw new Error("Character not found");

        const { id, characterId, ...data } = input;
        await db.updateCharacterMotivation(id, data);
        return { success: true };
      }),

    delete: protectedProcedure
      .input(z.object({
        id: z.number(),
        characterId: z.number(),
      }))
      .mutation(async ({ ctx, input }) => {
        const character = await db.getCharacterById(input.characterId, ctx.user.id);
        if (!character) throw new Error("Character not found");

        await db.deleteCharacterMotivation(input.id);
        return { success: true };
      }),
  }),

  // Character Memories
  characterMemories: router({
    list: protectedProcedure
      .input(z.object({
        characterId: z.number(),
        limit: z.number().max(100).optional(),
      }))
      .query(async ({ ctx, input }) => {
        const character = await db.getCharacterById(input.characterId, ctx.user.id);
        if (!character) return [];
        return db.getCharacterMemories(input.characterId, input.limit ?? 50);
      }),

    create: protectedProcedure
      .input(z.object({
        characterId: z.number(),
        memoryType: z.enum(["event", "interaction", "knowledge", "emotion", "skill", "trauma", "achievement"]),
        content: z.string().min(1),
        emotionalImpact: z.number().min(-100).max(100).optional(),
        importance: z.number().min(1).max(10).optional(),
        worldEventId: z.number().optional(),
        relatedCharacterId: z.number().optional(),
        locationId: z.number().optional(),
        isRepressed: z.boolean().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const character = await db.getCharacterById(input.characterId, ctx.user.id);
        if (!character) throw new Error("Character not found");

        const id = await db.addCharacterMemory(input);
        return { id };
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        characterId: z.number(),
        content: z.string().optional(),
        emotionalImpact: z.number().min(-100).max(100).optional(),
        importance: z.number().min(1).max(10).optional(),
        isRepressed: z.boolean().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const character = await db.getCharacterById(input.characterId, ctx.user.id);
        if (!character) throw new Error("Character not found");

        const { id, characterId, ...data } = input;
        await db.updateCharacterMemory(id, data);
        return { success: true };
      }),

    delete: protectedProcedure
      .input(z.object({
        id: z.number(),
        characterId: z.number(),
      }))
      .mutation(async ({ ctx, input }) => {
        const character = await db.getCharacterById(input.characterId, ctx.user.id);
        if (!character) throw new Error("Character not found");

        await db.deleteCharacterMemory(input.id);
        return { success: true };
      }),
  }),

  // ============ RELATIONSHIPS ============

  relationships: router({
    list: protectedProcedure
      .input(z.object({ characterId: z.number() }))
      .query(async ({ ctx, input }) => {
        const character = await db.getCharacterById(input.characterId, ctx.user.id);
        if (!character) return [];
        return db.getCharacterRelationships(input.characterId);
      }),

    getBetween: protectedProcedure
      .input(z.object({
        characterId1: z.number(),
        characterId2: z.number(),
      }))
      .query(async ({ ctx, input }) => {
        // Verify at least one character belongs to user
        const char1 = await db.getCharacterById(input.characterId1, ctx.user.id);
        const char2 = await db.getCharacterById(input.characterId2, ctx.user.id);
        if (!char1 && !char2) return null;

        return db.getRelationshipBetween(input.characterId1, input.characterId2);
      }),

    create: protectedProcedure
      .input(z.object({
        characterId1: z.number(),
        characterId2: z.number(),
        relationshipType: z.enum(["friend", "enemy", "rival", "family", "romantic", "mentor", "ally", "neutral", "complex"]),
        trust: z.number().min(0).max(100).optional(),
        affection: z.number().min(0).max(100).optional(),
        respect: z.number().min(0).max(100).optional(),
        loyalty: z.number().min(0).max(100).optional(),
        dependency: z.number().min(0).max(100).optional(),
        tension: z.number().min(0).max(100).optional(),
        description: z.string().optional(),
        isDynamic: z.boolean().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        // Verify at least one character belongs to user
        const char1 = await db.getCharacterById(input.characterId1, ctx.user.id);
        const char2 = await db.getCharacterById(input.characterId2, ctx.user.id);
        if (!char1 && !char2) throw new Error("At least one character must belong to you");

        const id = await db.createRelationship(input);
        return { id };
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        relationshipType: z.enum(["friend", "enemy", "rival", "family", "romantic", "mentor", "ally", "neutral", "complex"]).optional(),
        trust: z.number().min(0).max(100).optional(),
        affection: z.number().min(0).max(100).optional(),
        respect: z.number().min(0).max(100).optional(),
        loyalty: z.number().min(0).max(100).optional(),
        dependency: z.number().min(0).max(100).optional(),
        tension: z.number().min(0).max(100).optional(),
        description: z.string().optional(),
        isDynamic: z.boolean().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await db.updateRelationship(id, data);
        return { success: true };
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteRelationship(input.id);
        return { success: true };
      }),

    // Relationship Events
    addEvent: protectedProcedure
      .input(z.object({
        relationshipId: z.number(),
        eventType: z.enum(["first_meeting", "conflict", "bonding", "betrayal", "reconciliation", "milestone", "other"]),
        description: z.string().min(1),
        impactOnTrust: z.number().min(-100).max(100).optional(),
        impactOnAffection: z.number().min(-100).max(100).optional(),
        impactOnRespect: z.number().min(-100).max(100).optional(),
        worldEventId: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        const id = await db.addRelationshipEvent(input);
        return { id };
      }),

    getEvents: protectedProcedure
      .input(z.object({ relationshipId: z.number() }))
      .query(async ({ input }) => {
        return db.getRelationshipEvents(input.relationshipId);
      }),
  }),

  // ============ GROUPS ============

  groups: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return db.getGroupsByUserId(ctx.user.id);
    }),

    get: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ ctx, input }) => {
        const group = await db.getGroupById(input.id, ctx.user.id);
        if (!group) return null;

        const members = await db.getGroupMembers(input.id);
        return { ...group, members };
      }),

    create: protectedProcedure
      .input(z.object({
        name: z.string().min(1).max(200),
        groupType: z.enum(["family", "organization", "faction", "community", "team", "guild", "clan", "other"]),
        description: z.string().optional(),
        purpose: z.string().optional(),
        hierarchy: z.object({
          type: z.enum(["flat", "hierarchical", "council"]).optional(),
          positions: z.array(z.string()).optional(),
        }).optional(),
        influence: z.number().min(0).max(100).optional(),
        worldId: z.number().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const id = await db.createGroup({
          userId: ctx.user.id,
          ...input,
        });
        return { id };
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().min(1).max(200).optional(),
        groupType: z.enum(["family", "organization", "faction", "community", "team", "guild", "clan", "other"]).optional(),
        description: z.string().optional(),
        purpose: z.string().optional(),
        hierarchy: z.object({
          type: z.enum(["flat", "hierarchical", "council"]).optional(),
          positions: z.array(z.string()).optional(),
        }).optional(),
        influence: z.number().min(0).max(100).optional(),
        worldId: z.number().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { id, ...data } = input;
        await db.updateGroup(id, ctx.user.id, data);
        return { success: true };
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await db.deleteGroup(input.id, ctx.user.id);
        return { success: true };
      }),

    // Group Memberships
    addMember: protectedProcedure
      .input(z.object({
        groupId: z.number(),
        characterId: z.number(),
        role: z.string().max(100).optional(),
        position: z.string().max(100).optional(),
        status: z.enum(["active", "inactive", "former"]).optional(),
        influence: z.number().min(0).max(100).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        // Verify group ownership
        const group = await db.getGroupById(input.groupId, ctx.user.id);
        if (!group) throw new Error("Group not found");

        const id = await db.addGroupMembership(input);
        return { id };
      }),

    updateMember: protectedProcedure
      .input(z.object({
        id: z.number(),
        groupId: z.number(), // For ownership verification
        role: z.string().max(100).optional(),
        position: z.string().max(100).optional(),
        status: z.enum(["active", "inactive", "former"]).optional(),
        influence: z.number().min(0).max(100).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const group = await db.getGroupById(input.groupId, ctx.user.id);
        if (!group) throw new Error("Group not found");

        const { id, groupId, ...data } = input;
        await db.updateGroupMembership(id, data);
        return { success: true };
      }),

    removeMember: protectedProcedure
      .input(z.object({
        id: z.number(),
        groupId: z.number(),
      }))
      .mutation(async ({ ctx, input }) => {
        const group = await db.getGroupById(input.groupId, ctx.user.id);
        if (!group) throw new Error("Group not found");

        await db.deleteGroupMembership(input.id);
        return { success: true };
      }),

    getCharacterGroups: protectedProcedure
      .input(z.object({ characterId: z.number() }))
      .query(async ({ ctx, input }) => {
        const character = await db.getCharacterById(input.characterId, ctx.user.id);
        if (!character) return [];
        return db.getCharacterGroups(input.characterId);
      }),
  }),

  // ============ WORLDS ============

  worlds: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return db.getWorldsByUserId(ctx.user.id);
    }),

    get: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ ctx, input }) => {
        const world = await db.getWorldById(input.id, ctx.user.id);
        if (!world) return null;

        const [locations, loreEntries, events] = await Promise.all([
          db.getLocationsByWorldId(input.id),
          db.getLoreEntriesByWorldId(input.id),
          db.getWorldEventsByWorldId(input.id),
        ]);

        return { ...world, locations, loreEntries, events };
      }),

    create: protectedProcedure
      .input(z.object({
        name: z.string().min(1).max(200),
        description: z.string().optional(),
        genre: z.string().max(100).optional(),
        timeperiod: z.string().max(100).optional(),
        technologyLevel: z.string().max(100).optional(),
        magicSystem: z.string().optional(),
        culturalNotes: z.string().optional(),
        rules: z.object({
          physicsRules: z.array(z.string()).optional(),
          socialRules: z.array(z.string()).optional(),
          magicRules: z.array(z.string()).optional(),
        }).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const id = await db.createWorld({
          userId: ctx.user.id,
          ...input,
        });
        return { id };
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().min(1).max(200).optional(),
        description: z.string().optional(),
        genre: z.string().max(100).optional(),
        timeperiod: z.string().max(100).optional(),
        technologyLevel: z.string().max(100).optional(),
        magicSystem: z.string().optional(),
        culturalNotes: z.string().optional(),
        rules: z.object({
          physicsRules: z.array(z.string()).optional(),
          socialRules: z.array(z.string()).optional(),
          magicRules: z.array(z.string()).optional(),
        }).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { id, ...data } = input;
        await db.updateWorld(id, ctx.user.id, data);
        return { success: true };
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await db.deleteWorld(input.id, ctx.user.id);
        return { success: true };
      }),
  }),

  // ============ LOCATIONS ============

  locations: router({
    list: protectedProcedure
      .input(z.object({ worldId: z.number() }))
      .query(async ({ ctx, input }) => {
        const world = await db.getWorldById(input.worldId, ctx.user.id);
        if (!world) return [];
        return db.getLocationsByWorldId(input.worldId);
      }),

    get: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return db.getLocationById(input.id);
      }),

    create: protectedProcedure
      .input(z.object({
        worldId: z.number(),
        name: z.string().min(1).max(200),
        locationType: z.enum(["city", "building", "wilderness", "dungeon", "realm", "dimension", "other"]),
        description: z.string().optional(),
        parentLocationId: z.number().optional(),
        attributes: z.object({
          climate: z.string().optional(),
          population: z.string().optional(),
          danger: z.number().min(0).max(100).optional(),
          resources: z.array(z.string()).optional(),
          notableFeatures: z.array(z.string()).optional(),
        }).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const world = await db.getWorldById(input.worldId, ctx.user.id);
        if (!world) throw new Error("World not found");

        const id = await db.createLocation(input);
        return { id };
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        worldId: z.number(), // For ownership verification
        name: z.string().min(1).max(200).optional(),
        locationType: z.enum(["city", "building", "wilderness", "dungeon", "realm", "dimension", "other"]).optional(),
        description: z.string().optional(),
        parentLocationId: z.number().optional(),
        attributes: z.object({
          climate: z.string().optional(),
          population: z.string().optional(),
          danger: z.number().min(0).max(100).optional(),
          resources: z.array(z.string()).optional(),
          notableFeatures: z.array(z.string()).optional(),
        }).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const world = await db.getWorldById(input.worldId, ctx.user.id);
        if (!world) throw new Error("World not found");

        const { id, worldId, ...data } = input;
        await db.updateLocation(id, data);
        return { success: true };
      }),

    delete: protectedProcedure
      .input(z.object({
        id: z.number(),
        worldId: z.number(),
      }))
      .mutation(async ({ ctx, input }) => {
        const world = await db.getWorldById(input.worldId, ctx.user.id);
        if (!world) throw new Error("World not found");

        await db.deleteLocation(input.id);
        return { success: true };
      }),
  }),

  // ============ LORE ENTRIES ============

  lore: router({
    list: protectedProcedure
      .input(z.object({
        worldId: z.number(),
        category: z.enum(["history", "legend", "culture", "religion", "politics", "science", "magic", "species", "language", "artifact", "other"]).optional(),
      }))
      .query(async ({ ctx, input }) => {
        const world = await db.getWorldById(input.worldId, ctx.user.id);
        if (!world) return [];
        return db.getLoreEntriesByWorldId(input.worldId, input.category);
      }),

    get: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return db.getLoreEntryById(input.id);
      }),

    create: protectedProcedure
      .input(z.object({
        worldId: z.number(),
        category: z.enum(["history", "legend", "culture", "religion", "politics", "science", "magic", "species", "language", "artifact", "other"]),
        title: z.string().min(1).max(300),
        content: z.string().min(1),
        isPublic: z.boolean().optional(),
        isSecret: z.boolean().optional(),
        relatedLocationId: z.number().optional(),
        relatedCharacterId: z.number().optional(),
        tags: z.array(z.string()).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const world = await db.getWorldById(input.worldId, ctx.user.id);
        if (!world) throw new Error("World not found");

        const id = await db.createLoreEntry(input);
        return { id };
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        worldId: z.number(),
        category: z.enum(["history", "legend", "culture", "religion", "politics", "science", "magic", "species", "language", "artifact", "other"]).optional(),
        title: z.string().min(1).max(300).optional(),
        content: z.string().optional(),
        isPublic: z.boolean().optional(),
        isSecret: z.boolean().optional(),
        relatedLocationId: z.number().optional(),
        relatedCharacterId: z.number().optional(),
        tags: z.array(z.string()).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const world = await db.getWorldById(input.worldId, ctx.user.id);
        if (!world) throw new Error("World not found");

        const { id, worldId, ...data } = input;
        await db.updateLoreEntry(id, data);
        return { success: true };
      }),

    delete: protectedProcedure
      .input(z.object({
        id: z.number(),
        worldId: z.number(),
      }))
      .mutation(async ({ ctx, input }) => {
        const world = await db.getWorldById(input.worldId, ctx.user.id);
        if (!world) throw new Error("World not found");

        await db.deleteLoreEntry(input.id);
        return { success: true };
      }),
  }),

  // ============ WORLD EVENTS ============

  worldEvents: router({
    list: protectedProcedure
      .input(z.object({ worldId: z.number() }))
      .query(async ({ ctx, input }) => {
        const world = await db.getWorldById(input.worldId, ctx.user.id);
        if (!world) return [];
        return db.getWorldEventsByWorldId(input.worldId);
      }),

    get: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return db.getWorldEventById(input.id);
      }),

    create: protectedProcedure
      .input(z.object({
        worldId: z.number(),
        title: z.string().min(1).max(300),
        description: z.string().min(1),
        eventType: z.enum(["battle", "discovery", "political", "natural", "magical", "social", "economic", "other"]),
        importance: z.number().min(1).max(10).optional(),
        eventDate: z.string().max(200).optional(),
        duration: z.string().max(100).optional(),
        locationId: z.number().optional(),
        involvedCharacterIds: z.array(z.number()).optional(),
        involvedGroupIds: z.array(z.number()).optional(),
        consequences: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const world = await db.getWorldById(input.worldId, ctx.user.id);
        if (!world) throw new Error("World not found");

        const id = await db.createWorldEvent(input);
        return { id };
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        worldId: z.number(),
        title: z.string().min(1).max(300).optional(),
        description: z.string().optional(),
        eventType: z.enum(["battle", "discovery", "political", "natural", "magical", "social", "economic", "other"]).optional(),
        importance: z.number().min(1).max(10).optional(),
        eventDate: z.string().max(200).optional(),
        duration: z.string().max(100).optional(),
        locationId: z.number().optional(),
        involvedCharacterIds: z.array(z.number()).optional(),
        involvedGroupIds: z.array(z.number()).optional(),
        consequences: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const world = await db.getWorldById(input.worldId, ctx.user.id);
        if (!world) throw new Error("World not found");

        const { id, worldId, ...data } = input;
        await db.updateWorldEvent(id, data);
        return { success: true };
      }),

    delete: protectedProcedure
      .input(z.object({
        id: z.number(),
        worldId: z.number(),
      }))
      .mutation(async ({ ctx, input }) => {
        const world = await db.getWorldById(input.worldId, ctx.user.id);
        if (!world) throw new Error("World not found");

        await db.deleteWorldEvent(input.id);
        return { success: true };
      }),
  }),

  // ============ SCHEDULED EVENTS ============

  scheduledEvents: router({
    list: protectedProcedure
      .input(z.object({
        worldId: z.number(),
        status: z.enum(["pending", "active", "completed", "cancelled"]).optional(),
      }))
      .query(async ({ ctx, input }) => {
        const world = await db.getWorldById(input.worldId, ctx.user.id);
        if (!world) return [];
        return db.getScheduledEventsByWorldId(input.worldId, input.status);
      }),

    getPending: protectedProcedure
      .input(z.object({ worldId: z.number() }))
      .query(async ({ ctx, input }) => {
        const world = await db.getWorldById(input.worldId, ctx.user.id);
        if (!world) return [];
        return db.getPendingScheduledEvents(input.worldId);
      }),

    create: protectedProcedure
      .input(z.object({
        worldId: z.number(),
        eventName: z.string().min(1).max(300),
        description: z.string().optional(),
        scheduledFor: z.string().datetime(),
        eventTrigger: z.object({
          triggerType: z.enum(["time", "condition", "manual"]).optional(),
          conditions: z.array(z.string()).optional(),
        }).optional(),
        targetCharacterIds: z.array(z.number()).optional(),
        targetLocationId: z.number().optional(),
        priority: z.number().min(1).max(10).optional(),
        isRecurring: z.boolean().optional(),
        status: z.enum(["pending", "active", "completed", "cancelled"]).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const world = await db.getWorldById(input.worldId, ctx.user.id);
        if (!world) throw new Error("World not found");

        const id = await db.createScheduledEvent({
          ...input,
          scheduledFor: new Date(input.scheduledFor),
        });
        return { id };
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        worldId: z.number(),
        eventName: z.string().min(1).max(300).optional(),
        description: z.string().optional(),
        scheduledFor: z.string().datetime().optional(),
        eventTrigger: z.object({
          triggerType: z.enum(["time", "condition", "manual"]).optional(),
          conditions: z.array(z.string()).optional(),
        }).optional(),
        targetCharacterIds: z.array(z.number()).optional(),
        targetLocationId: z.number().optional(),
        priority: z.number().min(1).max(10).optional(),
        isRecurring: z.boolean().optional(),
        status: z.enum(["pending", "active", "completed", "cancelled"]).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const world = await db.getWorldById(input.worldId, ctx.user.id);
        if (!world) throw new Error("World not found");

        const { id, worldId, scheduledFor, ...rest } = input;
        const data = scheduledFor
          ? { ...rest, scheduledFor: new Date(scheduledFor) }
          : rest;
        await db.updateScheduledEvent(id, data);
        return { success: true };
      }),

    delete: protectedProcedure
      .input(z.object({
        id: z.number(),
        worldId: z.number(),
      }))
      .mutation(async ({ ctx, input }) => {
        const world = await db.getWorldById(input.worldId, ctx.user.id);
        if (!world) throw new Error("World not found");

        await db.deleteScheduledEvent(input.id);
        return { success: true };
      }),
  }),
});

export type AppRouter = typeof appRouter;
