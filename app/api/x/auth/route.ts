import { NextRequest, NextResponse } from 'next/server'
import { randomBytes, createHash } from 'crypto'

// X OAuth 2.0 PKCE — Authorization Code Flow
// Required env vars: X_CLIENT_ID, NEXT_PUBLIC_NEAR_NETWORK
// Scopes: tweet.read users.read follows.write follows.read dm.write dm.read offline.access

const X_AUTH_URL = 'https://twitter.com/i/oauth2/authorize'

const SCOPES = [
  'tweet.read',
  'users.read',
  'follows.write',
  'follows.read',
  'dm.write',
  'dm.read',
  'offline.access', // enables refresh tokens
].join(' ')

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const campaign_id = searchParams.get('campaign_id')

  if (!campaign_id) {
    return NextResponse.json({ error: 'campaign_id required' }, { status: 400 })
  }

  const clientId = process.env.X_CLIENT_ID
  if (!clientId) {
    return NextResponse.json({ error: 'X_CLIENT_ID not configured' }, { status: 500 })
  }

  // PKCE: generate code_verifier and code_challenge
  const codeVerifier = randomBytes(64).toString('base64url')
  const codeChallenge = createHash('sha256')
    .update(codeVerifier)
    .digest('base64url')

  // State encodes campaign_id for retrieval on callback
  // Format: campaign_id:random_nonce (prevents CSRF)
  const nonce = randomBytes(16).toString('hex')
  const state = Buffer.from(JSON.stringify({ campaign_id, nonce })).toString('base64url')

  const callbackUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'https://near-launchpad.com'}/api/x/callback`

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: clientId,
    redirect_uri: callbackUrl,
    scope: SCOPES,
    state,
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
  })

  const authUrl = `${X_AUTH_URL}?${params.toString()}`

  // Store code_verifier in a secure httpOnly cookie (valid 10 minutes)
  const response = NextResponse.redirect(authUrl)
  response.cookies.set('x_cv', codeVerifier, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    maxAge: 600,
    path: '/api/x/callback',
  })
  response.cookies.set('x_state', state, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    maxAge: 600,
    path: '/api/x/callback',
  })

  return response
}
