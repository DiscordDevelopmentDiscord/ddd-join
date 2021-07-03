import { CONSTANTS, HTTPMethods, makeRequest, UTILS } from './util';
import {
	Snowflake,
	APIGuildMember,
	OAuth2Routes,
	Routes,
	RESTGetAPICurrentUserGuildsResult,
	RESTGetAPICurrentUserResult,
	RESTPostOAuth2AccessTokenResult,
	RouteBases,
} from 'discord-api-types/v8';

export async function getAccessToken(code: string) {
	const body = new URLSearchParams({
		client_id: OAUTH2_CLIENT_ID,
		client_secret: OAUTH2_CLIENT_SECRET,
		grant_type: 'authorization_code',
		code,
		redirect_uri: REDIRECT_URI,
	});

	return makeRequest<RESTPostOAuth2AccessTokenResult>(OAuth2Routes.tokenURL, {
		method: HTTPMethods.Post,
		headers: CONSTANTS.headers.urlencoded,
		body,
	});
}

export async function getUserGuilds(access_token: string): Promise<string[]> {
	const guildsReq = await makeRequest<RESTGetAPICurrentUserGuildsResult>(RouteBases.api + Routes.userGuilds(), {
		headers: UTILS.auth(access_token),
	});
	const guilds = await guildsReq[0];
	return guilds.map((x) => x.id);
}

export async function getUserDetails(access_token: string) {
	return makeRequest<RESTGetAPICurrentUserResult>(RouteBases.api + Routes.user(), {
		headers: UTILS.auth(access_token),
	}).then((x) => x[0]);
}

export async function joinUserToGuild(access_token: string, user_id: Snowflake) {
	return makeRequest<APIGuildMember | Record<never, never>>(RouteBases.api + Routes.guildMember(DISCORD_GUILD_ID, user_id), {
		method: HTTPMethods.Put,
		headers: {
			...CONSTANTS.headers.json,
			...UTILS.auth(DISCORD_BOT_TOKEN, 'Bot'),
		},
		body: JSON.stringify({ access_token }),
	});
}

export async function revokeToken(access_token: string) {
	const body = new URLSearchParams({
		token: access_token,
		token_type_hint: 'access_token',
	});
	const creds = btoa(`${OAUTH2_CLIENT_ID}:${OAUTH2_CLIENT_SECRET}`);

	return makeRequest(OAuth2Routes.tokenRevocationURL, {
		method: HTTPMethods.Post,
		headers: {
			...CONSTANTS.headers.urlencoded,
			...UTILS.auth(creds, 'Basic'),
		},
		body,
	});
}
