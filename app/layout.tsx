import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'NEAR Innovation Launchpad — BizDev Agent for early-stage startups',
  description: 'Sovereign commercial node that validates your MVP with real market signals. 200 leads per campaign, 7 days, go/no-go verdict. Built with IronClaw.',
  openGraph: {
    title: 'NEAR Innovation Launchpad',
    description: 'BizDev Agent for early-stage startups. Built with IronClaw.',
    url: 'https://near-launchpad.com',
    siteName: 'NEAR Innovation Launchpad',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'NEAR Innovation Launchpad',
    description: 'BizDev Agent for early-stage startups. Built with IronClaw.',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
