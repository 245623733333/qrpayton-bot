const express = require('express');
const bodyParser = require('body-parser');
const TelegramBot = require('node-telegram-bot-api');
const QRCode = require('qrcode');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
app.use(bodyParser.json());

// Start bot
const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });
console.log(`✅ Bot is running on port ${PORT}`);

// === /start Command ===
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, '👋 Welcome to QRPayTON!\n\nUse /create to generate a TON QR code, or /pay <amount in BRL> to convert.');
});

// === /create Command ===
bot.onText(/\/create/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, '💰 Enter the amount of TON you want to receive:');

  bot.once('message', async (msg) => {
    const amount = parseFloat(msg.text);
    const address = process.env.TON_RECIPIENT_ADDRESS;

    if (isNaN(amount)) {
      bot.sendMessage(chatId, '❌ Invalid amount. Please enter a valid number.');
      return;
    }

    try {
      const tonAmountNano = BigInt(Math.floor(amount * 1e9));
      const tonUri = `ton://transfer/${address}?amount=${tonAmountNano.toString()}`;
      const qrBuffer = await QRCode.toBuffer(tonUri);

      bot.sendPhoto(chatId, qrBuffer, {
        caption: `✅ Scan to pay *${amount} TON*\n\n🔗 [Payment Link](${tonUri})`,
        parse_mode: 'Markdown'
      });
    } catch (error) {
      console.error('QR Error:', error);
      bot.sendMessage(chatId, '❌ Failed to generate QR code.');
    }
  });
});

// === BRL to TON conversion ===
async function getTonToBrlRate() {
  try {
    const res = await axios.get('https://api.coingecko.com/api/v3/simple/price?ids=toncoin&vs_currencies=brl');
    return res.data.toncoin.brl;
  } catch (err) {
    console.error('Exchange rate fetch failed:', err);
    return null;
  }
}

// === /pay <amount_in_brl> Command ===
bot.onText(/\/pay (\d+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const brlAmount = parseFloat(match[1]);
  const rate = await getTonToBrlRate();

  if (!rate) {
    bot.sendMessage(chatId, '❌ Could not fetch TON price. Try again later.');
    return;
  }

  const tonAmount = (brlAmount / rate).toFixed(4);
  const address = process.env.TON_RECIPIENT_ADDRESS;
  const tonAmountNano = Math.floor(tonAmount * 1e9);
  const tonUri = `ton://transfer/${address}?amount=${tonAmountNano}`;
  const qrBuffer = await QRCode.toBuffer(tonUri);

  bot.sendPhoto(chatId, qrBuffer, {
    caption: `💰 R$${brlAmount} ≈ 💎 *${tonAmount} TON*\n\n🔗 [Pay Now](${tonUri})`,
    parse_mode: 'Markdown'
  });
});
