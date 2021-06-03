const API_BASE = 'https://discord.com/api/v9'

export async function getAccessToken(code: string): Promise<Response> {
  let oauth_req = {
    client_id: OAUTH2_CLIENT_ID,
    client_secret: OAUTH2_CLIENT_SECRET,
    grant_type: 'authorization_code',
    code: code,
    redirect_uri: REDIRECT_URI,
  }

  let data = new URLSearchParams(oauth_req)

  return await fetch(`${API_BASE}/oauth2/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: data,
  })
}

export async function getUserGuilds(access_token: string): Promise<string[]> {
  let guildsReq = await fetch(`${API_BASE}/users/@me/guilds`, {
    headers: {
      Authorization: `Bearer ${access_token}`,
    },
  })

  if (guildsReq.status !== 200) {
    throw Error('Could not fetch user guilds.')
  }

  let guilds: string[] = []

  for (var guild of await guildsReq.json()) {
    guilds.push(guild['id'])
  }

  return guilds
}

export async function getUserDetails(
  access_token: string,
): Promise<Record<string, any>> {
  let details = await fetch(`${API_BASE}/users/@me`, {
    headers: {
      Authorization: `Bearer ${access_token}`,
    },
  })

  return await details.json()
}

export async function joinUserToGuild(
  access_token: string,
  user_id: string,
): Promise<number> {
  let payload = {
    access_token: access_token,
  }

  let req = await fetch(
    `${API_BASE}/guilds/${DISCORD_GUILD_ID}/members/${user_id}`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bot ${DISCORD_BOT_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    },
  )

  return req.status
}

export async function revokeToken(access_token: string): Promise<Response> {
  let oauth_req = {
    token: access_token,
    token_type_hint: 'access_token',
  }

  let data = new URLSearchParams(oauth_req)

  let creds = btoa(`${OAUTH2_CLIENT_ID}:${OAUTH2_CLIENT_SECRET}`)

  return await fetch(`${API_BASE}/oauth2/token/revoke`, {
    method: 'POST',
    body: data,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${creds}`,
    },
  })
}
