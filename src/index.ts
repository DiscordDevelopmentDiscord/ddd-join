import { getErrorPageHTML, Router } from '8track'
import {
  getAccessToken,
  getUserDetails,
  getUserGuilds,
  joinUserToGuild,
  revokeToken,
} from './oauth2'

const router = new Router()

const WHITELISTED_GUILDS = ['813988123260092416', '667560445975986187']

const LANDING_URL =
  'https://discord.com/channels/844686108125429801/846770612110229544/846902287728640000'

router.get`/`.handle((ctx) => {
  let auth_url = new URL(`https://discord.com/oauth2/authorize`)

  auth_url.searchParams.set('client_id', OAUTH2_CLIENT_ID)
  auth_url.searchParams.set('redirect_uri', REDIRECT_URI)
  auth_url.searchParams.set('response_type', 'code')
  auth_url.searchParams.set('scope', 'identify guilds guilds.join')
  auth_url.searchParams.set('prompt', 'none')

  ctx.end(
    new Response('Redirecting...', {
      status: 302,
      headers: {
        Location: auth_url.toString(),
      },
    }),
  )
})

router.get`/callback`.handle(async (ctx) => {
  let url = new URL(ctx.event.request.url)
  let code = url.searchParams.get('code')

  if (!code) {
    return ctx.end('Missing authorization code', { status: 400 })
  }

  let accessTokenResp = await getAccessToken(code)

  if (accessTokenResp.status !== 200) {
    return ctx.end(
      `${
        accessTokenResp.status
      } error from Discord: ${await accessTokenResp.text()}`,
      { status: 400 },
    )
  }

  let accessToken = (await accessTokenResp.json())['access_token']

  let userGuilds = await getUserGuilds(accessToken)

  let isAllowed = false

  for (var guild of WHITELISTED_GUILDS) {
    if (userGuilds.indexOf(guild) !== -1) {
      isAllowed = true
    }
  }

  if (!isAllowed) {
    return ctx.end('You are not authorized to join DDD.', { status: 403 })
  }

  let userDetails = await getUserDetails(accessToken)

  let joinCode = await joinUserToGuild(accessToken, userDetails['id'])

  let revokeResponse = await revokeToken(accessToken)

  let msg = ''

  if (revokeResponse.status !== 200) {
    msg =
      ' Your authorization token could not be revoked, you can do so in your Discord client under User Settings > Authorized Apps'
  }

  if (joinCode === 201 || joinCode === 204) {
    return ctx.end(`Redirecting...`, {
      status: 302,
      headers: {
        Location: LANDING_URL,
      },
    })
  } else {
    return ctx.end(
      `An unexpected error occurred while joining you to the guild.${msg}`,
    )
  }
})

router.all`(.*)`.handle((ctx) => ctx.end('Not found', { status: 404 }))

addEventListener('fetch', e => {
  const res = router.getResponseForEvent(e).catch(
    error =>
      new Response(getErrorPageHTML(e.request, error), {
        status: 500,
        headers: {
          'Content-Type': 'text/html',
        },
      }),
  )

  e.respondWith(res as any)
})
