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
    leads: '100 emails/day + X outreach',
    days: '14 days',
    desc: 'Up to 1,000 contacts. 3-step sequence. A/B testing Ideal Customer Profile variants. Priority support.',
    featured: true,
  },
  {
    id: 'determined',
    name: 'Determined',
    price: 'Custom',
    near: 'Contact us',
    leads: 'Unlimited',
    days: 'Monthly',
    desc: 'Continuous Business Development. Enriched Email + X outreach + Social Media content automation. Payment channel. Dedicated Ideal Customer Profile tuning.',
  },
]

type Step = 'tier' | 'details' | 'success'

export default function OnboardingForm() {
  const [step, setStep] = useState<Step>('tier')
  const [tier, setTier] = useState('confident')
  const [form, setForm] = useState({ github_url: '', founder_email: '' })
  const [csvFiles, setCsvFiles] = useState<File[]>([])
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
    setLoading(true)
    setError('')
    try {
      const fd = new FormData()
      fd.append('github_url', form.github_url)
      fd.append('founder_email', form.founder_email)
      fd.append('tier', tier)
      if (walletId) fd.append('wallet_id', walletId)
      csvFiles.forEach((f, i) => fd.append(`contacts_csv_${i}`, f))

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
                  Contact list <span className="muted">(optional — Google contacts, mailbox data export... or custom)</span>
                </label>
                <div
                  className={`${styles.csvDrop} ${csvFiles ? styles.csvDropFilled : ''}`}
                  onDragOver={e => e.preventDefault()}
                  onDrop={e => {
                    e.preventDefault()
                    const files = Array.from(e.dataTransfer.files).filter(f => f.name.endsWith('.csv'))
                    if (files.length > 0) setCsvFiles(prev => [...prev, ...files])
                  }}
                >
                  {csvFiles.length > 0 ? (
                    <div className={styles.csvFileInfo}>
                      <span className={styles.csvIcon}>✓</span>
                      <span className="mono">{csvFiles.length} file{csvFiles.length > 1 ? 's' : ''} selected</span>
                      <span className={styles.csvSize}>({csvFiles.map(f => f.name).join(', ')})</span>
                      <button
                        type="button"
                        className={styles.csvRemove}
                        onClick={() => setCsvFiles([])}
                      >✕</button>
                    </div>
                  ) : (
                    <label className={styles.csvLabel}>
                      <input
                        type="file"
                        accept=".csv"
                        multiple
                        className={styles.csvInput}
                        onChange={e => setCsvFiles(Array.from(e.target.files ?? []))}
                        disabled={loading}
                      />
                      <span className={styles.csvPrompt}>
                        Drop your .csv here or <span className="green">browse</span>
                      </span>
                      <span className={styles.csvHint}>
                        For best reply rates, upload your own contacts as CSV. 
                        Your contacts get priority over our 177k+ database: people who already know you convert better.
                      </span>
                    </label>
                  )}
                </div>
              </div>

              <div className={styles.field}>
                <label className={styles.label}>
                  NEAR wallet <span className="muted">(required for payment)</span>
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

              {/* X account connect — Convinced and Determined tiers only */}
              {(tier === 'convinced' || tier === 'determined') && (
                <div className={styles.field}>
                  <label className={styles.label}>
                    X account <span className="muted">(required for X outreach)</span>
                  </label>
                  <p className={styles.hint}>
                    Authorise the Launchpad to follow and DM leads on your behalf.
                    You can do this after submitting if you prefer.
                  </p>
                  <a
                    href={`/api/x/auth?campaign_id=pending`}
                    className={styles.walletBtn}
                    style={{ display: 'inline-flex', textDecoration: 'none' }}
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                      <path d="M12.6 2H14.7L10.1 7.3L15.5 14H11.3L8.1 9.8L4.4 14H2.3L7.2 8.4L2 2H6.3L9.2 5.8L12.6 2ZM11.9 12.8H13.1L5.7 3.2H4.4L11.9 12.8Z"/>
                    </svg>
                    Connect X account →
                  </a>
                </div>
              )}

              {error && <p className={styles.error}>{error}</p>}

              {tier === 'determined' ? (
                <a
                  href="mailto:near-launchpad@near.email?subject=Determined%20Plan%20Inquiry&body=Hi%2C%0A%0AI%27m%20interested%20in%20the%20Determined%20plan.%0A%0AProject%3A%20%5Byour%20GitHub%20URL%5D%0ABudget%3A%20%5Byour%20budget%5D%0ATeam%20size%3A%20%5Byour%20team%20size%5D%0A%0ATell%20us%20more%20about%20your%20project%3A"
                  className={styles.submit}
                  style={{ textAlign: 'center', display: 'block', textDecoration: 'none' }}
                >
                  Contact us for pricing →
                </a>
              ) : (
                <button
                  type="submit"
                  className={styles.submit}
                  disabled={loading}
                >
                  {loading ? (
                    <span className={styles.spinner}>Processing...</span>
                  ) : (
                    `Launch ${TIERS.find(t => t.id === tier)?.name} campaign →`
                  )}
                </button>
              )}

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