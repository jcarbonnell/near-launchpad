'use client'
import { useEffect, useRef } from 'react'
import styles from './Hero.module.css'

const TERMINAL_LINES = [
  '$ ironclaw processing intake: github.com/jcarbonnell/nova --csv contacts.csv',
  '  ✓ README fetched (2.4 kB)',
  '  ✓ Ideal Customer Profile extracted: privacy-first file-sharing for AI builders',
  '  ✓ CSV: 143 contacts imported + 357 matched from base DB',
  '  ✓ Embedding: 500 leads × 768 dims via nomic-embed-text',
  '$ ironclaw outreach --campaign b8c600a8 --day 1',
  '  ✓ sent → jordy@wavestone.com (en)',
  '  ✓ sent → thomas@tarides.com (en)',
  '  ✓ sent → guillaume@tanker.io (en)',
  '  ... 47 more today',
  '$ # day 7 of 14 — 350 contacts reached',
  '$ ironclaw report --campaign b8c600a8',
  '  reply_rate: 8.4%  bookings: 2  verdict: GO ✓',
]

export default function Hero() {
  const termRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = termRef.current
    if (!el) return
    let i = 0
    const interval = setInterval(() => {
      if (i >= TERMINAL_LINES.length) { clearInterval(interval); return }
      const line = document.createElement('div')
      line.className = styles.termLine
      line.textContent = TERMINAL_LINES[i]
      if (TERMINAL_LINES[i].startsWith('$')) line.classList.add(styles.termCommand)
      if (TERMINAL_LINES[i].includes('verdict: GO')) line.classList.add(styles.termSuccess)
      el.appendChild(line)
      el.scrollTop = el.scrollHeight
      i++
    }, 220)
    return () => clearInterval(interval)
  }, [])

  return (
    <section className={styles.hero}>
      <div className={styles.container}>
        <div className={styles.left}>
          <p className="section-label fade-up fade-up-1">Sovereign Commercial Node · Built with IronClaw</p>
          <h1 className={`${styles.headline} fade-up fade-up-2`}>
            Your MVP deserves<br />
            <span className={styles.accent}>real market feedback</span><br />
            not months of silence.
          </h1>
          <p className={`${styles.sub} fade-up fade-up-3`}>
            Submit your GitHub repo and your contact list. A sovereign AI agent sends
            batches of targeted emails every day, logs every signal, and delivers a go/no-go
            verdict — fully automated, no account managers.
          </p>
          <div className={`${styles.actions} fade-up fade-up-4`}>
            <a href="#launch" className={styles.btnPrimary}>Launch your campaign →</a>
            <a href="#how-it-works" className={styles.btnGhost}>See how it works</a>
          </div>
          <div className={`${styles.stats} fade-up fade-up-4`}>
            <div className={styles.stat}>
              <span className={styles.statVal}>100+/day</span>
              <span className={styles.statLabel}>targeted leads</span>
            </div>
            <div className={styles.statDivider} />
            <div className={styles.stat}>
              <span className={styles.statVal}>177k+</span>
              <span className={styles.statLabel}>indexed contacts</span>
            </div>
            <div className={styles.statDivider} />
            <div className={styles.stat}>
              <span className={styles.statVal}>14 days</span>
              <span className={styles.statLabel}>to verdict</span>
            </div>
          </div>
        </div>

        <div className={`${styles.right} fade-up fade-up-3`}>
          <div className={styles.terminal}>
            <div className={styles.termHeader}>
              <span className={styles.dot} style={{background:'#ff5f57'}} />
              <span className={styles.dot} style={{background:'#febc2e'}} />
              <span className={styles.dot} style={{background:'#28c840'}} />
              <span className={styles.termTitle}>ironclaw — near-launchpad</span>
            </div>
            <div className={styles.termBody} ref={termRef} />
          </div>
        </div>
      </div>
    </section>
  )
}
