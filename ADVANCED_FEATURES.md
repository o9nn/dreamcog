# Advanced Character, World, and Lore System

## Overview

This document describes the advanced schemas and models implemented for character development, world building, and lore management in the DreamGen system. These features enable event-shaped, time-sensitive, semi-autonomous agents with emotional needs, motivational personas, character traits, and complex relationship dynamics.

## Character System

### Enhanced Character Model

Characters now include comprehensive personality and behavioral attributes:

#### Personality Traits (Big Five Model)
Each character has five personality dimensions (0-100 scale):
- **Openness**: Creativity, curiosity, and openness to experience
- **Conscientiousness**: Organization, dependability, and self-discipline
- **Extraversion**: Sociability, assertiveness, and energy level
- **Agreeableness**: Compassion, cooperation, and trust
- **Neuroticism**: Emotional stability and resilience

#### Communication Style
Characters have configurable communication patterns:
- **Formality**: casual, formal, or mixed
- **Verbosity**: concise, moderate, or verbose
- **Emotional Expression**: reserved, moderate, or expressive
- **Humor Level**: 0-100 scale
- **Directness**: 0-100 scale

#### Behavioral Tendencies
Configurable behavioral traits (0-100 scale):
- **Impulsiveness**: Tendency to act without thinking
- **Risk Taking**: Willingness to take chances
- **Empathy**: Ability to understand others' emotions
- **Leadership**: Natural leadership qualities
- **Independence**: Preference for autonomy

#### Autonomy Settings
For simulation and semi-autonomous behavior:
- **Autonomy Level** (0-100): How autonomous the agent is
- **Autonomy Goals**: Array of primary goals guiding behavior

### Emotional State System

#### Current Emotions
Six basic emotions tracked in real-time (0-100 intensity):
- Happiness
- Sadness
- Anger
- Fear
- Surprise
- Disgust

#### Emotional Needs
Five core psychological needs (0-100 fulfillment):
- **Safety**: Physical and psychological security
- **Belonging**: Social connection and acceptance
- **Esteem**: Self-worth and recognition
- **Autonomy**: Independence and control
- **Competence**: Mastery and effectiveness

#### Mood Metrics
- **Overall Mood** (0-100): General emotional state
- **Stress Level** (0-100): Current stress intensity
- **Energy Level** (0-100): Physical and mental energy

### Motivation System

Characters can have multiple motivations in three categories:

#### Motivation Types
- **Short-term**: Immediate goals and tasks
- **Long-term**: Aspirations and life goals
- **Core values**: Fundamental beliefs and principles

#### Motivation Attributes
- **Priority** (1-10): Importance ranking
- **Progress** (0-100): Current completion percentage
- **Active Status**: Whether currently pursuing

### Memory System

Characters accumulate memories over time:

#### Memory Types
- **Event**: Significant occurrences
- **Interaction**: Social encounters
- **Knowledge**: Learned information
- **Emotion**: Emotional experiences
- **Skill**: Acquired abilities
- **Trauma**: Negative impactful events
- **Achievement**: Accomplishments

#### Memory Attributes
- **Emotional Impact** (-100 to +100): How it affected emotions
- **Importance** (1-10): Significance level
- **Repression Status**: Can be hidden/suppressed
- **Last Recalled**: Tracking memory access

## Relationship System

### Character Relationships

#### Relationship Types
- Friend
- Enemy
- Rival
- Family
- Romantic
- Mentor
- Ally
- Neutral
- Complex (mixed dynamics)

#### Relationship Dynamics (0-100 scales)
- **Trust**: Belief in reliability
- **Affection**: Emotional warmth
- **Respect**: Admiration and regard
- **Loyalty**: Commitment and devotion
- **Dependency**: Reliance on the other
- **Tension**: Conflict and friction

#### Dynamic Evolution
Relationships can evolve based on:
- Shared experiences
- Relationship events
- Character interactions
- World events

### Relationship Events

Track significant moments in relationships:

#### Event Types
- First meeting
- Conflict
- Bonding
- Betrayal
- Reconciliation
- Milestone

#### Impact Tracking
Each event records its impact on relationship dynamics:
- Impact on trust (-100 to +100)
- Impact on affection
- Impact on respect

### Group System

#### Group Types
- Family
- Organization
- Faction
- Community
- Team
- Guild
- Clan

#### Group Attributes
- **Hierarchy**: Flat, hierarchical, or council structure
- **Influence** (0-100): Power level in the world
- **Positions**: Defined roles within the group

