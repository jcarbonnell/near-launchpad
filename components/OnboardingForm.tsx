'use client'
import { useState } from 'react'
import { useWallet } from './WalletProvider'
import styles from './OnboardingForm.module.css'
import CampaignStatus from './CampaignStatus'
import { saveCampaign } from './CampaignList'
import { actionCreators } from '@near-js/transactions'

const TIERS = [
  {
    id: 'curious',
    name: 'Curious',
    price: '$30',
    near: '30 NEAR',
    nearAmount: '30000000000000000000000000',
    leads: '50 leads/day',
    days: '7 days',
    desc: 'First outreach only. One ICP. Go/no-go verdict delivered by email.',
  },
  {
    id: 'confident',
    name: 'Confident',
    price: '$200',
    near: '200 NEAR',
    nearAmount: '200000000000000000000000000',
    leads: '100 leads/day',
    days: '14 days',
    desc: '3 batches of outreach. ICP variants A/B tested. Email + X sequences. Priority support.',
    featured: true,
  },
  {
    id: 'determined',
    name: 'Determined',
    price: 'Custom',
    near: 'Contact us',
    nearAmount: null,
    leads: 'Unlimited',
    days: 'Monthly',
    desc: 'Continuous Business Development. Enriched Email + X + Social Media. Payment channel.',
  },
]

type Step = 'tier' | 'details' | 'wallet' | 'success'

