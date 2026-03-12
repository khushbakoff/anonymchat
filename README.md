# AnonChat — Anonymous Real-time Messenger

Anonymous, bazasiz, real-vaqt messenger with WebRTC Video/Audio calls.

## 🚀 Tez ishga tushirish

```bash
# 1. Kutubxonalarni o'rnatish
npm install

# 2. Serverni ishga tushirish
npm start

# 3. Brauzerda oching
# http://localhost:3000
```

## 📁 Loyiha tuzilmasi

```
chat/
├── server.js          # Express + Socket.io + PeerJS server
├── package.json       # Dependencies
├── public/
│   └── index.html     # To'liq SPA (UI + Socket.io client + PeerJS)
└── README.md
```

## ✨ Imkoniyatlar

| Xususiyat | Tavsif |
|-----------|--------|
| 🔒 Anonimlik | Hech qanday ma'lumot saqlanmaydi (faqat RAM) |
| ⚡ Real-vaqt chat | Socket.io orqali Telegram tezligida |
| 🎙️ Audio call | WebRTC P2P shifrlangan ovozli aloqa |
| 📹 Video call | HD video qo'ng'iroq |
| ⌨️ Yozish indikatori | "Yozmoqda..." ko'rsatgich |
| 🔗 Xona havolasi | URL orqali do'stlarni taklif qilish |
| 📱 Responsive | Mobile-first dizayn |

## 🌐 Render.com ga deploy qilish (bepul)

1. GitHub repoga yuklaing
2. [render.com](https://render.com) ga kiring → **New Web Service**
3. Reponi ulang, sozlamalar:
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
   - **Environment**: `Node`
4. **Deploy** tugmasini bosing → URL avtomatik beriladi

## 🔧 Environment Variables

```env
PORT=3000   # Default, Render avtomatik o'rnatadi
```

## ⚠️ Muhim

- Server restart bo'lsa barcha xonalar va xabarlar o'chadi (bu maqsadli)
- Video call uchun HTTPS kerak (Render bepul HTTPS beradi)
- Localhost'da audio call ishlaydi, video ham ishlaydi
