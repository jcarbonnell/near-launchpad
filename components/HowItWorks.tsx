import styles from './HowItWorks.module.css'

const STEPS = [
  {
    num: '01',
    title: 'Submit your repo',
    body: 'Paste your GitHub URL, your founder email, and optionally a CSV of your own contacts — LinkedIn export, email list, or X followers. The agent reads your README and extracts your Ideal Customer Profile.',
    detail: 'mvp-intake skill → Ollama nomic-embed-text',
  },
  {
    num: '02',
    title: 'Leads matched and merged',
    body: 'Your imported contacts get priority. The agent embeds and indexes them alongside 177,000+ existing contacts. A cosine similarity search fills remaining slots with the closest ICP matches from the base database — so you never launch with an empty list.',
    detail: 'pgvector ICP matching · ingest_raw.py · PostgreSQL',
  },
  {
    num: '03',
    title: 'Go/no-go verdict delivered',
    body: 'Every reply, click, and booking is logged. At campaign end you receive a traction report with reply rate, positive signals, bookings, and a clear recommendation — emailed directly to you.',
    detail: 'OutLayer TEE · NEAR email · traction-report.sh',
  },
]

export default function HowItWorks() {
  return (
    <section id="how-it-works" className={styles.section}>
      <div className={styles.container}>
        <p className="section-label">How it works</p>
        <h2 className={styles.heading}>
          Three steps from idea to market signal
        </h2>
        <p className={styles.sub}>
          No account managers. No weekly calls. A sovereign AI agent running 24/7
          on dedicated hardware executes your BD — while you keep building.
        </p>

        <div className={styles.steps}>
          {STEPS.map((step) => (
            <div key={step.num} className={styles.step}>
              <div className={styles.stepNum}>{step.num}</div>
              <div className={styles.stepContent}>
                <h3 className={styles.stepTitle}>{step.title}</h3>
                <p className={styles.stepBody}>{step.body}</p>
                <span className={styles.stepDetail}>{step.detail}</span>
              </div>
              <div className={styles.stepLine} />
            </div>
          ))}
        </div>

        <div className={styles.verdict}>
          <div className={styles.verdictInner}>
            <div className={styles.verdictItem}>
              <span className={styles.verdictLabel}>GO</span>
              <span className={styles.verdictRule}>reply_rate &gt; 5% AND bookings ≥ 1</span>
              <span className={styles.verdictAction}>Double down. Upgrade to Confident tier.</span>
            </div>
            <div className={styles.verdictDivider} />
            <div className={styles.verdictItem}>
              <span className={`${styles.verdictLabel} ${styles.yellow}`}>INCONCLUSIVE</span>
              <span className={styles.verdictRule}>reply_rate &gt; 2% OR positive_signals ≥ 2</span>
              <span className={styles.verdictAction}>Continue. Refine ICP. Run follow-ups.</span>
            </div>
            <div className={styles.verdictDivider} />
            <div className={styles.verdictItem}>
              <span className={`${styles.verdictLabel} ${styles.red}`}>NO-GO</span>
              <span className={styles.verdictRule}>reply_rate &lt; 2% AND bookings = 0</span>
              <span className={styles.verdictAction}>Pivot early. Saved months of wrong work.</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
