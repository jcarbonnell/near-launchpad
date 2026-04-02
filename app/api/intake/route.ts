import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get('content-type') || ''
    let github_url = '', founder_email = '', tier = '', wallet_id = ''
    let csvArrayBuffer: ArrayBuffer | null = null
    let csvFilename = ''

    let formData: FormData | null = null
    if (contentType.includes('multipart/form-data')) {
      formData = await req.formData()
      github_url    = formData.get('github_url') as string || ''
      founder_email = formData.get('founder_email') as string || ''
      tier          = formData.get('tier') as string || ''
      wallet_id     = formData.get('wallet_id') as string || ''
      const csvFiles: File[] = []
      for (let i = 0; i < 10; i++) {
        const f = formData.get(`contacts_csv_${i}`) as File | null
        if (f && f.size > 0) csvFiles.push(f)
      }
      if (csvFiles.length > 0) {
        csvArrayBuffer = await csvFiles[0].arrayBuffer()
        csvFilename = csvFiles[0].name
      }
    } else {
      const body = await req.json()
      github_url    = body.github_url || ''
      founder_email = body.founder_email || ''
      tier          = body.tier || ''
      wallet_id     = body.wallet_id || ''
    }

    if (!github_url || !founder_email || !tier) {
      return NextResponse.json(
        { error: 'Missing required fields: github_url, founder_email, tier' },
        { status: 400 }
      )
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(founder_email)) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 })
    }
    if (!github_url.startsWith('https://github.com/')) {
      return NextResponse.json({ error: 'URL must be a GitHub repository' }, { status: 400 })
    }
    if (csvArrayBuffer && csvArrayBuffer.byteLength > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'CSV file too large (max 10MB)' }, { status: 400 })
    }

    const ref = `NL-${Date.now().toString(36).toUpperCase()}`
    const webhookUrl = process.env.WEBHOOK_URL

    if (!webhookUrl) {
      console.log('[intake] webhook not configured:', { github_url, founder_email, tier, ref })
      return NextResponse.json({
        success: true,
        message: 'Intake received. We will contact you within 24 hours.',
        ref,
      })
    }

    const fd = new FormData()
    fd.append('github_url', github_url)
    fd.append('founder_email', founder_email)
    fd.append('tier', tier)
    fd.append('wallet_id', wallet_id)
    fd.append('ref', ref)
    fd.append('submitted_at', new Date().toISOString())
    fd.append('source', 'near-launchpad.com')

    if (formData) {
      for (let i = 0; i < 10; i++) {
        const f = formData.get(`contacts_csv_${i}`) as File | null
        if (!f || f.size === 0) break
        const buf = await f.arrayBuffer()
        fd.append(`contacts_csv_${i}`, new Blob([new Uint8Array(buf)], { type: 'text/csv' }), f.name)
      }
    }

    const piRes = await fetch(webhookUrl, {
      method: 'POST',
      body: fd,
      signal: AbortSignal.timeout(15000),
    })

    if (!piRes.ok) throw new Error(`Pi webhook returned ${piRes.status}`)

    return NextResponse.json({
      success: true,
      message: 'Campaign intake received. Processing will begin shortly.',
      ref,
      csv_included: !!csvArrayBuffer,

    })
  } catch (err) {
    console.error('[intake] error:', err)
    return NextResponse.json(
      { error: 'Internal error. Please try again or email near-launchpad@near.email.' },
      { status: 500 }
    )
  }
}
