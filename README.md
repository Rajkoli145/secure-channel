# SECURE-CHANNEL 🕵️‍♂️

Yo, welcome to the discrete chat zone. 

Want to chat securely with *someone* hmmhmm umm? We got you. This is a terminal-based, zero-logs, pure-vibes chat protocol. No browser history to clear, no "delete for everyone" needed because there's literally no database. It's just you, them, and the void.

## Getting Started (The Local Secret)

```bash
# Open terminal in your mac
# Get the goods
npm install

# Start the mothership (The Relay)
npm start

# Jump into the shadows (Person 1)
node client.js

# person 2 also jumps in
node client.js
```

## How to use this discreetly

| Command | Why you'd use it |
|---|---|
| `/nick <name>` | Change your identity on the fly. Sus? Maybe. Cool? Yes. |
| `/heartbeat` | Send a little 💓 pulse. |
| `/hug` | Virtual embrace packet. Hmmhmm umm. |
| `/encrypt on` | Turn on Base64 encoding. Looks like gibberish to anyone peeking at your screen. |
| `/panic` | **INSTANT CLEAR.** Boss/Mom/Roommate walks in? Boom. Gone. |
| `/status` | Check if you're still linked. |

## Deployment (Chatting from different cities/WiFi)

1. Create a **Web Service** on [Render](https://render.com).
2. Connect this repo.
3. Settings: `Build: npm install`, `Start: npm start`.
4. Connect via:
```bash
SERVER_URL=wss://your-render-app.onrender.com node client.js
```

## How it works (Architecture)

```mermaid
graph LR
    A[Person 1] <-->|Secure WebSocket| B(Relay Server)
    B <-->|Secure WebSocket| C[Person 2]
```

Actually, here's the low-level view:

```
┌──────────┐      (WSS)      ┌──────────────┐      (WSS)      ┌──────────┐
│ Person 1 │ <─────────────> │ Relay node   │ <─────────────> │ Person 2 │
│ terminal │                 │ (no storage) │                 │ terminal │
└──────────┘                 └──────────────┘                 └──────────┘
```

## Rules of the Void
- No logs.
- No storage.
- If the server restarts, everything is gone forever.
- Stay stealthy. 🕶️