#### Group Memberships
Characters can belong to multiple groups with:
- **Role**: Position or title
- **Status**: active, inactive, or former
- **Influence**: Power within the group
- **Join Date**: When they joined

## World Building System

### World Definition

#### Core Attributes
- **Genre**: Fantasy, sci-fi, historical, etc.
- **Time Period**: Era or epoch
- **Technology Level**: Technological advancement
- **Magic System**: How magic works (if applicable)
- **Cultural Notes**: Social and cultural context

#### World Rules
Configurable rule systems:
- **Physics Rules**: How the world's physics work
- **Social Rules**: Cultural norms and expectations
- **Magic Rules**: Magical system constraints

### Location System

#### Location Types
- City
- Building
- Wilderness
- Dungeon
- Realm
- Dimension

#### Location Hierarchy
Locations can be nested (e.g., building within city):
- **Parent Location**: Links to containing location
- **Sub-locations**: Contained locations

#### Location Attributes
- **Climate**: Weather and environmental conditions
- **Population**: Size and density
- **Danger Level** (0-100): Risk factor
- **Resources**: Available materials and assets
- **Notable Features**: Distinctive characteristics

### Lore System

#### Lore Categories
- History
- Legend
- Culture
- Religion
- Politics
- Science
- Magic
- Species
- Language
- Artifact

#### Lore Entry Attributes
- **Content**: Detailed information
- **Public/Secret Status**: Knowledge accessibility
- **Related Entities**: Linked characters, locations
- **Tags**: For categorization and search

## Event and Timeline System

### World Events

#### Event Types
- Battle
- Discovery
- Political
- Natural (disasters)
- Magical
- Social
- Economic

#### Event Attributes
- **Importance** (1-10): Historical significance
- **Event Date**: Flexible format for fictional calendars
- **Duration**: How long it lasted
- **Involved Entities**: Characters, groups, locations
- **Consequences**: Long-term effects

### Scheduled Events

For simulation and future planning:

#### Trigger Types
- **Time-based**: Occur at specific time
- **Condition-based**: Triggered by conditions
- **Manual**: User-initiated

#### Event Scheduling
- **Priority** (1-10): Execution order
- **Recurring**: Can repeat automatically
- **Status**: pending, active, completed, cancelled
- **Target Entities**: Who/what is affected

## Integration with Vorticog Simulation Engine

### Agent Autonomy

The system supports semi-autonomous agents through:

1. **Goal-Driven Behavior**: Autonomy goals guide decision-making
2. **Emotional Responses**: Emotional state influences actions
3. **Memory-Informed**: Past experiences shape behavior
4. **Relationship-Aware**: Social dynamics affect choices
5. **Event-Reactive**: Responds to world events

### Time-Sensitive Operations

- Scheduled events can trigger agent actions
- Emotional states decay/change over time
- Relationships evolve through interactions
- Memories can fade or strengthen

### Event-Shaped Narratives

- World events create context for character actions
- Character actions can trigger world events
- Relationship events affect character dynamics
- Group activities shape world state

## API Usage Examples

### Creating a Character with Personality

```typescript
import { createCharacter } from './server/db';

const characterId = await createCharacter({
  userId: 1,
  name: "Aria Stormwind",
  label: "aria",
  promptDescription: "A brave knight seeking justice",
  personalityOpenness: 75,
  personalityConscientiousness: 80,
  personalityExtraversion: 65,
  personalityAgreeableness: 70,
  personalityNeuroticism: 40,
  communicationStyle: {
    formality: "formal",
    verbosity: "moderate",
    emotionalExpression: "reserved",
    humorLevel: 30,
    directness: 85
  },
  autonomyLevel: 70,
  autonomyGoals: ["protect the innocent", "uphold justice", "serve the kingdom"]
});
```

### Setting Emotional State

```typescript
import { upsertCharacterEmotionalState } from './server/db';

await upsertCharacterEmotionalState({
  characterId: characterId,
  happiness: 60,
  sadness: 10,
  fear: 20,
  needSafety: 40, // Low due to dangerous quest
  needBelonging: 70,
  needEsteem: 80,
  overallMood: 55,
  stressLevel: 60,
  energyLevel: 50
});
```

### Creating a Relationship

```typescript
import { createRelationship } from './server/db';

const relationshipId = await createRelationship({
  characterId1: ariaId,
  characterId2: mentorId,
  relationshipType: "mentor",
  trust: 90,
  affection: 70,
  respect: 95,
  loyalty: 85,
  dependency: 60,
  tension: 5
});
```

### Building a World