export default function OnboardingForm() {
  const { accountId, connecting, connect, disconnect, wallet } = useWallet()
  const [step, setStep] = useState<Step>('tier')
  const [tier, setTier] = useState('confident')
  const [form, setForm] = useState({ github_url: '', founder_email: '' })
  const [csvFiles, setCsvFiles] = useState<File[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [ref, setRef] = useState('')
  const [campaignId, setCampaignId] = useState<string | null>(null)
  const [txHash, setTxHash] = useState('')
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' })
  const [contactSent, setContactSent] = useState(false)
  const [voucher, setVoucher] = useState('')
  const [voucherValid, setVoucherValid] = useState(false)
  const [voucherError, setVoucherError] = useState('')
  const [voucherChecking, setVoucherChecking] = useState(false)

  const selectedTier = TIERS.find(t => t.id === tier)!

  function handleDetailsNext(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!form.github_url.startsWith('https://github.com/')) {
      setError('URL must be a GitHub repository (https://github.com/…)')
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.founder_email)) {
      setError('Please enter a valid email address')
      return
    }
    setStep('wallet')
  }

  function handleDeterminedClick() {
    setTier('determined')
    setStep('details')
  }

  async function handlePay() {
    if (!wallet || !accountId) return
    setLoading(true)
    setError('')
    try {
      const amount = voucherValid ? '1' : selectedTier.nearAmount!
      const outcome = await wallet!.signAndSendTransaction({
        receiverId: 'near-launchpad.near',
        actions: [
          actionCreators.transfer(BigInt(amount!))
        ],
      })
      const hash =
        (outcome as { transaction?: { hash?: string } })?.transaction?.hash ??
        (outcome as { transaction_outcome?: { id?: string } })?.transaction_outcome?.id ??
        'confirmed'
      setTxHash(hash)

      if (voucherValid) {
        await fetch('/api/voucher', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code: voucher.trim().toUpperCase(), redeem: true, wallet_id: accountId }),
        })
      }

      const res = await fetch('/api/intake', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          tier,
          wallet_id: accountId,
          tx_hash: hash,
          near_amount: voucherValid ? '1' : selectedTier.nearAmount,
          voucher_code: voucherValid ? voucher.trim().toUpperCase() : null,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Submission failed')
      setRef(data.ref)
      const cid = data.campaign_id || null
      setCampaignId(cid)
      if (cid) {
        saveCampaign({
          campaign_id: cid,
          product_name: form.github_url.replace('https://github.com/', '').split('/')[1] || 'Campaign',
          tier,
          submitted_at: new Date().toISOString(),
        })
        window.dispatchEvent(new StorageEvent('storage', { key: 'nl_campaigns' }))
      }
      setStep('success')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Transaction failed'
      if (msg.toLowerCase().includes('cancel') || msg.toLowerCase().includes('reject')) {
        setError('Transaction cancelled. Click "Pay and launch" when ready.')
      } else {
        setError(msg)
      }
    } finally {
      setLoading(false)
    }
  }

  async function checkVoucher() {
    if (!voucher.trim()) return
    setVoucherChecking(true)
    setVoucherError('')
    setVoucherValid(false)
    try {
      const res = await fetch('/api/voucher', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: voucher.trim().toUpperCase() }),
      })
      const data = await res.json()
      if (data.valid) setVoucherValid(true)
      else setVoucherError(data.error || 'Invalid code')
    } catch {
      setVoucherError('Validation failed — try again')
    } finally {
      setVoucherChecking(false)
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

        {step !== 'success' && (
          <div className={styles.stepper}>
            {[{key:'tier',label:'01 Tier'},{key:'details',label:'02 Details'},{key:'wallet',label:'03 Pay'}].map((s,i,arr) => (
              <div key={s.key} className={[
                styles.stepDot,
                step === s.key ? styles.stepActive : '',
                arr.findIndex(x => x.key === step) > i ? styles.stepDone : '',
              ].join(' ')}>
                <span className={styles.stepLabel}>{s.label}</span>
              </div>
            ))}
          </div>
        )}

        {step === 'success' && (
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
            {(tier === 'confident' || tier === 'determined') && campaignId && (
              <a
                href={`/api/x/auth?campaign_id=${campaignId}`}
                className={styles.walletBtn}
                style={{ display: 'inline-flex', textDecoration: 'none', marginTop: '16px' }}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M12.6 2H14.7L10.1 7.3L15.5 14H11.3L8.1 9.8L4.4 14H2.3L7.2 8.4L2 2H6.3L9.2 5.8L12.6 2ZM11.9 12.8H13.1L5.7 3.2H4.4L11.9 12.8Z"/>
                </svg>
                Connect your X account →
              </a>
            )}
            {(tier === 'confident' || tier === 'determined') && !campaignId && (
              <p className={styles.hint} style={{ marginTop: '12px' }}>
                To enable X outreach, email <a href="mailto:near-launchpad@near.email">near-launchpad@near.email</a> with your reference.
              </p>
            )}
            {campaignId && <CampaignStatus campaignId={campaignId} />}
          </div>
        )}

        {/* Step 1: Tier */}
        {step === 'tier' && (
          <div className={styles.formWrap}>
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

              <button className={styles.nextBtn} onClick={() => tier === 'determined' ? handleDeterminedClick() : setStep('details')}>
                {tier === 'determined' ? 'Contact us →' : `Continue with ${selectedTier.name} →`}
              </button>
            </div>
          )}

          {/* Step 2: Details */}
          {step === 'details' && tier === 'determined' && (
            <div className={styles.formWrap}>
              {contactSent ? (
                <p className={styles.hint}>✓ Message sent — we will get back to you within 24 hours.</p>
              ) : (
                <form className={styles.form} onSubmit={async e => {
                  e.preventDefault()
                  setLoading(true)
                  const formData = new FormData(e.target as HTMLFormElement)
                  formData.append('access_key', 'a4462a46-ca03-47a4-9e76-881bf0ae170f')
                  const response = await fetch('https://api.web3forms.com/submit', { method: 'POST', body: formData })
                  const data = await response.json()
                  setLoading(false)
                  if (data.success) setContactSent(true)
                  else setError('Something went wrong. Please email near-launchpad@near.email directly.')
                }}>
                  <div className={styles.field}>
                    <input className={styles.input} type="text" name="name" placeholder="Your name" required
                      value={contactForm.name} onChange={e => setContactForm(f => ({ ...f, name: e.target.value }))} />
                  </div>
                  <div className={styles.field}>
                    <input className={styles.input} type="email" name="email" placeholder="Your email" required
                      value={contactForm.email} onChange={e => setContactForm(f => ({ ...f, email: e.target.value }))} />
                  </div>
                  <div className={styles.field}>
                    <textarea className={styles.input} name="message" placeholder="Tell us about your project and what you need" rows={4} required
                      value={contactForm.message} onChange={e => setContactForm(f => ({ ...f, message: e.target.value }))} />
                  </div>
                  {error && <p className={styles.error}>{error}</p>}
                  <button type="submit" className={styles.nextBtn} disabled={loading}>
                    {loading ? 'Sending...' : 'Send message →'}
                  </button>
                  <button type="button" className={styles.backBtn} onClick={() => setStep('tier')}>← Back</button>
                </form>
              )}
            </div>
          )}

          {step === 'details' && tier !== 'determined' && (
            <div className={styles.formWrap}>
            <form className={styles.form} onSubmit={handleDetailsNext}>
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
                  Contact list <span className="muted">(optional — Google contacts, mailbox data...)</span>
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

              
        {error && <p className={styles.error}>{error}</p>}

              <button type="submit" className={styles.nextBtn}>
                Continue to payment →
              </button>
              <button type="button" className={styles.backBtn} onClick={() => setStep('tier')}>
                ← Back
              </button>
            </form>
            </div>
        )}

        {/* Step 3: Wallet + Pay */}
        {step === 'wallet' && (
          <div className={styles.formWrap}>

            {tier === 'determined' ? (
              <div className={styles.walletSection}>
                {contactSent ? (
                  <p className={styles.hint}>✓ Message sent — we will get back to you within 24 hours.</p>
                ) : (
                  <form onSubmit={async e => {
                    e.preventDefault()
                    setLoading(true)
                    const formData = new FormData(e.target as HTMLFormElement)
                    formData.append('access_key', 'a4462a46-ca03-47a4-9e76-881bf0ae170f')
                    const response = await fetch('https://api.web3forms.com/submit', {
                      method: 'POST',
                      body: formData,
                    })
                    const data = await response.json()
                    setLoading(false)
                    if (data.success) setContactSent(true)
                    else setError('Something went wrong. Please email near-launchpad@near.email directly.')
                  }}>
                    <div className={styles.field}>
                      <input className={styles.input} type="text" name="name" placeholder="Your name" required
                        value={contactForm.name} onChange={e => setContactForm(f => ({ ...f, name: e.target.value }))} />
                    </div>
                    <div className={styles.field}>
                      <input className={styles.input} type="email" name="email" placeholder="Your email" required
                        value={contactForm.email} onChange={e => setContactForm(f => ({ ...f, email: e.target.value }))} />
                    </div>
                    <div className={styles.field}>
                      <textarea className={styles.input} name="message" placeholder="Tell us about your project and what you need" rows={4} required
                        value={contactForm.message} onChange={e => setContactForm(f => ({ ...f, message: e.target.value }))} />
                    </div>
                    <button type="submit" className={styles.payBtn} disabled={loading}>
                      {loading ? 'Sending...' : 'Send message →'}
                    </button>
                  </form>
                )}
              </div>
            ) : (
              <>
                <div className={styles.paymentBox}>
                  <div className={styles.paymentRow}>
                    <span className={styles.paymentLabel}>Recipient</span>
                    <span className={`${styles.paymentValue} ${styles.mono}`}>near-launchpad.near</span>
                  </div>
                  <div className={styles.paymentRow}>
                    <span className={styles.paymentLabel}>Amount</span>
                    <span className={`${styles.paymentValue} ${styles.green}`}>{selectedTier.near}</span>
                  </div>
                  <div className={styles.paymentRow}>
                    <span className={styles.paymentLabel}>Repository</span>
                    <span className={styles.paymentValueSmall}>{form.github_url.replace('https://github.com/', '')}</span>
                  </div>
                  <div className={styles.paymentRow}>
                    <span className={styles.paymentLabel}>Report to</span>
                    <span className={styles.paymentValueSmall}>{form.founder_email}</span>
                  </div>
                  {tier === 'confident' && (
                    <div className={styles.paymentRow}>
                      <span className={styles.paymentLabel}>Voucher</span>
                      <span className={styles.paymentValueSmall} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <input
                          className={styles.input}
                          style={{ fontSize: '12px', padding: '4px 8px', width: '130px' }}
                          type="text"
                          placeholder="NL-XXXXXX"
                          value={voucher}
                          onChange={e => { setVoucher(e.target.value); setVoucherValid(false); setVoucherError('') }}
                          disabled={voucherValid}
                        />
                        {!voucherValid && (
                          <button type="button" className={styles.backBtn}
                            style={{ padding: '4px 10px', fontSize: '12px' }}
                            onClick={checkVoucher} disabled={voucherChecking || !voucher.trim()}>
                            {voucherChecking ? '...' : 'Apply'}
                          </button>
                        )}
                        {voucherValid && <span style={{ color: 'var(--green)' }}>✓ Free campaign</span>}
                        {voucherError && <span style={{ color: 'var(--red, #ff4444)', fontSize: '12px' }}>{voucherError}</span>}
                      </span>
                    </div>
                  )}
                </div>

                {!accountId ? (
                  <div className={styles.walletSection}>
                    <button className={styles.walletConnectBtn} onClick={connect} disabled={connecting}>
                      {connecting ? 'Opening wallet...' : (
                        <>
                          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                            <rect x="2" y="5" width="14" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.4" fill="none"/>
                            <circle cx="13" cy="10" r="1.5" fill="currentColor"/>
                            <path d="M5 5V4a4 4 0 018 0v1" stroke="currentColor" strokeWidth="1.4" fill="none"/>
                          </svg>
                          Connect NEAR wallet
                        </>
                      )}
                    </button>
                    <p className={styles.noWallet}>
                      No NEAR wallet yet?{' '}
                      <a href="https://app.mynearwallet.com" target="_blank" rel="noopener">
                        Create one at MyNearWallet →
                      </a>
                    </p>
                  </div>
                ) : (
                  <div className={styles.walletSection}>
                    <div className={styles.walletConnected}>
                      <span className={styles.walletDot} />
                      <span className={styles.mono}>{accountId}</span>
                      <button type="button" className={styles.walletDisconnect} onClick={disconnect}>
                        disconnect
                      </button>
                    </div>
                    {error && <p className={styles.error}>{error}</p>}
                    <button className={styles.payBtn} onClick={handlePay} disabled={loading}>
                      {loading ? 'Confirm in your wallet...' : `Pay ${selectedTier.near} and launch →`}
                    </button>
                  </div>
                )}
              </>
            )}

            <button type="button" className={styles.backBtn} onClick={() => setStep('details')}>← Back</button>
            <p className={styles.legal}>
              Payment goes directly to <span className={styles.mono}>near-launchpad.near</span>.
              Campaign starts within 24 hours of confirmed transaction.
            </p>
          </div>
        )}
      </div>
    </section>
  )
}