'use client'
import { useState } from 'react'
import styles from './OnboardingForm.module.css'

const TIERS = [
  {
    id: 'curious',
    name: 'Curious',
    price: '$30',
    near: '~30 NEAR',
    leads: '50 emails/day',
    days: '7 days',
    desc: 'Up to 350 contacts. First outreach only. Go/no-go verdict by email.',
  },
  {
    id: 'confident',
    name: 'Confident',
    price: '$200',
    near: '~200 NEAR',
    leads: '100 emails/day + LinkedIn + X outreach',
    days: '14 days',
    desc: 'Up to 1,000 contacts. 3-step sequence. A/B testing ICP variants. Priority support.',
    featured: true,
  },
  {
    id: 'determined',
    name: 'Determined',
    price: 'Custom',
    near: 'Contact us',
    leads: 'Unlimited',
    days: 'Monthly',
    desc: 'Continuous Business Development. Email + LinkedIn + X. Payment channel. Dedicated ICP tuning.',
  },
]

type Step = 'tier' | 'details' | 'success'

export default function OnboardingForm() {
  const [step, setStep] = useState<Step>('tier')
  const [tier, setTier] = useState('confident')
  const [form, setForm] = useState({ github_url: '', founder_email: '' })
  const [csvFile, setCsvFile] = useState<File | null>(null)
  const [walletId, setWalletId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [ref, setRef] = useState('')

  async function connectWallet() {
    // Placeholder — full wallet selector integration in v2
    const id = prompt('Enter your NEAR account ID (e.g. yourname.near):')
    if (id && id.endsWith('.near')) {
      setWalletId(id)
    } else if (id) {
      alert('Please enter a valid .near account ID')
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (tier === 'determined') {
      window.location.href = 'mailto:near-launchpad@near.email?subject=Determined Tier Inquiry'
      return
    }
    setLoading(true)
    setError('')
    try {
      const fd = new FormData()
      fd.append('github_url', form.github_url)
      fd.append('founder_email', form.founder_email)
      fd.append('tier', tier)
      if (walletId) fd.append('wallet_id', walletId)
      if (csvFile) fd.append('contacts_csv', csvFile)

      const res = await fetch('/api/intake', {
        method: 'POST',
        body: fd,
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Submission failed')
      setRef(data.ref)
      setStep('success')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section id="launch" className={styles.section}>
      <div className={styles.container}>
        <p className="section-label">Launch your campaign</p>
        <h2 className={styles.heading}>Start validating your MVP today</h2>
        <p className={styles.sub}>
          Payment in NEAR. Campaign starts within 24 hours. Traction report delivered at deadline.
        </p>

        {step === 'success' ? (
          <div className={styles.success}>
            <div className={styles.successIcon}>✓</div>
            <h3 className={styles.successTitle}>Intake received</h3>
            <p className={styles.successSub}>
              Reference: <span className="mono green">{ref}</span>
            </p>
            <p className={styles.successBody}>
              Your campaign will start within 24 hours. You will receive a confirmation at {form.founder_email}.
              Track your traction report via{' '}
              <a href="mailto:near-launchpad@near.email">near-launchpad@near.email</a>.
            </p>
          </div>
        ) : (
          <div className={styles.formWrap}>
            {/* Tier selector */}
            <div className={styles.tiers}>
              {TIERS.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTier(t.id)}
                  className={`${styles.tierCard} ${tier === t.id ? styles.tierSelected : ''} ${t.featured ? styles.tierFeatured : ''}`}
                >
                  {t.featured && <span className={styles.tierBadge}>Popular</span>}
                  <div className={styles.tierName}>{t.name}</div>
                  <div className={styles.tierPrice}>{t.price}</div>
                  <div className={styles.tierNear}>{t.near}</div>
                  <div className={styles.tierMeta}>
                    <span>{t.leads}</span>
                    <span>·</span>
                    <span>{t.days}</span>
                  </div>
                  <div className={styles.tierDesc}>{t.desc}</div>
                </button>
              ))}
            </div>

            {/* Form */}
            <form className={styles.form} onSubmit={handleSubmit}>
              <div className={styles.field}>
                <label className={styles.label}>GitHub repository URL</label>
                <div className={styles.inputWrap}>
                  <span className={styles.inputPrefix}>$</span>
                  <input
                    type="url"
                    className={styles.input}
                    placeholder="https://github.com/you/your-mvp"
                    value={form.github_url}
                    onChange={e => setForm(f => ({ ...f, github_url: e.target.value }))}
                    required
                    disabled={loading}
                  />
                </div>
                <p className={styles.hint}>Must be a public repository with a README</p>
              </div>

              <div className={styles.field}>
                <label className={styles.label}>Your email — leads will reply here</label>
                <div className={styles.inputWrap}>
                  <span className={styles.inputPrefix}>@</span>
                  <input
                    type="email"
                    className={styles.input}
                    placeholder="you@yourcompany.com"
                    value={form.founder_email}
                    onChange={e => setForm(f => ({ ...f, founder_email: e.target.value }))}
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <div className={styles.field}>
                <label className={styles.label}>
                  Contact list <span className="muted">(optional — CSV from LinkedIn, X, or custom)</span>
                </label>
                <div
                  className={`${styles.csvDrop} ${csvFile ? styles.csvDropFilled : ''}`}
                  onDragOver={e => e.preventDefault()}
                  onDrop={e => {
                    e.preventDefault()
                    const file = e.dataTransfer.files[0]
                    if (file && file.name.endsWith('.csv')) setCsvFile(file)
                  }}
                >
                  {csvFile ? (
                    <div className={styles.csvFileInfo}>
                      <span className={styles.csvIcon}>✓</span>
                      <span className="mono">{csvFile.name}</span>
                      <span className={styles.csvSize}>({(csvFile.size / 1024).toFixed(0)} KB)</span>
                      <button
                        type="button"
                        className={styles.csvRemove}
                        onClick={() => setCsvFile(null)}
                      >✕</button>
                    </div>
                  ) : (
                    <label className={styles.csvLabel}>
                      <input
                        type="file"
                        accept=".csv"
                        className={styles.csvInput}
                        onChange={e => setCsvFile(e.target.files?.[0] ?? null)}
                        disabled={loading}
                      />
                      <span className={styles.csvPrompt}>
                        Drop your .csv here or <span className="green">browse</span>
                      </span>
                      <span className={styles.csvHint}>
                        Accepts LinkedIn exports, email lists, or any CSV with email column.
                        Your contacts get priority — the rest are filled from our 177k+ base.
                      </span>
                    </label>
                  )}
                </div>
              </div>

              <div className={styles.field}>
                <label className={styles.label}>
                  NEAR wallet <span className="muted">(optional for now — required for payment)</span>
                </label>
                {walletId ? (
                  <div className={styles.walletConnected}>
                    <span className={styles.walletDot} />
                    <span className="mono">{walletId}</span>
                    <button
                      type="button"
                      className={styles.walletDisconnect}
                      onClick={() => setWalletId(null)}
                    >
                      disconnect
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    className={styles.walletBtn}
                    onClick={connectWallet}
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M13 4H3C2.45 4 2 4.45 2 5V11C2 11.55 2.45 12 3 12H13C13.55 12 14 11.55 14 11V5C14 4.45 13.55 4 13 4Z" stroke="currentColor" strokeWidth="1.2" fill="none"/>
                      <circle cx="11" cy="8" r="1.2" fill="currentColor"/>
                    </svg>
                    Connect NEAR wallet
                  </button>
                )}
              </div>

              {error && <p className={styles.error}>{error}</p>}

              <button
                type="submit"
                className={styles.submit}
                disabled={loading}
              >
                {loading ? (
                  <span className={styles.spinner}>Processing...</span>
                ) : tier === 'determined' ? (
                  'Contact us for pricing →'
                ) : (
                  `Launch ${TIERS.find(t => t.id === tier)?.name} campaign →`
                )}
              </button>

              <p className={styles.legal}>
                By submitting you agree that outreach is sent on your behalf from{' '}
                <span className="mono">near-launchpad@near.email</span>.
                All lead data is processed on sovereign hardware. No third-party CRM.
              </p>
            </form>
          </div>
        )}
      </div>
    </section>
  )
}
