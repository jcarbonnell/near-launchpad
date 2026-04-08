import { NextRequest, NextResponse } from 'next/server'

// X OAuth 2.0 PKCE callback
// Exchanges authorization code for access + refresh tokens
// Sends encrypted tokens to Pi via Cloudflare Tunnel (/x-auth)

const X_TOKEN_URL = 'https://api.twitter.com/2/oauth2/token'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const code = searchParams.get('code')
  const state = searchParams.get('state')
  const error = searchParams.get('error')

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://near-launchpad.com'

  // User denied authorization
  if (error) {
    return NextResponse.redirect(`${baseUrl}/?x_error=${encodeURIComponent(error)}`)
  }

  if (!code || !state) {
    return NextResponse.redirect(`${baseUrl}/?x_error=missing_params`)
  }

  // Validate state matches stored cookie
  const storedState = req.cookies.get('x_state')?.value
  if (!storedState || storedState !== state) {
    return NextResponse.redirect(`${baseUrl}/?x_error=invalid_state`)
  }

  // Decode campaign_id from state
  let campaign_id: string
  try {
    const decoded = JSON.parse(Buffer.from(state, 'base64url').toString())
    campaign_id = decoded.campaign_id
    if (!campaign_id) throw new Error('no campaign_id')
  } catch {
    return NextResponse.redirect(`${baseUrl}/?x_error=invalid_state`)
  }

  // Retrieve code_verifier from cookie
  const codeVerifier = req.cookies.get('x_cv')?.value
  if (!codeVerifier) {
    return NextResponse.redirect(`${baseUrl}/?x_error=verifier_expired`)
  }

  const clientId = process.env.X_CLIENT_ID
  const clientSecret = process.env.X_CLIENT_SECRET
  const callbackUrl = `${baseUrl}/api/x/callback`

  if (!clientId || !clientSecret) {
    return NextResponse.redirect(`${baseUrl}/?x_error=not_configured`)
  }

  // Exchange code for tokens
  let tokenData: {
    access_token: string
    refresh_token?: string
    expires_in: number
    token_type: string
  }

  try {
    const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64')
    const tokenRes = await fetch(X_TOKEN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${basicAuth}`,
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: callbackUrl,
        code_verifier: codeVerifier,
      }),
    })

    if (!tokenRes.ok) {
      const err = await tokenRes.text()
      console.error('[x/callback] token exchange failed:', err)
      return NextResponse.redirect(`${baseUrl}/?x_error=token_exchange_failed`)
    }

    tokenData = await tokenRes.json()
  } catch (err) {
    console.error('[x/callback] fetch error:', err)
    return NextResponse.redirect(`${baseUrl}/?x_error=network_error`)
  }

  // Fetch X user info to get x_handle
  let x_handle = ''
  let x_account_id = ''
  try {
    const meRes = await fetch('https://api.twitter.com/2/users/me', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    })
    if (meRes.ok) {
      const me = await meRes.json()
      x_handle = me.data?.username || ''
      x_account_id = me.data?.id || ''
    }
  } catch {
    // non-fatal — handle stored as empty
  }

  // Calculate token expiry
  const expiresAt = new Date(Date.now() + tokenData.expires_in * 1000).toISOString()

  // Send to Pi for encrypted storage
  const webhookUrl = process.env.WEBHOOK_URL?.replace('/intake', '/x-auth')
  if (!webhookUrl) {
    console.error('[x/callback] WEBHOOK_URL not configured')
    return NextResponse.redirect(`${baseUrl}/?x_error=webhook_not_configured`)
  }

  try {
    const piRes = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        campaign_id,
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token || '',
        expires_at: expiresAt,
        x_handle,
        x_account_id,
      }),
      signal: AbortSignal.timeout(10000),
    })

    if (!piRes.ok) {
      const err = await piRes.text()
      console.error('[x/callback] Pi webhook error:', err)
      return NextResponse.redirect(`${baseUrl}/?x_error=storage_failed`)
    }
  } catch (err) {
    console.error('[x/callback] Pi webhook unreachable:', err)
    return NextResponse.redirect(`${baseUrl}/?x_error=webhook_unreachable`)
  }

  // Clear PKCE cookies
  const successUrl = `${baseUrl}/?x_connected=true&handle=${encodeURIComponent(x_handle)}&campaign=${campaign_id}`
  const response = NextResponse.redirect(successUrl)
  response.cookies.delete('x_cv')
  response.cookies.delete('x_state')

  return response
}
