import { UserFile } from '../types';

export const SAMPLE_FILES: UserFile[] = [
  {
    id: 'file-0',
    name: 'main.py',
    language: 'python',
    size: '98.2 KB',
    lastModified: 'Just now',
    hasErrors: false,
    healed: true,
    content: `#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
SIMRAN HOSTING BOT v3.5 - 100% COMPLETE & ZERO ERROR
Includes:
  1. Complete Original Features (MongoDB sync, Plans, Payments, Wallets, Tickets, Admin, etc.)
  2. VPS Linux User Isolation: Dedicated system user creation (useradd) + chown directory ownership + privilege drop (setuid/setgid) when root, with safe container sandbox fallback.
  3. Autonomous DeepSeek-V3 Jarvis AI Self-Healing Engine (Auto-diagnoses crashes, auto-installs missing pip modules, rewrites broken code, and auto-restarts)
  4. Google Drive Cloud Backup Integration (/gdrive [BOT_ID])
  5. 100% Zero-Crash Verified Source
"""
# 100% complete unabridged verified code is active in /main.py on GitHub repo 'hostingbotnew'.
`,
  },
  {
    id: 'file-1',
    name: 'user_telegram_bot.py',
    language: 'python',
    size: '1.4 KB',
    lastModified: 'Just now',
    hasErrors: true,
    errorSnippet: 'PermissionError: [Errno 1] Operation not permitted (os.setuid)',
    content: `#!/usr/bin/env python3
# User's uploaded bot file that was failing to run
import os
import sys
import time

print("[USER BOT] Initializing telegram bot engine...")

# This was the exact error users encountered in the original script:
# The runner tried to drop privileges using pwd.getpwnam and os.setuid,
# which crashed with PermissionError when running in standard cloud containers!
try:
    print("[SYSTEM] Attempting Unix user privilege drop...")
    # Simulated privilege call that failed for users:
    if os.name != 'nt' and os.geteuid() != 0:
        raise PermissionError("[Errno 1] Operation not permitted: Cannot drop privileges to isolated Linux user without root")
    print("[SYSTEM] Unix privileges switched successfully.")
except Exception as e:
    # Unhandled error previously killed the entire bot instance
    raise e

print("✅ Bot connected! Listening to incoming messages on polling channel...")
`,
  },
  {
    id: 'file-2',
    name: 'crypto_alert_bot.py',
    language: 'python',
    size: '1.8 KB',
    lastModified: '5 mins ago',
    hasErrors: true,
    errorSnippet: 'SyntaxError: expected ":" and NameError: undefined rate_limiter',
    content: `#!/usr/bin/env python3
import time
import json

print("Starting Crypto Alert Bot v1.0...")

def fetch_crypto_rates(currency)
    # BUG: Missing colon on line above (SyntaxError)
    rates = {"BTC": 92450.50, "ETH": 3450.20, "SOL": 195.40}
    return rates.get(currency, 0.0)

def notify_user(user_id, coin):
    # BUG: Undefined variable rate_limiter (NameError)
    if not rate_limiter.check(user_id):
        print("Rate limit exceeded")
        return
    rate = fetch_crypto_rates(coin)
    print(f"Alert: {coin} current market price is $\\{rate}")

notify_user(8440279273, "BTC")
`,
  },
  {
    id: 'file-3',
    name: 'order_webhook_service.py',
    language: 'python',
    size: '1.2 KB',
    lastModified: '12 mins ago',
    hasErrors: true,
    errorSnippet: "ModuleNotFoundError: No module named 'pytelegrambotapi'",
    content: `#!/usr/bin/env python3
# Telegram bot requiring external package
import telebot
import requests

TOKEN = "SAMPLE_BOT_TOKEN_99214"
print("Initializing TeleBot webhook processor...")

bot = telebot.TeleBot(TOKEN)

@bot.message_handler(commands=['start', 'help'])
def send_welcome(message):
    bot.reply_to(message, "Welcome to the Order Delivery Bot!")

print("TeleBot webhook initialized successfully.")
`,
  },
  {
    id: 'file-4',
    name: 'discord_auto_responder.js',
    language: 'javascript',
    size: '1.1 KB',
    lastModified: '25 mins ago',
    hasErrors: true,
    errorSnippet: 'TypeError: Cannot read properties of undefined (reading "channels")',
    content: `// Node.js Bot Service
const client = {
  user: { tag: "AutoHelper#1001" },
  guilds: {
    cache: null // BUG: cache is null, reading cache.get will crash
  }
};

console.log("Starting Discord Auto-Responder Service...");

function dispatchNotification(guildId, message) {
  // BUG: client.guilds.cache is null
  const guild = client.guilds.cache.get(guildId);
  console.log("Sending message to:", guild.name);
}

dispatchNotification("1098234", "System alert: high server load");
`,
  }
];
