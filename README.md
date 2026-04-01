# near-launchpad.com

Frontend for the NEAR Innovation Launchpad — BizDev & Marketing automation for early-stage startups in the NEAR ecosystem. Built with IronClaw. 

Built with Next.js 14 (App Router), deployed on Vercel.

## Stack

- **Frontend**: https://near-launchpad.com
- **Backend**: [IronClaw - sovereign commercial node on Raspberry Pi 5](https://docs.google.com/presentation/d/1wYVVrp2ILZnFWIkTQ3x0S2NQmgej94HEgpYMPWQO9ng/edit?usp=sharing)

## Setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Environment Variables

| Variable | Description |
|---|---|
| `WEBHOOK_URL` | Pi webhook endpoint (via Cloudflare Tunnel) |
| `NEXT_PUBLIC_NEAR_NETWORK` | `mainnet` or `testnet` |

## Vercel Deployment

1. Push to GitHub repo (`civictech-ou/near-launchpad` or similar)
2. Import project in Vercel under CivicTech OU account
3. Add environment variables in Vercel project settings
4. Add custom domain `near-launchpad.com` in Vercel domains

## Pi Webhook Setup

The form POSTs to `/api/intake` which proxies to `WEBHOOK_URL` on the Pi.

To expose the Pi webhook publicly, use Cloudflare Tunnel:

```bash
# On the Pi
curl -L https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-arm64 \
  -o /usr/local/bin/cloudflared
chmod +x /usr/local/bin/cloudflared

cloudflared tunnel login
cloudflared tunnel create near-launchpad-intake
cloudflared tunnel route dns near-launchpad-intake intake.near-launchpad.com

# Create config
cat > ~/.cloudflared/config.yml << 'CFEOF'
tunnel: near-launchpad-intake
credentials-file: /home/pi/.cloudflared/<tunnel-id>.json
ingress:
  - hostname: intake.near-launchpad.com
    service: http://localhost:9000
  - service: http_status:404
CFEOF

# Start as systemd service
cloudflared service install
```

Then run a simple intake receiver on the Pi (port 9000):

```bash
sudo cp /opt/ironclaw/scripts/intake-webhook.py /opt/ironclaw/scripts/
sudo systemctl enable intake-webhook
sudo systemctl start intake-webhook
```

Set `WEBHOOK_URL=https://intake.near-launchpad.com/intake` in Vercel.

## Roadmap

- [ ] v0.1 — Onboarding form + webhook (current)
- [ ] v0.2 — NEAR wallet connect (real payment flow)
- [ ] v0.3 — Campaign status dashboard
- [ ] v0.4 — Traction report viewer
- [ ] v0.5 — LinkedIn / X channel options
