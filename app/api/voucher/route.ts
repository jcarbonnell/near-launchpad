import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { code } = await req.json()
    if (!code) return NextResponse.json({ valid: false, error: 'No code provided' })

    const webhookBase = (process.env.WEBHOOK_URL || '').replace(/\/intake\/?$/, '')
    const res = await fetch(`${webhookBase}/voucher`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: code.trim().toUpperCase() }),
      signal: AbortSignal.timeout(5000),
    })
    const data = await res.json()
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ valid: false, error: 'Validation failed' })
  }
}