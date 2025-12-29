# Database Schema Overview

## Entity Relationship Diagram

This document provides a visual overview of the database schema relationships.

## Core Entities

### User Management
```
users (existing)
├── id (PK)
├── openId (unique)
├── name
├── email
└── role (user, admin)
```

### Characters (Enhanced)
```
characters (enhanced)
├── id (PK)
├── userId (FK → users.id)
├── name
├── label
├── promptDescription
├── displayDescription
├── imageUrl
├── isUserCharacter
├── Personality Traits:
│   ├── personalityOpenness (0-100)
│   ├── personalityConscientiousness (0-100)
│   ├── personalityExtraversion (0-100)
│   ├── personalityAgreeableness (0-100)
│   └── personalityNeuroticism (0-100)
├── communicationStyle (JSON)
├── behavioralTendencies (JSON)
├── autonomyLevel (0-100)
└── autonomyGoals (JSON array)

character_emotional_states (new)
├── id (PK)
├── characterId (FK → characters.id)
├── Emotions (0-100):
│   ├── happiness, sadness, anger
│   ├── fear, surprise, disgust
├── Needs (0-100):
│   ├── needSafety, needBelonging
│   ├── needEsteem, needAutonomy
│   └── needCompetence
├── overallMood, stressLevel, energyLevel
└── lastUpdated

character_motivations (new)
├── id (PK)
├── characterId (FK → characters.id)
├── motivationType (short_term, long_term, core_value)
├── description
├── priority (1-10)
├── isActive
└── progress (0-100)

character_memories (new)
├── id (PK)
├── characterId (FK → characters.id)
├── memoryType (event, interaction, knowledge, emotion, skill, trauma, achievement)
├── content
├── emotionalImpact (-100 to +100)
├── importance (1-10)
├── worldEventId (FK → world_events.id)
├── relatedCharacterId (FK → characters.id)
├── locationId (FK → locations.id)
├── memoryDate
└── isRepressed
```

## Relationships

### Character Relationships
```
relationships (new)
├── id (PK)
├── characterId1 (FK → characters.id)
├── characterId2 (FK → characters.id)
├── relationshipType (friend, enemy, rival, family, romantic, mentor, ally, neutral, complex)
├── Dynamics (0-100):
│   ├── trust, affection, respect
│   ├── loyalty, dependency
│   └── tension
├── description
└── isDynamic

relationship_events (new)
├── id (PK)
├── relationshipId (FK → relationships.id)
├── eventType (first_meeting, conflict, bonding, betrayal, reconciliation, milestone, other)
├── description
├── Impact (-100 to +100):
│   ├── impactOnTrust
│   ├── impactOnAffection
│   └── impactOnRespect
└── eventDate
```

### Groups & Communities
```
groups (new)
├── id (PK)
├── userId (FK → users.id)
├── name
├── groupType (family, organization, faction, community, team, guild, clan, other)
├── description
├── purpose
├── hierarchy (JSON)
├── influence (0-100)
└── worldId (FK → worlds.id)

group_memberships (new)
├── id (PK)
├── groupId (FK → groups.id)
├── characterId (FK → characters.id)
├── role
├── position
├── joinedAt
├── status (active, inactive, former)
└── influence (0-100)
```

## World Building

### World System
```
worlds (new)
├── id (PK)
├── userId (FK → users.id)
├── name
├── description
├── genre
├── timeperiod
├── technologyLevel
├── magicSystem
├── culturalNotes
└── rules (JSON: physicsRules, socialRules, magicRules)

locations (new)
├── id (PK)
├── worldId (FK → worlds.id)
├── name
├── locationType (city, building, wilderness, dungeon, realm, dimension, other)
├── description
├── parentLocationId (FK → locations.id) [self-referential]
└── attributes (JSON: climate, population, danger, resources, notableFeatures)

lore_entries (new)
├── id (PK)
├── worldId (FK → worlds.id)
├── category (history, legend, culture, religion, politics, science, magic, species, language, artifact, other)
├── title
├── content
├── isPublic
├── isSecret
├── relatedLocationId (FK → locations.id)
├── relatedCharacterId (FK → characters.id)
└── tags (JSON array)
```

## Events & Timeline

### Event Management
```
world_events (new)
├── id (PK)
├── worldId (FK → worlds.id)
├── title
├── description
├── eventType (battle, discovery, political, natural, magical, social, economic, other)
├── importance (1-10)
├── eventDate (flexible string format)
├── duration
├── locationId (FK → locations.id)
├── involvedCharacterIds (JSON array)
├── involvedGroupIds (JSON array)
└── consequences

scheduled_events (new)
├── id (PK)
├── worldId (FK → worlds.id)
├── eventName
├── description
├── scheduledFor (timestamp)
├── eventTrigger (JSON: triggerType, conditions)
├── targetCharacterIds (JSON array)
├── targetLocationId (FK → locations.id)
├── priority (1-10)
├── isRecurring
├── status (pending, active, completed, cancelled)
└── createdAt
```

## Existing Systems (Unchanged)

