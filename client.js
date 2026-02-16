'use strict';

const readline = require('readline');
const WebSocket = require('ws');
const chalk = require('chalk');

// ── Config ───────────────────────────────────────────────────────────
const SERVER_URL = process.env.SERVER_URL || 'wss://secure-channel.onrender.com';
let encryptionEnabled = false;
let codename = '';

// ── Terminal helpers ─────────────────────────────────────────────────
const dim = chalk.gray;
const accent = chalk.greenBright;
const warn = chalk.yellowBright;
const err = chalk.redBright;
const sys = chalk.cyanBright;
const bold = chalk.bold;

function print(text) {
    process.stdout.write(text + '\n');
}

function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

function clearLine() {
    process.stdout.clearLine(0);
    process.stdout.cursorTo(0);
}

// ── Encoding ─────────────────────────────────────────────────────────
function encode(text) {
    return Buffer.from(text, 'utf-8').toString('base64');
}

function decode(text) {
    return Buffer.from(text, 'base64').toString('utf-8');
}

// ── Boot sequence ────────────────────────────────────────────────────
async function bootSequence() {
    console.clear();
    print('');
    print(accent('  ┌──────────────────────────────────────┐'));
    print(accent('  │        SECURE CHANNEL  v1.0.0        │'));
    print(accent('  │      encrypted relay protocol        │'));
    print(accent('  └──────────────────────────────────────┘'));
    print('');

    const steps = [
        ['  Initializing Secure Channel', 600],
        ['  Loading cryptographic modules', 400],
        ['  Performing handshake', 700],
        ['  Verifying encryption layer', 500],
        ['  Establishing relay tunnel', 400],
        ['  Channel established', 300],
    ];

    for (const [msg, delay] of steps) {
        await sleep(delay);
        print(dim(`  ${getTimestamp()}  `) + accent(msg + '...'));
    }

    await sleep(300);
    print('');
    print(accent('  ✓ ') + bold('Connection secured.'));
    print(dim('  ─────────────────────────────────────────'));
    print('');
}

function getTimestamp() {
    return new Date().toISOString().slice(11, 19);
}

// ── Command handlers ─────────────────────────────────────────────────
async function handleCommand(input, ws, rl) {
    const parts = input.trim().split(/\s+/);
    const cmd = parts[0].toLowerCase();

    switch (cmd) {
        case '/heartbeat':
            await animateHeartbeat(rl);
            return true;

        case '/hug':
            print(sys('  sending_virtual_packet...'));
            await sleep(400);
            print(sys('  packet_delivered ♥'));
            sendMessage(ws, 'sent a virtual embrace ♥');
            return true;

        case '/panic':
            console.clear();
            return true;

        case '/nick': {
            const newName = parts.slice(1).join(' ').trim();
            if (!newName) {
                print(dim('  usage: /nick <new_codename>'));
            } else {
                const oldName = codename;
                codename = newName;
                ws.send(JSON.stringify({ type: 'nick', oldName, newName }));
                print(accent(`  ✓ codename changed: ${oldName} → ${codename}`));
            }
            return true;
        }

        case '/encrypt': {
            const arg = parts[1]?.toLowerCase();
            if (arg === 'on') {
                encryptionEnabled = true;
                print(accent('  ✓ encryption :: enabled  [base64]'));
            } else if (arg === 'off') {
                encryptionEnabled = false;
                print(warn('  ✗ encryption :: disabled [plaintext]'));
            } else {
                print(dim(`  encryption is currently ${encryptionEnabled ? 'ON' : 'OFF'}`));
            }
            return true;
        }

        case '/status': {
            const state = ws.readyState === WebSocket.OPEN ? accent('OPEN') : err('CLOSED');
            print('');
            print(dim('  ┌─ status ────────────────────────┐'));
            print(dim('  │ ') + `codename    : ${bold(codename)}` + dim('  │'));
            print(dim('  │ ') + `connection  : ${state}` + dim('           │'));
            print(dim('  │ ') + `encryption  : ${encryptionEnabled ? accent('ON') : warn('OFF')}` + dim('            │'));
            print(dim('  │ ') + `server      : ${dim(SERVER_URL)}` + dim(''));
            print(dim('  └────────────────────────────────'));
            print('');
            return true;
        }

        case '/help':
            print('');
            print(dim('  ┌─ commands ──────────────────────┐'));
            print(dim('  │') + '  /heartbeat   animated pulse     ' + dim('│'));
            print(dim('  │') + '  /hug         virtual embrace    ' + dim('│'));
            print(dim('  │') + '  /panic       clear terminal     ' + dim('│'));
            print(dim('  │') + '  /nick        change codename    ' + dim('│'));
            print(dim('  │') + '  /encrypt     on / off           ' + dim('│'));
            print(dim('  │') + '  /status      connection info    ' + dim('│'));
            print(dim('  │') + '  /help        this message       ' + dim('│'));
            print(dim('  └────────────────────────────────'));
            print('');
            return true;

        default:
            return false;
    }
}

