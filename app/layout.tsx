import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'NEAR Innovation Launchpad — BD Automation for MVPs',
  description: 'Autonomous BD agent that validates your MVP with real market signals. 200 leads, 7 days, go/no-go verdict. Powered by NEAR Protocol.',
  openGraph: {
    title: 'NEAR Innovation Launchpad',
    description: 'BD automation for early-stage MVPs. Powered by a sovereign AI agent on NEAR.',
    url: 'https://near-launchpad.com',
    siteName: 'NEAR Innovation Launchpad',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'NEAR Innovation Launchpad',
    description: 'BD automation for early-stage MVPs.',
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
