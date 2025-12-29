CREATE TABLE `api_keys` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`keyName` varchar(100) NOT NULL,
	`encryptedKey` text NOT NULL,
	`lastUsed` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `api_keys_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `characters` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(200) NOT NULL,
	`label` varchar(100) NOT NULL,
	`promptDescription` text,
	`displayDescription` text,
	`imageUrl` text,
	`isUserCharacter` boolean DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `characters_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `chat_messages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sessionId` int NOT NULL,
	`messageType` enum('message','text','instruction','user','system') NOT NULL,
	`characterLabel` varchar(100),
	`characterName` varchar(200),
	`content` text NOT NULL,
	`isSticky` boolean DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `chat_messages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `chat_sessions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`scenarioId` int,
	`title` varchar(300) NOT NULL,
	`systemPrompt` text,
	`modelId` varchar(100) DEFAULT 'lucid-v1-medium',
	`samplingParams` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `chat_sessions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `generated_images` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`includePrompt` text NOT NULL,
	`excludePrompt` text,
	`cfgScale` int DEFAULT 7,
	`fidelity` int DEFAULT 30,
	`aspectRatio` varchar(20) DEFAULT 'square',
	`style` varchar(100),
	`seed` int,
	`imageUrl` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `generated_images_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `scenario_characters` (
	`id` int AUTO_INCREMENT NOT NULL,
	`scenarioId` int NOT NULL,
	`characterId` int,
	`name` varchar(200) NOT NULL,
	`label` varchar(100) NOT NULL,
	`promptDescription` text,
	`isUserCharacter` boolean DEFAULT false,
	`orderIndex` int DEFAULT 0,
	CONSTRAINT `scenario_characters_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `scenario_interactions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`scenarioId` int NOT NULL,
	`interactionType` enum('message','text','instruction') NOT NULL,
	`characterLabel` varchar(100),
	`content` text NOT NULL,
	`isSticky` boolean DEFAULT false,
	`orderIndex` int DEFAULT 0,
	CONSTRAINT `scenario_interactions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `scenarios` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`title` varchar(300) NOT NULL,
	`promptDescription` text,
	`displayDescription` text,
	`imageUrl` text,
	`isPublic` boolean DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `scenarios_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `stories` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`title` varchar(300) NOT NULL,
	`plotDescription` text,
	`styleDescription` text,
	`content` text,
	`modelId` varchar(100) DEFAULT 'lucid-v1-medium',
	`samplingParams` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `stories_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `story_characters` (
	`id` int AUTO_INCREMENT NOT NULL,
	`storyId` int NOT NULL,
	`name` varchar(200) NOT NULL,
	`description` text,
	`orderIndex` int DEFAULT 0,
	CONSTRAINT `story_characters_id` PRIMARY KEY(`id`)
);
