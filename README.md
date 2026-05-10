# Neontalk — Futuristic Stranger Video Chat

> WebRTC · Socket.io · AI Moderation · Consent Recording

## Project Structure

```
Neontalk/
├── server/          ← Node.js + Express + Socket.io signaling server
│   ├── index.js
│   ├── models/Session.js
│   ├── .env.example
│   └── package.json
└── client/          ← React + Vite frontend
    ├── src/
    │   ├── App.jsx
    │   ├── main.jsx
    │   ├── index.css
    │   ├── hooks/
    │   │   ├── useWebRTC.js     ← Full WebRTC lifecycle
    │   │   ├── useConsent.js    ← Recording consent state
    │   │   └── useModeration.js ← Periodic NSFW sampling
    │   ├── lib/
    │   │   ├── socket.js        ← Singleton socket.io client
    │   │   ├── moderation.js    ← nsfwjs frame classifier
    │   │   └── recorder.js      ← Consent-gated MediaRecorder
    │   ├── components/
    │   │   ├── VideoPanel.jsx
    │   │   ├── ControlsBar.jsx
    │   │   ├── ConsentBanner.jsx
    │   │   ├── ModerationAlert.jsx
    │   │   └── StatusPill.jsx
    │   └── pages/
    │       ├── LandingPage.jsx
    │       └── ChatPage.jsx
    ├── .env.example
    └── vite.config.js
```

---

## Quick Start (Local Dev)

### 1. Server

```bash
cd server
cp .env.example .env      # fill in MONGODB_URI (optional) + TURN creds
npm install
npm run dev               # nodemon on port 4000
```

### 2. Client

```bash
cd client
cp .env.example .env.local
npm install
npm run dev               # Vite on port 5173
```

Open http://localhost:5173 in **two browser tabs** (or two browsers) to test matching.

---

## Environment Variables

### Server (`server/.env`)

| Variable          | Description                                      | Default              |
|-------------------|--------------------------------------------------|----------------------|
| `MONGODB_URI`     | MongoDB Atlas M0 connection string               | *(optional)*         |
| `PORT`            | Server port                                      | `4000`               |
| `CLIENT_ORIGIN`   | Allowed frontend origins (comma-separated)       | `http://localhost:5173` |
| `TURN_USERNAME`   | Metered.ca TURN username                         | `openrelayproject`   |
| `TURN_CREDENTIAL` | Metered.ca TURN credential                       | `openrelayproject`   |

### Client (`client/.env.local`)

| Variable          | Description                                      |
|-------------------|--------------------------------------------------|
| `VITE_SERVER_URL` | Signaling server URL                             |
| `VITE_APP_NAME`   | App name shown in UI                             |

---

## Deployment

### Backend → Render (Free Tier)

1. Push `server/` to GitHub
2. Create a new **Web Service** on [render.com](https://render.com)
3. Build command: `npm install`
4. Start command: `npm start`
5. Add environment variables from `.env.example`
6. Note your Render URL (e.g. `https://neontalk-server.onrender.com`)

### Frontend → Vercel (Free Tier)

1. Push `client/` to GitHub
2. Import on [vercel.com](https://vercel.com) — framework: **Vite**
3. Set `VITE_SERVER_URL` → your Render URL
4. Deploy

---

## Architecture: WebRTC Signaling Flow

```
User A                Signaling Server              User B
  |                   (Socket.io / Render)            |
  |── join-queue ────────────────────────────────────>|
  |                        |                          |
  |<──── matched(caller) ──┤──── matched(callee) ────>|
  |                        |                          |
  |── offer ───────────────┼──────────────────────── >|
  |<── answer ─────────────┼────────────────────────  |
  |── ice-candidate ───────┼──────────────────────── >|
  |<── ice-candidate ──────┼────────────────────────  |
  |                        |                          |
  |◄══════════ P2P WebRTC Audio+Video Stream ════════>|
  |                        |                          |
  |── next ────────────────┼── partner-left ─────────>|
```

---

## AI Moderation

- **Library**: `nsfwjs` (TensorFlow.js MobileNetV2, ~8 MB CDN)
- **Sampling**: Every **5 seconds** on the remote `<video>` element
- **Categories flagged**: Porn, Sexy, Hentai (threshold: 70%)
- **Privacy**: Zero frames leave the browser — all inference is local

## Consent Recording

- Both users must click **"I Consent"** before recording begins
- Uses native `MediaRecorder` API on the local stream
- Saves as `neontalk-recording-<timestamp>.webm` to the user's device
- No upload ever occurs — not even to the server

---

## Cost-Saving Hacks

| Resource         | Free Tier                         | Tip                                    |
|------------------|-----------------------------------|----------------------------------------|
| Render           | 750 hrs/mo, sleeps after 15 min   | Add UptimeRobot ping to keep awake     |
| MongoDB Atlas M0 | 512 MB                            | Store only metadata, no media          |
| TURN (Metered)   | 50 GB/mo                          | STUN covers ~80% of connections        |
| Vercel           | 100 GB bandwidth                  | Static frontend, no serverless needed  |
| nsfwjs model     | CDN cached after first load       | Use `MobileNetV2` (smallest model)     |

---

## Scalability Path (When You Grow)

1. **Multiple signaling servers**: Use Redis adapter (`socket.io-redis`) for horizontal scaling
2. **TURN**: Upgrade to Metered paid ($5/mo) or self-host coturn
3. **Recording**: Move to SFU (mediasoup / LiveKit) for server-side mixing
4. **Moderation**: Replace nsfwjs with a cloud Vision API (Google/AWS)
5. **Database**: Scale MongoDB Atlas to M2/M5 as needed
