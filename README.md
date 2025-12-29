# DreamGen Clone - Advanced AI Storytelling Platform

A sophisticated AI-powered storytelling and role-playing platform with advanced character modeling, world-building, and narrative generation capabilities.

## Features

### Core Capabilities
- 🎭 **Advanced Character System** - Rich personality traits, emotional states, and behavioral modeling
- 🌍 **World Building** - Comprehensive location, lore, and event management
- 💬 **Interactive Chat** - Real-time role-play with multiple characters
- 📖 **Story Generation** - AI-powered narrative creation with customizable parameters
- 🎨 **Image Generation** - Visual content creation with the Muse model
- 🔐 **Secure API Management** - Encrypted storage of API keys

### Advanced Features (NEW)

#### Character Development
- **Big Five Personality Model** - Openness, Conscientiousness, Extraversion, Agreeableness, Neuroticism
- **Emotional State Tracking** - Real-time emotions and psychological needs
- **Motivation System** - Short-term goals, long-term aspirations, and core values
- **Communication Styles** - Configurable verbal patterns and tone
- **Behavioral Tendencies** - Impulsiveness, risk-taking, empathy, leadership
- **Semi-Autonomous Agents** - Goal-driven behavior with autonomy settings
- **Memory System** - Character experiences, knowledge, and emotional memories

#### Relationship Dynamics
- **9 Relationship Types** - Friend, enemy, rival, family, romantic, mentor, ally, neutral, complex
- **Dynamic Relationships** - Trust, affection, respect, loyalty, dependency, tension tracking
- **Relationship Events** - History of significant moments and their impacts
- **Group Systems** - Families, organizations, factions, communities with hierarchies
- **Social Networks** - Complex multi-character relationship graphs

#### World Building
- **World Management** - Genre, time period, technology level, magic systems
- **Location Hierarchy** - Cities, buildings, wilderness, dungeons with nested structures
- **Lore Database** - History, legends, culture, religion, politics, magic, species
- **World Events** - Battles, discoveries, political events with timeline tracking
- **Location Attributes** - Climate, population, danger levels, resources

#### Time & Events
- **Event Scheduling** - Time-based and condition-based triggers
- **Timeline Management** - Flexible date formats for fictional calendars
- **Event Impact Tracking** - Consequences on characters, groups, and locations
- **Recurring Events** - Automated scheduling for periodic occurrences

For detailed documentation on advanced features, see [ADVANCED_FEATURES.md](./ADVANCED_FEATURES.md).

## Installation

### Prerequisites
- Node.js 18+ 
- pnpm package manager
- MySQL database

### Setup

1. Clone the repository:
```bash
git clone https://github.com/o9nn/dgen.git
cd dgen
```

2. Install dependencies:
```bash
pnpm install
```

3. Configure environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Set up the database:
```bash
npm run db:push
```

5. Start development server:
```bash
npm run dev
```

## Usage

### Development
```bash
npm run dev      # Start development server
npm run check    # Type checking
npm run test     # Run tests
npm run format   # Format code
```

### Production
```bash
npm run build    # Build for production
npm run start    # Start production server
```

## Architecture

### Tech Stack
- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS
- **Backend**: Express, tRPC, TypeScript
- **Database**: MySQL with Drizzle ORM
- **AI Integration**: DreamGen API for text/image generation
- **Authentication**: JWT-based with OAuth support

### Project Structure
```
├── client/          # React frontend
├── server/          # Express backend with tRPC
├── shared/          # Shared types and utilities
├── drizzle/         # Database schema and migrations
└── patches/         # Package patches
```

## Advanced Schema Overview

The system includes 16+ specialized tables:

**Character Tables:**
- `characters` - Enhanced with personality traits and autonomy
- `character_emotional_states` - Real-time emotional tracking
- `character_motivations` - Goals and aspirations
- `character_memories` - Experience tracking

**Relationship Tables:**
- `relationships` - Character-to-character dynamics
- `relationship_events` - Relationship history
- `groups` - Social organizations
- `group_memberships` - Character-group associations

**World Tables:**
- `worlds` - Setting definitions
- `locations` - Places within worlds
- `lore_entries` - Knowledge database
- `world_events` - Historical timeline
- `scheduled_events` - Future event planning

**Core Tables:**
- `users` - User management
- `scenarios` - Role-play scenarios
- `chat_sessions` - Interactive conversations
- `stories` - Generated narratives
- `api_keys` - Secure credential storage

## API Examples

### Creating an Advanced Character
```typescript
const character = await createCharacter({
  userId: 1,
  name: "Lyra Moonwhisper",
  label: "lyra",
  promptDescription: "A wise elven mage",
  personalityOpenness: 85,
  personalityConscientiousness: 70,
  communicationStyle: {
    formality: "formal",
    verbosity: "verbose",
    emotionalExpression: "moderate"
  },
  autonomyLevel: 75,
  autonomyGoals: ["seek knowledge", "protect the forest", "teach young mages"]
});
```

### Managing Emotional State
```typescript
await upsertCharacterEmotionalState({
  characterId: character.id,
  happiness: 70,
  needBelonging: 60,
  needAutonomy: 80,
  overallMood: 65,
  stressLevel: 25
});
```

### Building Relationships
```typescript
const relationship = await createRelationship({
  characterId1: lyraId,
  characterId2: apprenticeId,
  relationshipType: "mentor",
  trust: 85,
  respect: 90,
  affection: 65
});
```

See [ADVANCED_FEATURES.md](./ADVANCED_FEATURES.md) for comprehensive API documentation.

## Integration with Vorticog

This system is designed for integration with the [Vorticog simulation engine](https://github.com/o9nn/vorticog). The advanced schemas support:

- **Event-Shaped Narratives** - World events drive character actions
- **Time-Sensitive Operations** - Scheduled events and temporal tracking
- **Semi-Autonomous Agents** - Goal-driven behavior with emotional responses
- **Complex Social Dynamics** - Multi-layered relationship networks
- **Dynamic World States** - Evolving environments and situations

## Testing

The project includes comprehensive test coverage:

```bash
npm run test
```

Test files:
- `server/auth.logout.test.ts` - Authentication tests
- `server/dreamgen.test.ts` - Core API tests
- `server/advanced-schemas.test.ts` - Advanced feature tests (NEW)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes with tests
4. Submit a pull request

## Database Migrations

Generate and apply migrations:
```bash
npm run db:push
```

The schema includes full TypeScript type safety via Drizzle ORM.

## Environment Variables

Required environment variables:
- `DATABASE_URL` - MySQL connection string
- `JWT_SECRET` - Secret for JWT tokens
- Additional OAuth and API configuration

See `.env.example` for complete list.

## Performance

- Full TypeScript type safety
- Optimized database queries with indexes
- Efficient relationship traversal
- Scalable schema design for large datasets

## Security

- Encrypted API key storage
- JWT-based authentication
- SQL injection prevention via Drizzle ORM
- Input validation with Zod schemas

## License

MIT

## Acknowledgments

- DreamGen for AI text and image generation API
- The open-source community for excellent tools

## Support

For issues and questions:
- GitHub Issues: [https://github.com/o9nn/dgen/issues](https://github.com/o9nn/dgen/issues)
- Documentation: [ADVANCED_FEATURES.md](./ADVANCED_FEATURES.md)

---

Built with ❤️ for the storytelling and simulation community
