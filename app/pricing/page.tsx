'use client'

import UpgradeButton from '../components/UpgradeButton'

export default function PricingPage() {
  return (
    <div style={{ padding: '2rem' }}>
      <h1>Choose Your Tier</h1>

      {/* Starter Tier */}
      <div style={{ margin: '2rem 0', padding: '1rem', border: '1px solid #ccc' }}>
        <h2>Starter — $15/month</h2>
        <p>Access all Starter content.</p>
        <UpgradeButton priceId="prod_U4tLhXwdqUPPFT" tierName="Starter" />
      </div>

      {/* Core Tier */}
      <div style={{ margin: '2rem 0', padding: '1rem', border: '1px solid #ccc' }}>
        <h2>Core — $25/month</h2>
        <p>Access Starter + Core content.</p>
        <UpgradeButton priceId="prod_U4tLWuGSWiX3rf" tierName="Core" />
      </div>

    </div>
  )
}