```typescript
import { createWorld, createLocation, createLoreEntry } from './server/db';

// Create world
const worldId = await createWorld({
  userId: 1,
  name: "Aethermoor",
  description: "A realm where magic and technology coexist",
  genre: "fantasy-steampunk",
  timeperiod: "industrial revolution",
  technologyLevel: "steam-powered",
  rules: {
    physicsRules: ["Steam power amplifies magic"],
    socialRules: ["Mages form the ruling class"],
    magicRules: ["Magic drains from the ether"]
  }
});

// Create location
const cityId = await createLocation({
  worldId: worldId,
  name: "Ironhaven",
  locationType: "city",
  description: "Capital city built around ancient magical forges",
  attributes: {
    climate: "temperate",
    population: "500,000",
    danger: 30,
    resources: ["iron", "coal", "magical crystals"]
  }
});

// Add lore
await createLoreEntry({
  worldId: worldId,
  category: "history",
  title: "The Forge Wars",
  content: "A century ago, wars were fought over control of the magical forges...",
  isPublic: true,
  tags: ["war", "forges", "history"]
});
```

### Scheduling Events

```typescript
import { createScheduledEvent } from './server/db';

await createScheduledEvent({
  worldId: worldId,
  eventName: "The Grand Tournament",
  description: "Annual competition among knights and mages",
  scheduledFor: new Date("2025-07-15"),
  eventTrigger: {
    triggerType: "time",
    conditions: []
  },
  targetCharacterIds: [ariaId],
  priority: 7,
  isRecurring: true,
  status: "pending"
});
```

## Database Helper Functions

All new tables have comprehensive helper functions:

### Character Functions
- `getCharacterEmotionalState(characterId)`
- `upsertCharacterEmotionalState(data)`
- `createCharacterMotivation(data)`
- `getCharacterMotivations(characterId, activeOnly)`
- `addCharacterMemory(data)`
- `getCharacterMemories(characterId, limit)`

### Relationship Functions
- `createRelationship(data)`
- `getCharacterRelationships(characterId)`
- `getRelationshipBetween(characterId1, characterId2)`
- `addRelationshipEvent(data)`
- `getRelationshipEvents(relationshipId)`

### Group Functions
- `createGroup(data)`
- `getGroupsByUserId(userId)`
- `addGroupMembership(data)`
- `getGroupMembers(groupId)`
- `getCharacterGroups(characterId)`

### World Functions
- `createWorld(data)`
- `getWorldsByUserId(userId)`
- `createLocation(data)`
- `getLocationsByWorldId(worldId)`
- `createLoreEntry(data)`
- `getLoreEntriesByWorldId(worldId, category)`

### Event Functions
- `createWorldEvent(data)`
- `getWorldEventsByWorldId(worldId)`
- `createScheduledEvent(data)`
- `getPendingScheduledEvents(worldId)`

## Type Safety

All schemas include full TypeScript type definitions:

```typescript
// Exported from shared/types.ts
import type {
  Character,
  CharacterEmotionalState,
  CharacterMotivation,
  CharacterMemory,
  Relationship,
  RelationshipEvent,
  Group,
  GroupMembership,
  World,
  Location,
  LoreEntry,
  WorldEvent,
  ScheduledEvent
} from './shared/types';
```

## Constants and Defaults

Pre-defined constants for common values:

```typescript
import {
  DEFAULT_PERSONALITY_TRAITS,
  DEFAULT_EMOTIONAL_STATE,
  RELATIONSHIP_TYPES,
  GROUP_TYPES,
  LOCATION_TYPES,
  LORE_CATEGORIES,
  WORLD_EVENT_TYPES,
  MEMORY_TYPES
} from './shared/types';
```

## Future Enhancements

Potential additions for deeper integration with Vorticog:

1. **Behavior Trees**: Structured decision-making for autonomous agents
2. **Influence Maps**: Track character influence across locations
3. **Social Networks**: Graph-based relationship analysis
4. **Trait Evolution**: Personality changes over time
5. **Cultural Systems**: Shared beliefs and norms for groups
6. **Economic Systems**: Resource and trade management
7. **Reputation System**: Public opinion tracking
8. **Skill Trees**: Detailed competency tracking
9. **Dialogue History**: Conversation tracking and analysis
10. **Goal Inference**: AI-driven goal generation

## Testing

Comprehensive test suite covers:
- Type validation
- Default values
- Data structure integrity
- Relationship logic
- Event scheduling
- Memory management

Run tests with:
```bash
npm run test
```

## License

MIT
