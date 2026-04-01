'use client'
import { useEffect, useRef } from 'react'
import styles from './Hero.module.css'

const TERMINAL_LINES = [
  '$ ironclaw intake --repo github.com/jcarbonnell/nova',
  '  ✓ README fetched (2.4 kB)',
  '  ✓ ICP extracted: privacy-first file-sharing for AI builders',
  '  ✓ Embedding: 768 dims via nomic-embed-text',
  '  ✓ 200 leads enrolled (ICP score ≥ 0.72)',
  '$ ironclaw outreach --campaign b8c600a8 --touch first_contact',
  '  ✓ sent → jordy@wavestone.com (en)',
  '  ✓ sent → thomas@tarides.com (en)',
  '  ✓ sent → guillaume@tanker.io (en)',
  '  ... 47 more',
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
          <p className="section-label fade-up fade-up-1">Sovereign BD agent · NEAR Protocol</p>
          <h1 className={`${styles.headline} fade-up fade-up-2`}>
            Your MVP deserves<br />
            <span className={styles.accent}>real market feedback</span><br />
            not months of silence.
          </h1>
          <p className={`${styles.sub} fade-up fade-up-3`}>
            Submit your GitHub repo. In 7 days, a sovereign AI agent contacts 200 matched leads,
            logs every signal, and delivers a go/no-go verdict — fully automated,
            running on NEAR.
          </p>
          <div className={`${styles.actions} fade-up fade-up-4`}>
            <a href="#launch" className={styles.btnPrimary}>Launch your campaign →</a>
            <a href="#how-it-works" className={styles.btnGhost}>See how it works</a>
          </div>
          <div className={`${styles.stats} fade-up fade-up-4`}>
            <div className={styles.stat}>
              <span className={styles.statVal}>177k</span>
              <span className={styles.statLabel}>leads indexed</span>
            </div>
            <div className={styles.statDivider} />
            <div className={styles.stat}>
              <span className={styles.statVal}>~$0.001</span>
              <span className={styles.statLabel}>per email sent</span>
            </div>
            <div className={styles.statDivider} />
            <div className={styles.stat}>
              <span className={styles.statVal}>7 days</span>
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
