import styles from './HowItWorks.module.css'

const STEPS = [
  {
    num: '01',
    title: 'Submit your repo',
    body: 'Paste your GitHub URL, your founder email, and a CSV of your own contacts (google contacts, mailbox data...)). The agent reads your README and defines your Ideal Customer Profile.',
    detail: 'mvp-intake skill → Ollama nomic-embed-text',
  },
  {
    num: '02',
    title: 'Leads matched',
    body: 'The agent embeds your contacts alongside our base 177,000+ contacts. Then crafts personalized outreach sequences for your top ICP-matched leads.',
    detail: 'pgvector Ideal Customer Profile matching · ingest_raw.py · PostgreSQL',
  },
  {
    num: '03',
    title: 'Go/no-go verdict',
    body: 'Every reply, click, and booking is logged. At the end of your campaign you receive a traction report with reply rate, positive signals, bookings, and a clear verdict, emailed directly to your inbox.',
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
          on dedicated hardware executes your Business Development.
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
              <span className={styles.verdictAction}>Double down. Upgrade to Confident tier to keep growing your user base.</span>
            </div>
            <div className={styles.verdictDivider} />
            <div className={styles.verdictItem}>
              <span className={`${styles.verdictLabel} ${styles.yellow}`}>INCONCLUSIVE</span>
              <span className={styles.verdictRule}>reply_rate &gt; 2% OR positive_signals ≥ 2</span>
              <span className={styles.verdictAction}>Refine Ideal Customer Profile. Run follow-ups. Continue A/B testing.</span>
            </div>
            <div className={styles.verdictDivider} />
            <div className={styles.verdictItem}>
              <span className={`${styles.verdictLabel} ${styles.red}`}>NO-GO</span>
              <span className={styles.verdictRule}>reply_rate &lt; 2% AND bookings = 0</span>
              <span className={styles.verdictAction}>Pivot early. Saved months of work in the wrong direction.</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
