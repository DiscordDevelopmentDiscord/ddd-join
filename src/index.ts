import { getErrorPageHTML, Router } from '8track'
import { getAccessToken, getUserDetails, getUserGuilds, joinUserToGuild, revokeToken } from './oauth2'
import { DiscordAPIError } from './util'

const router = new Router()

const WHITELISTED_GUILDS = ['813988123260092416', '667560445975986187']

const LANDING_URL = 'https://discord.com/channels/844686108125429801/846770612110229544/846902287728640000'

router.get`/`.handle((ctx) => {
	const authURL = new URL(`https://discord.com/oauth2/authorize`)

	authURL.searchParams.set('client_id', OAUTH2_CLIENT_ID)
	authURL.searchParams.set('redirect_uri', REDIRECT_URI)
	authURL.searchParams.set('response_type', 'code')
	authURL.searchParams.set('scope', 'identify guilds guilds.join')
	authURL.searchParams.set('prompt', 'none')

	ctx.end(
		new Response('Redirecting...', {
			status: 302,
			headers: {
				location: authURL.toString(),
			},
		}),
	)
})

router.get`/callback`.handle(async (ctx) => {
	const url = new URL(ctx.event.request.url)
	const code = url.searchParams.get('code')

	if (!code) {
		return ctx.end('Missing authorization code', { status: 400 })
	}

	try {
		const accessTokenReq = await getAccessToken(code)
		const accessTokenBody = await accessTokenReq[0]
		const accessToken = accessTokenBody['access_token']
		const userGuilds = await getUserGuilds(accessToken)

		if (!userGuilds.some((x) => WHITELISTED_GUILDS.includes(x)))
			return ctx.end('You are not authorized to join DDD.', { status: 403 })

		const userDetails = await getUserDetails(accessToken)
		const joinUserToGuildStatus = (await (await joinUserToGuild(accessToken, userDetails.id))[1]).status
		const revokeUserTokenResponse = await (await revokeToken(accessToken))[1]

		if (!revokeUserTokenResponse.ok)
			return ctx.end(
				`An unexpected error occurred while joining you to the guild. Your authorization token could not be revoked, you can do so in your Discord client under User Settings > Authorized Apps`,
			)

		if (joinUserToGuildStatus === 201 || joinUserToGuildStatus === 204) {
			return ctx.end(`Redirecting...`, {
				status: 302,
				headers: {
					location: LANDING_URL,
				},
			})
		}
	} catch (e) {
		if (e instanceof DiscordAPIError) return ctx.end(e.message, { status: e.status })
		return ctx.end(e.message, { status: 500 })
	}
})

router.all`(.*)`.handle((ctx) => ctx.end('Not found', { status: 404 }))

addEventListener('fetch', (e) => {
	const res = router.getResponseForEvent(e).catch(
		(error) =>
			new Response(getErrorPageHTML(e.request, error), {
				status: 500,
				headers: {
					'content-type': 'text/html',
				},
			}),
	)

	e.respondWith(res as any)
})
