import { Snowflake } from 'discord-api-types/v8';

declare global {
	const OAUTH2_CLIENT_ID: Snowflake;
	const OAUTH2_CLIENT_SECRET: string;
	const DISCORD_BOT_TOKEN: string;
	const DISCORD_GUILD_ID: Snowflake;
	const REDIRECT_URI: string;
}

export {};
