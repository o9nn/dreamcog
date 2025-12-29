import { describe, expect, it, vi, beforeEach } from "vitest";
import { 
  DEFAULT_PERSONALITY_TRAITS, 
  DEFAULT_EMOTIONAL_STATE,
  RELATIONSHIP_TYPES,
  GROUP_TYPES,
  LOCATION_TYPES,
  LORE_CATEGORIES 
} from "../shared/types";

describe("Advanced Schemas - Type Definitions", () => {
  describe("Personality Traits", () => {
    it("should have valid default personality traits", () => {
      expect(DEFAULT_PERSONALITY_TRAITS).toBeDefined();
      expect(DEFAULT_PERSONALITY_TRAITS.openness).toBe(50);
      expect(DEFAULT_PERSONALITY_TRAITS.conscientiousness).toBe(50);
      expect(DEFAULT_PERSONALITY_TRAITS.extraversion).toBe(50);
      expect(DEFAULT_PERSONALITY_TRAITS.agreeableness).toBe(50);
      expect(DEFAULT_PERSONALITY_TRAITS.neuroticism).toBe(50);
    });

    it("should have personality traits in valid range", () => {
      Object.values(DEFAULT_PERSONALITY_TRAITS).forEach(value => {
        expect(value).toBeGreaterThanOrEqual(0);
        expect(value).toBeLessThanOrEqual(100);
      });
    });
  });

  describe("Emotional State", () => {
    it("should have valid default emotional state", () => {
      expect(DEFAULT_EMOTIONAL_STATE).toBeDefined();
      expect(DEFAULT_EMOTIONAL_STATE.happiness).toBe(50);
      expect(DEFAULT_EMOTIONAL_STATE.overallMood).toBe(50);
      expect(DEFAULT_EMOTIONAL_STATE.stressLevel).toBe(0);
    });

    it("should have emotional values in valid range", () => {
      Object.values(DEFAULT_EMOTIONAL_STATE).forEach(value => {
        expect(value).toBeGreaterThanOrEqual(0);
        expect(value).toBeLessThanOrEqual(100);
      });
    });

    it("should include all basic emotions", () => {
      expect(DEFAULT_EMOTIONAL_STATE).toHaveProperty("happiness");
      expect(DEFAULT_EMOTIONAL_STATE).toHaveProperty("sadness");
      expect(DEFAULT_EMOTIONAL_STATE).toHaveProperty("anger");
      expect(DEFAULT_EMOTIONAL_STATE).toHaveProperty("fear");
      expect(DEFAULT_EMOTIONAL_STATE).toHaveProperty("surprise");
      expect(DEFAULT_EMOTIONAL_STATE).toHaveProperty("disgust");
    });

    it("should include emotional needs", () => {
      expect(DEFAULT_EMOTIONAL_STATE).toHaveProperty("needSafety");
      expect(DEFAULT_EMOTIONAL_STATE).toHaveProperty("needBelonging");
      expect(DEFAULT_EMOTIONAL_STATE).toHaveProperty("needEsteem");
      expect(DEFAULT_EMOTIONAL_STATE).toHaveProperty("needAutonomy");
      expect(DEFAULT_EMOTIONAL_STATE).toHaveProperty("needCompetence");
    });
  });

  describe("Relationship Types", () => {
    it("should have valid relationship types", () => {
      expect(RELATIONSHIP_TYPES).toBeDefined();
      expect(RELATIONSHIP_TYPES.length).toBeGreaterThan(0);
    });

    it("should include common relationship types", () => {
      const types = RELATIONSHIP_TYPES.map(t => t.id);
      expect(types).toContain("friend");
      expect(types).toContain("enemy");
      expect(types).toContain("family");
      expect(types).toContain("romantic");
      expect(types).toContain("neutral");
    });

    it("should have valid structure for each relationship type", () => {
      RELATIONSHIP_TYPES.forEach(type => {
        expect(type).toHaveProperty("id");
        expect(type).toHaveProperty("name");
        expect(typeof type.id).toBe("string");
        expect(typeof type.name).toBe("string");
      });
    });
  });

  describe("Group Types", () => {
    it("should have valid group types", () => {
      expect(GROUP_TYPES).toBeDefined();
      expect(GROUP_TYPES.length).toBeGreaterThan(0);
    });

    it("should include common group types", () => {
      const types = GROUP_TYPES.map(t => t.id);
      expect(types).toContain("family");
      expect(types).toContain("organization");
      expect(types).toContain("faction");
      expect(types).toContain("community");
    });
  });

  describe("Location Types", () => {
    it("should have valid location types", () => {
      expect(LOCATION_TYPES).toBeDefined();
      expect(LOCATION_TYPES.length).toBeGreaterThan(0);
    });

    it("should include common location types", () => {
      const types = LOCATION_TYPES.map(t => t.id);
      expect(types).toContain("city");
      expect(types).toContain("building");
      expect(types).toContain("wilderness");
    });
  });

  describe("Lore Categories", () => {
    it("should have valid lore categories", () => {
      expect(LORE_CATEGORIES).toBeDefined();
      expect(LORE_CATEGORIES.length).toBeGreaterThan(0);
    });

    it("should include common lore categories", () => {
      const categories = LORE_CATEGORIES.map(c => c.id);
      expect(categories).toContain("history");
      expect(categories).toContain("legend");
      expect(categories).toContain("culture");
      expect(categories).toContain("magic");
    });

    it("should have valid structure for each category", () => {
      LORE_CATEGORIES.forEach(category => {
        expect(category).toHaveProperty("id");
        expect(category).toHaveProperty("name");
        expect(typeof category.id).toBe("string");
        expect(typeof category.name).toBe("string");
      });
    });
  });
});

