export const CONSTANTS = {
	headers: {
		urlencoded: {
			'content-type': 'application/x-www-form-urlencoded',
		},
		json: {
			'content-type': 'application/json',
		},
	},
};

export const UTILS = {
	auth: (token: string, type = 'Bearer') => ({
		authorization: `${type} ${token}`,
	}),
};

export async function makeRequest<T extends Record<string, any>>(
	route: string,
	options: RequestInit,
): makeRequestResponseTuple<T> {
	const req = await fetch(route, options);
	if (!req.ok) {
		const parseErrorResponseBody = await req.json().catch(() => ({}));
		throw new DiscordAPIError(parseErrorResponseBody.message, options.method!, route, req.status);
	}

	return [
		(await req
			.clone()
			.json()
			.catch(() => ({}))) as Promise<T>,
		req,
	];
}

export class DiscordAPIError extends Error {
	public constructor(msg: string, public method: string, public path: string, public status: number) {
		super(`[DiscordAPIERR:${status}:${method.toUpperCase()}] ${path} - ${msg}`);
	}
}

export type makeRequestResponseTuple<T> = Promise<[Promise<T>, Response]>;

export const enum HTTPMethods {
	Post = 'post',
	Delete = 'delete',
	Get = 'get',
	Patch = 'patch',
	Put = 'put',
}
