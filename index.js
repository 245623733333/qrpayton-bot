const express = require('express');
const axios = require('axios');
const TelegramBot = require('node-telegram-bot-api');
require('dotenv').config();

const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });
const app = express();
const port = process.env.PORT || 3000;

const recipientAddress = process.env.TON_RECIPIENT_ADDRESS;

// ✅ Fetch TON price using CoinGecko
async function getTonPrice(currency = 'USD') {
  try {
    const response = await axios.get('https://api.coingecko.com/api/v3/simple/price', {
      params: {
        ids: 'the-open-network',
        vs_currencies: currency.toLowerCase()
      }
    });
    return response.data['the-open-network'][currency.toLowerCase()];
  } catch (error) {
    console.error('❌ Failed to fetch TON price:', error.message);
    return null;
  }
}

// 💸 /pay command
bot.onText(/\/pay (\d+(\.\d{1,2})?) (USD|BRL)/i, async (msg, match) => {
  const chatId = msg.chat.id;
  const amountFiat = parseFloat(match[1]);
  const currency = match[3].toUpperCase();

  const tonPrice = await getTonPrice(currency);
  if (!tonPrice) {
    return bot.sendMessage(chatId, '❌ Failed to fetch TON price.');
  }

  const tonAmount = (amountFiat / tonPrice).toFixed(4);
  const qrData = `ton://transfer/${recipientAddress}?amount=${tonAmount}`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(qrData)}`;
  const caption = `💸 Pay ${tonAmount} TON (~${amountFiat} ${currency})\n📬 Address: \`${recipientAddress}\``;

  bot.sendPhoto(chatId, qrUrl, {
    caption,
    parse_mode: 'Markdown'
  });
});

// 🌐 Express server (optional for uptime)
app.listen(port, () => {
  console.log(`🌐 Express server running on port ${port}`);
});
