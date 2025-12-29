import { describe, expect, it, vi } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  return {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

function createUnauthContext(): TrpcContext {
  return {
    user: null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

describe("auth.me", () => {
  it("returns user when authenticated", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    
    const result = await caller.auth.me();
    
    expect(result).not.toBeNull();
    expect(result?.email).toBe("test@example.com");
    expect(result?.name).toBe("Test User");
  });

  it("returns null when not authenticated", async () => {
    const ctx = createUnauthContext();
    const caller = appRouter.createCaller(ctx);
    
    const result = await caller.auth.me();
    
    expect(result).toBeNull();
  });
});

describe("auth.logout", () => {
  it("clears session cookie and returns success", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    
    const result = await caller.auth.logout();
    
    expect(result).toEqual({ success: true });
    expect(ctx.res.clearCookie).toHaveBeenCalled();
  });
});

describe("apiKeys router", () => {
  it("requires authentication for list", async () => {
    const ctx = createUnauthContext();
    const caller = appRouter.createCaller(ctx);
    
    await expect(caller.apiKeys.list()).rejects.toThrow();
  });
});

describe("chatSessions router", () => {
  it("requires authentication for list", async () => {
    const ctx = createUnauthContext();
    const caller = appRouter.createCaller(ctx);
    
    await expect(caller.chatSessions.list()).rejects.toThrow();
  });
});

describe("stories router", () => {
  it("requires authentication for list", async () => {
    const ctx = createUnauthContext();
    const caller = appRouter.createCaller(ctx);
    
    await expect(caller.stories.list()).rejects.toThrow();
  });
});

describe("scenarios router", () => {
  it("requires authentication for list", async () => {
    const ctx = createUnauthContext();
    const caller = appRouter.createCaller(ctx);
    
    await expect(caller.scenarios.list()).rejects.toThrow();
  });

  it("allows public access to listPublic", async () => {
    const ctx = createUnauthContext();
    const caller = appRouter.createCaller(ctx);
    
    // This should not throw since it's a public procedure
    const result = await caller.scenarios.listPublic({});
    
    expect(Array.isArray(result)).toBe(true);
  });
});

describe("characters router", () => {
  it("requires authentication for list", async () => {
    const ctx = createUnauthContext();
    const caller = appRouter.createCaller(ctx);
    
    await expect(caller.characters.list()).rejects.toThrow();
  });
});

describe("images router", () => {
  it("requires authentication for list", async () => {
    const ctx = createUnauthContext();
    const caller = appRouter.createCaller(ctx);
    
    await expect(caller.images.list({ limit: 10 })).rejects.toThrow();
  });
});