### Scenario System
```
scenarios (existing)
├── id (PK)
├── userId (FK → users.id)
├── title
├── promptDescription
├── displayDescription
├── imageUrl
└── isPublic

scenario_characters (existing)
├── id (PK)
├── scenarioId (FK → scenarios.id)
├── characterId (FK → characters.id)
└── ...

scenario_interactions (existing)
├── id (PK)
├── scenarioId (FK → scenarios.id)
└── ...
```

### Chat System
```
chat_sessions (existing)
├── id (PK)
├── userId (FK → users.id)
├── scenarioId (FK → scenarios.id)
└── ...

chat_messages (existing)
├── id (PK)
├── sessionId (FK → chat_sessions.id)
└── ...
```

### Story System
```
stories (existing)
├── id (PK)
├── userId (FK → users.id)
└── ...

story_characters (existing)
├── id (PK)
├── storyId (FK → stories.id)
└── ...
```

### Other Systems
```
api_keys (existing)
├── id (PK)
├── userId (FK → users.id)
└── ...

generated_images (existing)
├── id (PK)
├── userId (FK → users.id)
└── ...
```

## Key Relationships

### One-to-Many Relationships
- `users` → `characters` (one user has many characters)
- `users` → `worlds` (one user has many worlds)
- `users` → `groups` (one user has many groups)
- `worlds` → `locations` (one world has many locations)
- `worlds` → `lore_entries` (one world has many lore entries)
- `worlds` → `world_events` (one world has many events)
- `worlds` → `scheduled_events` (one world has many scheduled events)
- `characters` → `character_motivations` (one character has many motivations)
- `characters` → `character_memories` (one character has many memories)
- `relationships` → `relationship_events` (one relationship has many events)
- `locations` → `locations` (parent-child hierarchy)

### One-to-One Relationships
- `characters` → `character_emotional_states` (one character has one current emotional state)

### Many-to-Many Relationships
- `characters` ↔ `characters` (through `relationships` table)
- `characters` ↔ `groups` (through `group_memberships` table)
- `world_events` ↔ `characters` (through JSON array in world_events)
- `world_events` ↔ `groups` (through JSON array in world_events)
- `scheduled_events` ↔ `characters` (through JSON array in scheduled_events)

## Cross-References
- `character_memories.worldEventId` → `world_events.id`
- `character_memories.relatedCharacterId` → `characters.id`
- `character_memories.locationId` → `locations.id`
- `lore_entries.relatedLocationId` → `locations.id`
- `lore_entries.relatedCharacterId` → `characters.id`
- `world_events.locationId` → `locations.id`
- `relationship_events.worldEventId` → `world_events.id`
- `scheduled_events.targetLocationId` → `locations.id`
- `groups.worldId` → `worlds.id`

## Data Flow Examples

### Character in World Scenario
```
User
 └─> Character (with personality, emotions, motivations)
      ├─> Emotional State (current feelings and needs)
      ├─> Motivations (goals and values)
      ├─> Memories (experiences)
      └─> Relationships
           ├─> Other Characters (trust, affection, etc.)
           ├─> Groups (memberships with roles)
           └─> Relationship Events (history)
```

### World Building Flow
```
User
 └─> World (setting definition)
      ├─> Locations (cities, buildings, etc.)
      │    └─> Sub-locations (hierarchy)
      ├─> Lore Entries (knowledge base)
      │    ├─> Related Characters
      │    └─> Related Locations
      ├─> World Events (timeline)
      │    ├─> Involved Characters
      │    ├─> Involved Groups
      │    └─> Affected Locations
      └─> Scheduled Events (future)
           ├─> Target Characters
           └─> Target Locations
```

### Group Dynamics
```
Group (organization/faction)
 ├─> Hierarchy Structure
 ├─> Members (characters)
 │    └─> Each with role, position, influence
 ├─> World Context
 └─> Related World Events
```

## Indexing Strategy

Recommended indexes for optimal query performance:

### Primary Indexes (Auto-created)
- All `id` fields (PRIMARY KEY)

### Foreign Key Indexes
- `characters.userId`
- `character_emotional_states.characterId`
- `character_motivations.characterId`
- `character_memories.characterId`
- `relationships.characterId1, characterId2`
- `relationship_events.relationshipId`
- `groups.userId, worldId`
- `group_memberships.groupId, characterId`
- `worlds.userId`
- `locations.worldId, parentLocationId`
- `lore_entries.worldId`
- `world_events.worldId`
- `scheduled_events.worldId`

### Query Optimization Indexes
- `character_motivations.isActive`
- `scheduled_events.status, scheduledFor`
- `character_memories.importance, memoryDate`
- `world_events.importance`
- `group_memberships.status`

## Total Schema Size

- **Total Tables**: 29 (16 new + 13 existing)
- **New Tables**: 16
- **Enhanced Tables**: 1 (characters)
- **Unchanged Tables**: 12

## Migration Notes

All new tables are additive and non-breaking:
- Existing tables remain unchanged (except characters enhanced with new fields)
- All new fields have sensible defaults
- Backward compatibility maintained
- No data migration required for existing data

## Type Safety

All tables have corresponding TypeScript types:
- Generated types: `Character`, `CharacterEmotionalState`, etc.
- Insert types: `InsertCharacter`, `InsertCharacterEmotionalState`, etc.
- Enum types: `LoreCategory`, `ScheduledEventStatus`, etc.

Full type inference through Drizzle ORM ensures compile-time safety.
