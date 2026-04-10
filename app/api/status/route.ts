import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const campaignId = req.nextUrl.searchParams.get('campaign_id')

  if (!campaignId || !/^[0-9a-f-]{36}$/.test(campaignId)) {
    return NextResponse.json({ error: 'Invalid campaign_id' }, { status: 400 })
  }

  const webhookUrl = process.env.WEBHOOK_URL
  if (!webhookUrl) {
    return NextResponse.json({ error: 'Webhook not configured' }, { status: 503 })
  }

  const statusUrl = webhookUrl.replace(/\/intake$/, `/status?campaign_id=${campaignId}`)

  try {
    const res = await fetch(statusUrl, {
      signal: AbortSignal.timeout(8000),
    })
    if (!res.ok) {
      return NextResponse.json({ error: `Pi returned ${res.status}` }, { status: 502 })
    }
    const data = await res.json()
    return NextResponse.json(data)
  } catch (err) {
    console.error('[status] error:', err)
    return NextResponse.json({ error: 'Could not reach campaign node' }, { status: 502 })
  }
}