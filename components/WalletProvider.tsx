'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'

// All wallet selector imports are dynamic to avoid SSR issues
// Types only at module level
type WalletSelector = import('@near-wallet-selector/core').WalletSelector
type AccountState = import('@near-wallet-selector/core').AccountState

interface WalletContextValue {
  selector: WalletSelector | null
  accountId: string | null
  connecting: boolean
  connect: () => void
  disconnect: () => void
}

const WalletContext = createContext<WalletContextValue>({
  selector: null,
  accountId: null,
  connecting: false,
  connect: () => {},
  disconnect: () => {},
})

export function useWallet() {
  return useContext(WalletContext)
}

export function WalletProvider({ children }: { children: ReactNode }) {
  const [selector, setSelector] = useState<WalletSelector | null>(null)
  const [accountId, setAccountId] = useState<string | null>(null)
  const [connecting, setConnecting] = useState(false)
  const [modal, setModal] = useState<{ show: () => void } | null>(null)

  useEffect(() => {
    // Dynamically import to avoid SSR
    async function init() {
      const { setupWalletSelector } = await import('@near-wallet-selector/core')
      const { setupModal } = await import('@near-wallet-selector/modal-ui')
      const { setupMyNearWallet } = await import('@near-wallet-selector/my-near-wallet')
      const { setupHereWallet } = await import('@near-wallet-selector/here-wallet')
      const { setupBitteWallet } = await import('@near-wallet-selector/bitte-wallet')

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const modules: any[] = [
        setupMyNearWallet(),
        setupHereWallet(),
        setupBitteWallet(),
      ]

      const _selector = await setupWalletSelector({
        network: 'mainnet',
        modules,
      })

      const _modal = setupModal(_selector, {
        contractId: 'near-launchpad.near',
      })

      // Restore account from state
      const state = _selector.store.getState()
      const accounts: AccountState[] = state.accounts
      if (accounts.length > 0) {
        setAccountId(accounts[0].accountId)
      }

      // Subscribe to account changes
      _selector.store.observable.subscribe((state: { accounts: AccountState[] }) => {
        const accounts = state.accounts
        if (accounts.length > 0) {
          setAccountId(accounts[0].accountId)
        } else {
          setAccountId(null)
        }
        setConnecting(false)
      })

      setSelector(_selector)
      setModal(_modal)
    }

    init().catch(console.error)
  }, [])

  function connect() {
    if (!modal) return
    setConnecting(true)
    modal.show()
  }

  async function disconnect() {
    if (!selector) return
    const wallet = await selector.wallet()
    await wallet.signOut()
    setAccountId(null)
  }

  return (
    <WalletContext.Provider value={{ selector, accountId, connecting, connect, disconnect }}>
      {children}
    </WalletContext.Provider>
  )
}