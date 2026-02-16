'use strict';

const http = require('http');
const { WebSocketServer } = require('ws');

const PORT = process.env.PORT || 8080;

// ── HTTP server (health check for Render) ────────────────────────────
const httpServer = http.createServer((req, res) => {
  if (req.url === '/' || req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('SECURE-CHANNEL :: OPERATIONAL');
  } else {
    res.writeHead(404);
    res.end();
  }
});

// ── WebSocket server ─────────────────────────────────────────────────
const wss = new WebSocketServer({ server: httpServer });

const clients = new Set();

function broadcast(sender, payload) {
  const raw = JSON.stringify(payload);
  for (const client of clients) {
    if (client !== sender && client.readyState === 1) {
      client.send(raw);
    }
  }
}

wss.on('connection', (ws) => {
  clients.add(ws);
  log(`+ link established  [${clients.size} active]`);

  ws.on('message', (data) => {
    try {
      const msg = JSON.parse(data);

      // System join/leave events
      if (msg.type === 'join') {
        log(`  codename acquired: ${msg.codename}`);
        broadcast(ws, { type: 'system', text: `${msg.codename} has entered the channel.` });
        return;
      }

      // Nick change
      if (msg.type === 'nick') {
        log(`  codename changed: ${msg.oldName} → ${msg.newName}`);
        broadcast(ws, { type: 'system', text: `${msg.oldName} is now known as ${msg.newName}` });
        return;
      }

      // Regular message relay
      broadcast(ws, msg);
    } catch {
      // Malformed payload — drop silently
    }
  });

  ws.on('close', () => {
    clients.delete(ws);
    log(`- link severed      [${clients.size} active]`);
  });

  ws.on('error', () => {
    clients.delete(ws);
  });
});

// ── Boot ─────────────────────────────────────────────────────────────
httpServer.listen(PORT, () => {
  console.log();
  console.log('  ╔══════════════════════════════════════╗');
  console.log('  ║       SECURE-CHANNEL  v1.0.0         ║');
  console.log('  ║       relay node :: online            ║');
  console.log(`  ║       port :: ${String(PORT).padEnd(23)}║`);
  console.log('  ╚══════════════════════════════════════╝');
  console.log();
});

function log(message) {
  const ts = new Date().toISOString().slice(11, 19);
  console.log(`  [${ts}] ${message}`);
}
