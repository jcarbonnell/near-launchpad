import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    // Validate required fields
    const { github_url, founder_email, tier, wallet_id } = body
    if (!github_url || !founder_email || !tier) {
      return NextResponse.json(
        { error: 'Missing required fields: github_url, founder_email, tier' },
        { status: 400 }
      )
    }

    // Basic email validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(founder_email)) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 })
    }

    // Basic GitHub URL validation
    if (!github_url.startsWith('https://github.com/')) {
      return NextResponse.json({ error: 'URL must be a GitHub repository' }, { status: 400 })
    }

    const webhookUrl = process.env.WEBHOOK_URL

    if (!webhookUrl) {
      // No webhook configured yet — log and return success
      // TODO: replace with actual webhook when Pi tunnel is set up
      console.log('[intake] webhook not configured, logging:', {
        github_url,
        founder_email,
        tier,
        wallet_id: wallet_id || null,
        submitted_at: new Date().toISOString(),
      })
      return NextResponse.json({
        success: true,
        message: 'Intake received. We will contact you within 24 hours.',
        ref: `NL-${Date.now().toString(36).toUpperCase()}`,
      })
    }

    // Forward to Pi webhook
    const piRes = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        github_url,
        founder_email,
        tier,
        wallet_id: wallet_id || null,
        submitted_at: new Date().toISOString(),
        source: 'near-launchpad.com',
      }),
      signal: AbortSignal.timeout(10000),
    })

    if (!piRes.ok) {
      throw new Error(`Pi webhook returned ${piRes.status}`)
    }

    const ref = `NL-${Date.now().toString(36).toUpperCase()}`

    return NextResponse.json({
      success: true,
      message: 'Campaign intake received. Processing will begin shortly.',
      ref,
    })
  } catch (err) {
    console.error('[intake] error:', err)
    return NextResponse.json(
      { error: 'Internal error. Please try again or email near-launchpad@near.email.' },
      { status: 500 }
    )
  }
}
