import styles from './Footer.module.css'

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.left}>
          <span className={styles.logo}>
            <span className={styles.bracket}>[</span>
            near-launchpad
            <span className={styles.bracket}>]</span>
          </span>
          <p className={styles.tagline}>
            Sovereign Commercial Node for early-stage startups.<br />
            Built with IronClaw, the secure alternative to OpenClaw by NEAR AI.
          </p>
        </div>

        <div className={styles.links}>
          <div className={styles.linkGroup}>
            <span className={styles.linkLabel}>Contact</span>
            <a href="mailto:near-launchpad@near.email">near-launchpad@near.email</a>
            <a href="https://near.social" target="_blank" rel="noopener">NEAR Social</a>
          </div>
          <div className={styles.linkGroup}>
            <span className={styles.linkLabel}>Stack</span>
            <a href="https://github.com/nearai/ironclaw" target="_blank" rel="noopener">IronClaw</a>
            <a href="https://near.email" target="_blank" rel="noopener">near.email</a>
            <a href="https://market.near.ai" target="_blank" rel="noopener">market.near.ai</a>
          </div>
          <div className={styles.linkGroup}>
            <span className={styles.linkLabel}>Legal</span>
            <a href="#">Privacy</a>
            <a href="#">Terms</a>
          </div>
        </div>
      </div>

      <div className={styles.bottom}>
        <span className={styles.mono}>near-launchpad.near</span>
        <span className={styles.sep}>·</span>
        <span>near-launchpad@near.email</span>
        <span className={styles.sep}>·</span>
        <span className={styles.dim}>v0.1.0 · April 2026</span>
      </div>
    </footer>
  )
}