async function animateHeartbeat(rl) {
    const frames = ['♥', '♥ ♥', '♥ ♥ ♥', '♥ ♥', '♥', ''];
    for (const frame of frames) {
        clearLine();
        process.stdout.write(err(`  ${frame}`));
        await sleep(250);
    }
    clearLine();
    print(err('  ♥ ♥ ♥  pulse transmitted'));
}

// ── Messaging ────────────────────────────────────────────────────────
function sendMessage(ws, text) {
    if (ws.readyState !== WebSocket.OPEN) {
        print(err('  ✗ channel disconnected'));
        return;
    }

    const payload = {
        type: 'message',
        codename,
        text: encryptionEnabled ? encode(text) : text,
        encrypted: encryptionEnabled,
    };

    ws.send(JSON.stringify(payload));
}

function displayOutgoing(text) {
    const ts = dim(getTimestamp());
    print(`  ${ts}  ${accent('>')} transmit --payload="${text}"`);
}

function displayIncoming(msg) {
    const ts = dim(getTimestamp());
    const displayText = msg.encrypted ? decode(msg.text) : msg.text;
    const tag = msg.encrypted ? dim(' [enc]') : '';
    print(`  ${ts}  ${sys('<')} ${bold(msg.codename)} --state="${displayText}"${tag}`);
}

function displaySystem(text) {
    print(dim(`  ${getTimestamp()}  ── ${text}`));
}

// ── Main ─────────────────────────────────────────────────────────────
async function main() {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    const ask = (q) => new Promise((resolve) => rl.question(q, resolve));

    // Get codename
    print('');
    codename = await ask(accent('  Enter codename: '));
    if (!codename.trim()) codename = 'ghost';
    codename = codename.trim();

    // Boot
    await bootSequence();

    // Connect
    print(dim(`  connecting to ${SERVER_URL}...`));
    print('');

    const ws = new WebSocket(SERVER_URL);

    ws.on('open', () => {
        print(accent('  ✓ relay tunnel active'));
        print(dim('  type /help for commands'));
        print(dim('  ─────────────────────────────────────────'));
        print('');

        // Announce join
        ws.send(JSON.stringify({ type: 'join', codename }));

        // Prompt loop
        const prompt = () => {
            rl.question(dim('  > '), async (input) => {
                if (!input.trim()) {
                    prompt();
                    return;
                }

                // Check for commands
                const isCommand = await handleCommand(input, ws, rl);
                if (!isCommand) {
                    displayOutgoing(input);
                    sendMessage(ws, input);
                }

                prompt();
            });
        };

        prompt();
    });

    ws.on('message', (data) => {
        try {
            const msg = JSON.parse(data);
            clearLine();

            if (msg.type === 'system') {
                displaySystem(msg.text);
            } else if (msg.type === 'message') {
                displayIncoming(msg);
            }

            // Re-render prompt
            process.stdout.write(dim('  > '));
        } catch {
            // Drop malformed
        }
    });

    ws.on('close', () => {
        print('');
        print(err('  ✗ relay connection severed'));
        print(dim('  channel terminated'));
        print('');
        process.exit(0);
    });

    ws.on('error', (e) => {
        print('');
        print(err(`  ✗ connection failed: ${e.message}`));
        print(dim('  verify server is running and URL is correct'));
        print('');
        process.exit(1);
    });
}

main();
