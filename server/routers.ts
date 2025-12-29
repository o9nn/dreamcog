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
});

export type AppRouter = typeof appRouter;
