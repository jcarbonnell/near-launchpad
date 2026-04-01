'use client'
import styles from './Nav.module.css'

export default function Nav() {
  return (
    <nav className={styles.nav}>
      <div className={styles.inner}>
        <span className={styles.logo}>
          <span className={styles.bracket}>[</span>
          near-launchpad
          <span className={styles.bracket}>]</span>
        </span>
        <div className={styles.links}>
          <a href="#how-it-works">How it works</a>
          <a href="#launch" className={styles.cta}>Launch your MVP →</a>
        </div>
      </div>
    </nav>
  )
}