describe("Advanced Schemas - Data Structures", () => {
  describe("Character Enhancement", () => {
    it("should support personality trait storage", () => {
      const characterData = {
        userId: 1,
        name: "Test Character",
        label: "test",
        personalityOpenness: 70,
        personalityConscientiousness: 60,
        personalityExtraversion: 80,
        personalityAgreeableness: 55,
        personalityNeuroticism: 40,
      };

      expect(characterData.personalityOpenness).toBe(70);
      expect(characterData.personalityExtraversion).toBe(80);
    });

    it("should support communication style structure", () => {
      const communicationStyle = {
        formality: "casual" as const,
        verbosity: "moderate" as const,
        emotionalExpression: "expressive" as const,
        humorLevel: 70,
        directness: 80,
      };

      expect(communicationStyle.formality).toBe("casual");
      expect(communicationStyle.humorLevel).toBe(70);
    });

    it("should support behavioral tendencies structure", () => {
      const behavioralTendencies = {
        impulsiveness: 60,
        riskTaking: 50,
        empathy: 80,
        leadership: 70,
        independence: 65,
      };

      expect(behavioralTendencies.empathy).toBe(80);
      expect(behavioralTendencies.leadership).toBe(70);
    });

    it("should support autonomy settings", () => {
      const autonomyData = {
        autonomyLevel: 75,
        autonomyGoals: ["survive", "help others", "seek knowledge"],
      };

      expect(autonomyData.autonomyLevel).toBe(75);
      expect(autonomyData.autonomyGoals).toHaveLength(3);
    });
  });

  describe("Emotional State Structure", () => {
    it("should track multiple emotions simultaneously", () => {
      const emotionalState = {
        characterId: 1,
        happiness: 60,
        sadness: 20,
        anger: 10,
        fear: 5,
        surprise: 0,
        disgust: 0,
      };

      expect(emotionalState.happiness).toBe(60);
      expect(emotionalState.sadness).toBe(20);
    });

    it("should track emotional needs", () => {
      const needs = {
        needSafety: 80,
        needBelonging: 50,
        needEsteem: 60,
        needAutonomy: 70,
        needCompetence: 65,
      };

      expect(needs.needSafety).toBe(80);
      expect(needs.needBelonging).toBe(50);
    });

    it("should track mood and stress", () => {
      const moodData = {
        overallMood: 55,
        stressLevel: 30,
        energyLevel: 70,
      };

      expect(moodData.overallMood).toBe(55);
      expect(moodData.stressLevel).toBe(30);
      expect(moodData.energyLevel).toBe(70);
    });
  });

  describe("Motivation Structure", () => {
    it("should support different motivation types", () => {
      const shortTermGoal = {
        characterId: 1,
        motivationType: "short_term" as const,
        description: "Find food for the day",
        priority: 8,
        isActive: true,
        progress: 50,
      };

      const longTermGoal = {
        characterId: 1,
        motivationType: "long_term" as const,
        description: "Become a master swordsman",
        priority: 9,
        isActive: true,
        progress: 30,
      };

      expect(shortTermGoal.motivationType).toBe("short_term");
      expect(longTermGoal.motivationType).toBe("long_term");
      expect(longTermGoal.priority).toBeGreaterThan(shortTermGoal.priority);
    });
  });

  describe("Relationship Structure", () => {
    it("should support relationship dynamics", () => {
      const relationship = {
        characterId1: 1,
        characterId2: 2,
        relationshipType: "friend" as const,
        trust: 80,
        affection: 70,
        respect: 85,
        loyalty: 75,
        dependency: 30,
        tension: 10,
      };

      expect(relationship.trust).toBe(80);
      expect(relationship.affection).toBe(70);
      expect(relationship.tension).toBe(10);
    });

    it("should support relationship history", () => {
      const relationshipEvent = {
        relationshipId: 1,
        eventType: "bonding" as const,
        description: "Saved each other during battle",
        impactOnTrust: 20,
        impactOnAffection: 15,
        impactOnRespect: 25,
      };

      expect(relationshipEvent.eventType).toBe("bonding");
      expect(relationshipEvent.impactOnTrust).toBeGreaterThan(0);
    });
  });

  describe("World and Lore Structure", () => {
    it("should support world definition", () => {
      const world = {
        userId: 1,
        name: "Fantasy Realm",
        description: "A magical world",
        genre: "fantasy",
        timeperiod: "medieval",
        technologyLevel: "low",
        rules: {
          physicsRules: ["Magic affects physics"],
          socialRules: ["Honor is paramount"],
          magicRules: ["Magic requires sacrifice"],
        },
      };

      expect(world.genre).toBe("fantasy");
      expect(world.rules.magicRules).toHaveLength(1);
    });

    it("should support location hierarchy", () => {
      const cityLocation = {
        worldId: 1,
        name: "Capital City",
        locationType: "city" as const,
        parentLocationId: null,
      };

      const buildingLocation = {
        worldId: 1,
        name: "Royal Palace",
        locationType: "building" as const,
        parentLocationId: cityLocation.worldId,
      };

      expect(cityLocation.locationType).toBe("city");
      expect(buildingLocation.locationType).toBe("building");
      expect(buildingLocation.parentLocationId).toBe(cityLocation.worldId);
    });

    it("should support lore entries", () => {
      const loreEntry = {
        worldId: 1,
        category: "history" as const,
        title: "The Great War",
        content: "A devastating conflict...",
        isPublic: true,
        isSecret: false,
        tags: ["war", "history", "important"],
      };

      expect(loreEntry.category).toBe("history");
      expect(loreEntry.tags).toContain("war");
      expect(loreEntry.isPublic).toBe(true);
    });
  });

  describe("Event and Memory Structure", () => {
    it("should support world events", () => {
      const worldEvent = {
        worldId: 1,
        title: "The Dragon Attack",
        description: "A dragon attacked the city",
        eventType: "battle" as const,
        importance: 9,
        eventDate: "Year 1205, Day 45",
        involvedCharacterIds: [1, 2, 3],
        consequences: "City walls damaged, 100 casualties",
      };

      expect(worldEvent.eventType).toBe("battle");
      expect(worldEvent.importance).toBe(9);
      expect(worldEvent.involvedCharacterIds).toHaveLength(3);
    });

    it("should support character memories", () => {
      const memory = {
        characterId: 1,
        memoryType: "trauma" as const,
        content: "Witnessed the dragon attack",
        emotionalImpact: -50,
        importance: 9,
        isRepressed: false,
      };

      expect(memory.memoryType).toBe("trauma");
      expect(memory.emotionalImpact).toBeLessThan(0);
      expect(memory.importance).toBe(9);
    });

    it("should support scheduled events", () => {
      const scheduledEvent = {
        worldId: 1,
        eventName: "Annual Festival",
        scheduledFor: new Date("2025-06-01"),
        eventTrigger: {
          triggerType: "time" as const,
          conditions: [],
        },
        priority: 5,
        isRecurring: true,
        status: "pending" as const,
      };

      expect(scheduledEvent.isRecurring).toBe(true);
      expect(scheduledEvent.status).toBe("pending");
    });
  });

  describe("Group Structure", () => {
    it("should support group hierarchy", () => {
      const group = {
        userId: 1,
        name: "The Knights",
        groupType: "organization" as const,
        hierarchy: {
          type: "hierarchical" as const,
          positions: ["Grand Master", "Knight Commander", "Knight", "Squire"],
        },
        influence: 80,
      };

      expect(group.groupType).toBe("organization");
      expect(group.hierarchy.type).toBe("hierarchical");
      expect(group.hierarchy.positions).toHaveLength(4);
    });

    it("should support group memberships", () => {
      const membership = {
        groupId: 1,
        characterId: 1,
        role: "Knight Commander",
        position: "Second in command",
        status: "active" as const,
        influence: 70,
      };

      expect(membership.role).toBe("Knight Commander");
      expect(membership.status).toBe("active");
      expect(membership.influence).toBe(70);
    });
  });
});
