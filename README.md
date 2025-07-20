# 🤖 QR PayTON Bot

A Telegram bot to generate TON payment QR codes in USD using the `/pay` command.

---

## 🚀 Features

- `/start`: Greet the user and explain how to use the bot.
- `/pay <amount> USD`: Converts the specified USD amount to TON, and returns a payment QR code.

---

## ⚙️ Environment Variables

Create a `.env` file in the root of your project with the following:

```env
BOT_TOKEN=your_telegram_bot_token
TON_RECIPIENT_ADDRESS=your_ton_wallet_address
PORT=3000
