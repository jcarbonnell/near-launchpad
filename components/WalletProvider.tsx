'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import type { NearConnector, NearWalletBase } from '@hot-labs/near-connect'

interface WalletContextValue {
  connector: NearConnector | null
  wallet: NearWalletBase | null
  accountId: string | null
  connecting: boolean
  connect: () => void
  disconnect: () => void
}

const WalletContext = createContext<WalletContextValue>({
  connector: null,
  wallet: null,
  accountId: null,
  connecting: false,
  connect: () => {},
  disconnect: () => {},
})

export function useWallet() {
  return useContext(WalletContext)
}

export function WalletProvider({ children }: { children: ReactNode }) {
  const [connector, setConnector] = useState<NearConnector | null>(null)
  const [wallet, setWallet] = useState<NearWalletBase | null>(null)
  const [accountId, setAccountId] = useState<string | null>(null)
  const [connecting, setConnecting] = useState(false)

  useEffect(() => {
    async function init() {
      const { NearConnector } = await import('@hot-labs/near-connect')

      const _connector = new NearConnector({ network: 'mainnet' })

      // Restore existing session
      try {
        const _wallet = await _connector.wallet()
        const accounts = await _wallet.getAccounts()
        if (accounts.length > 0) {
          setWallet(_wallet)
          setAccountId(accounts[0].accountId)
        }
      } catch {
        // Not signed in — expected
      }

      _connector.on('wallet:signIn', async ({ accounts }: { accounts: { accountId: string }[] }) => {
        if (accounts.length > 0) {
          const _wallet = await _connector.wallet()
          setWallet(_wallet)
          setAccountId(accounts[0].accountId)
        }
        setConnecting(false)
      })

      _connector.on('wallet:signOut', () => {
        setWallet(null)
        setAccountId(null)
        setConnecting(false)
      })

      setConnector(_connector)
    }

    init().catch(console.error)
  }, [])

  function connect() {
    if (!connector) return
    setConnecting(true)
    connector.connect().catch(() => setConnecting(false))
  }

  async function disconnect() {
    if (!connector) return
    await connector.disconnect()
    setWallet(null)
    setAccountId(null)
  }

  return (
    <WalletContext.Provider value={{ connector, wallet, accountId, connecting, connect, disconnect }}>
      {children}
    </WalletContext.Provider>
  )
}