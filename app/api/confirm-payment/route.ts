import { NextRequest, NextResponse } from 'next/server'

const WEBHOOK_URL = process.env.WEBHOOK_URL ?? ''

export async function POST(req: NextRequest) {
  const body = await req.json()
  const res = await fetch(
    WEBHOOK_URL.replace(/\/intake$/, '/confirm-payment'),
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }
  )
  const data = await res.json()
  return NextResponse.json(data, { status: res.status })
}