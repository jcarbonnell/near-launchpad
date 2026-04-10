'use client'
import { useEffect, useState } from 'react'
import CampaignStatus from './CampaignStatus'
import styles from './CampaignList.module.css'

export interface SavedCampaign {
  campaign_id: string
  product_name: string
  tier: string
  submitted_at: string
}

const STORAGE_KEY = 'nl_campaigns'

export function loadCampaigns(): SavedCampaign[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function saveCampaign(entry: SavedCampaign): void {
  try {
    const existing = loadCampaigns()
    const deduped = existing.filter(c => c.campaign_id !== entry.campaign_id)
    // Most recent first
    localStorage.setItem(STORAGE_KEY, JSON.stringify([entry, ...deduped]))
  } catch {
    // localStorage unavailable — silent fail
  }
}

export default function CampaignList() {
  const [campaigns, setCampaigns] = useState<SavedCampaign[]>([])
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const saved = loadCampaigns()
    setCampaigns(saved)
    // Auto-expand the most recent one
    if (saved.length > 0) {
      setExpanded({ [saved[0].campaign_id]: true })
    }
  }, [])

  // Listen for new campaigns added by OnboardingForm
  useEffect(() => {
    function onStorage(e: StorageEvent) {
      if (e.key === STORAGE_KEY) {
        const saved = loadCampaigns()
        setCampaigns(saved)
        if (saved.length > 0) {
          setExpanded(prev => ({ ...prev, [saved[0].campaign_id]: true }))
        }
      }
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  function toggle(id: string) {
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }))
  }

  function remove(id: string) {
    const updated = campaigns.filter(c => c.campaign_id !== id)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
    setCampaigns(updated)
  }

  // Don't render on server or when empty
  if (!mounted || campaigns.length === 0) return null

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <div className={styles.header}>
          <p className="section-label">Your campaigns</p>
          <span className={styles.count}>{campaigns.length} active</span>
        </div>

        <div className={styles.list}>
          {campaigns.map((c, i) => (
            <div key={c.campaign_id} className={styles.entry}>
              {/* Collapsed header — always visible */}
              <div
                className={styles.entryHeader}
                onClick={() => toggle(c.campaign_id)}
                role="button"
                tabIndex={0}
                onKeyDown={e => e.key === 'Enter' && toggle(c.campaign_id)}
              >
                <div className={styles.entryLeft}>
                  <span className={styles.entryChevron}>
                    {expanded[c.campaign_id] ? '▾' : '▸'}
                  </span>
                  <span className={styles.entryName}>{c.product_name}</span>
                  <span className={styles.entryTier}>{c.tier}</span>
                  {i === 0 && <span className={styles.entryLatest}>latest</span>}
                </div>
                <div className={styles.entryRight}>
                  <span className={styles.entryDate}>
                    {new Date(c.submitted_at).toLocaleDateString('en-GB', {
                      day: 'numeric', month: 'short'
                    })}
                  </span>
                  <span className={styles.entryId}>{c.campaign_id.slice(0, 8)}</span>
                  <button
                    className={styles.removeBtn}
                    onClick={e => { e.stopPropagation(); remove(c.campaign_id) }}
                    title="Remove from list"
                  >
                    ×
                  </button>
                </div>
              </div>

              {/* Expanded status widget */}
              {expanded[c.campaign_id] && (
                <div className={styles.entryBody}>
                  <CampaignStatus campaignId={c.campaign_id} />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
