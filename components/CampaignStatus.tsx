'use client'
import { useEffect, useState, useCallback } from 'react'
import styles from './CampaignStatus.module.css'

interface CampaignData {
  campaign_id: string
  product_name: string
  tier: string
  status: string
  started_at: string | null
  deadline_at: string | null
  days_left: number | null
  // funnel
  enrolled: number
  contacted: number
  replied: number
  positive: number
  bookings: number
  reply_rate: number
  // verdict
  verdict: string | null
  verdict_summary: string | null
  // touches by channel
  email_touches: number
  x_touches: number
  linkedin_touches: number
}

const VERDICT_COLOR: Record<string, string> = {
  go: '#00ec97',
  inconclusive: '#f0c040',
  'no-go': '#f06060',
}

const VERDICT_LABEL: Record<string, string> = {
  go: 'GO ✓',
  inconclusive: 'INCONCLUSIVE',
  'no-go': 'NO-GO',
}

function Bar({ value, max, color = 'var(--green)' }: { value: number; max: number; color?: string }) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0
  return (
    <div className={styles.barTrack}>
      <div className={styles.barFill} style={{ width: `${pct}%`, background: color }} />
    </div>
  )
}

function Metric({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className={styles.metric}>
      <span className={styles.metricVal}>{value}</span>
      <span className={styles.metricLabel}>{label}</span>
      {sub && <span className={styles.metricSub}>{sub}</span>}
    </div>
  )
}

export default function CampaignStatus({ campaignId }: { campaignId: string }) {
  const [data, setData] = useState<CampaignData | null>(null)
  const [error, setError] = useState('')
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [loading, setLoading] = useState(true)

  const fetch_ = useCallback(async () => {
    try {
      const res = await fetch(`/api/status?campaign_id=${campaignId}`)
      if (!res.ok) {
        const e = await res.json()
        setError(e.error || 'Could not load campaign data')
        return
      }
      const d = await res.json()
      setData(d)
      setLastUpdated(new Date())
      setError('')
    } catch {
      setError('Connection error — retrying')
    } finally {
      setLoading(false)
    }
  }, [campaignId])

  useEffect(() => {
    fetch_()
    const interval = setInterval(fetch_, 30_000)
    return () => clearInterval(interval)
  }, [fetch_])

  if (loading) {
    return (
      <div className={styles.wrap}>
        <div className={styles.loading}>
          <span className={styles.loadingDot} />
          <span className={styles.loadingDot} style={{ animationDelay: '0.15s' }} />
          <span className={styles.loadingDot} style={{ animationDelay: '0.3s' }} />
          <span className={styles.loadingText}>Loading campaign data...</span>
        </div>
      </div>
    )
  }

  if (error && !data) {
    return (
      <div className={styles.wrap}>
        <p className={styles.error}>{error}</p>
      </div>
    )
  }

  if (!data) return null

  const verdictColor = data.verdict ? VERDICT_COLOR[data.verdict] ?? 'var(--text-muted)' : null
  const verdictLabel = data.verdict ? VERDICT_LABEL[data.verdict] ?? data.verdict : null

  const progressPct = data.enrolled > 0
    ? Math.round((data.contacted / data.enrolled) * 100)
    : 0

  return (
    <div className={styles.wrap}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <span className={styles.productName}>{data.product_name}</span>
          <span className={styles.tierBadge}>{data.tier}</span>
          <span
            className={styles.statusBadge}
            style={{ color: data.status === 'active' ? 'var(--green)' : 'var(--text-muted)' }}
          >
            {data.status === 'active' && <span className={styles.activeDot} />}
            {data.status}
          </span>
        </div>
        <div className={styles.headerRight}>
          {data.days_left !== null && data.days_left >= 0 && (
            <span className={styles.daysLeft}>
              {data.days_left === 0 ? 'Last day' : `${data.days_left}d left`}
            </span>
          )}
          <span className={styles.campaignId}>{data.campaign_id.slice(0, 8)}</span>
        </div>
      </div>

      {/* Verdict — shown prominently if available */}
      {data.verdict && (
        <div className={styles.verdictBanner} style={{ borderColor: verdictColor ?? undefined }}>
          <span className={styles.verdictLabel} style={{ color: verdictColor ?? undefined }}>
            {verdictLabel}
          </span>
          {data.verdict_summary && (
            <span className={styles.verdictSummary}>{data.verdict_summary}</span>
          )}
        </div>
      )}

      {/* Funnel metrics */}
      <div className={styles.metrics}>
        <Metric label="enrolled" value={data.enrolled} />
        <Metric label="contacted" value={data.contacted} />
        <Metric label="replied" value={data.replied} />
        <Metric label="positive" value={data.positive} />
        <Metric label="bookings" value={data.bookings} />
        <Metric
          label="reply rate"
          value={`${data.reply_rate.toFixed(1)}%`}
          sub={data.reply_rate >= 5 ? '≥5% threshold ✓' : `<5% threshold`}
        />
      </div>

      {/* Progress bar — outreach progress */}
      <div className={styles.progressSection}>
        <div className={styles.progressHeader}>
          <span className={styles.progressLabel}>Outreach progress</span>
          <span className={styles.progressPct}>{progressPct}%</span>
        </div>
        <Bar value={data.contacted} max={data.enrolled} />
        <div className={styles.progressFooter}>
          <span>{data.contacted} contacted</span>
          <span>{data.enrolled - data.contacted} remaining</span>
        </div>
      </div>

      {/* Channel breakdown — only if non-email channels active */}
      {(data.x_touches > 0 || data.linkedin_touches > 0) && (
        <div className={styles.channels}>
          <span className={styles.channelsLabel}>Channels</span>
          <div className={styles.channelRow}>
            <span className={styles.channelName}>Email</span>
            <Bar value={data.email_touches} max={data.email_touches + data.x_touches + data.linkedin_touches} />
            <span className={styles.channelCount}>{data.email_touches}</span>
          </div>
          {data.x_touches > 0 && (
            <div className={styles.channelRow}>
              <span className={styles.channelName}>X</span>
              <Bar value={data.x_touches} max={data.email_touches + data.x_touches + data.linkedin_touches} color="#1d9bf0" />
              <span className={styles.channelCount}>{data.x_touches}</span>
            </div>
          )}
          {data.linkedin_touches > 0 && (
            <div className={styles.channelRow}>
              <span className={styles.channelName}>LinkedIn</span>
              <Bar value={data.linkedin_touches} max={data.email_touches + data.x_touches + data.linkedin_touches} color="#0a66c2" />
              <span className={styles.channelCount}>{data.linkedin_touches}</span>
            </div>
          )}
        </div>
      )}

      {/* Footer */}
      <div className={styles.footer}>
        <span className={styles.footerText}>
          {data.started_at
            ? `Started ${new Date(data.started_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}`
            : 'Awaiting activation'}
          {data.deadline_at &&
            ` · deadline ${new Date(data.deadline_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}`}
        </span>
        {lastUpdated && (
          <span className={styles.footerText}>
            Updated {lastUpdated.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
          </span>
        )}
      </div>
    </div>
  )
}
