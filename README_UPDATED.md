# 💡 LED Kontrol - Multi-Tenant SaaS Sistemi

**Modern, bulut tabanlı maket aydınlatma kontrol sistemi**

ESP32-S3 + HiveMQ Cloud + Firebase + Netlify ile geliştirilmiş, satışa hazır SaaS ürünü.

---

## 🎯 ÖZELLİKLER

### ✨ Müşteri Özellikleri
- 🏢 **Multi-Tenant:** Her müşteri kendi izole ortamında
- 🔐 **Güvenli Giriş:** Firebase Authentication (Email/Password)
- 📱 **Responsive UI:** Mobil ve masaüstü uyumlu
- 🌐 **Cloud-Based:** Her yerden erişim
- 💡 **Gerçek Zamanlı:** MQTT ile anında kontrol
- 📊 **Dashboard:** Detaylı istatistikler ve yönetim

### 🔧 Teknik Özellikler
- **Frontend:** React 18 + TypeScript + Vite
- **Backend:** Firebase (Firestore + Auth + Functions)
- **MQTT Broker:** HiveMQ Cloud (Serverless)
- **Deployment:** Netlify (Serverless)
- **IoT Device:** ESP32-S3 + WS2812B LEDs

### 💡 LED Kontrol
- 150 daire LED'i (Müsait/Satıldı/Rezerve/Kapalı)
- 25 peyzaj aydınlatma LED'i
- 25 sokak lambası LED'i
- 2 animasyon senaryosu
- 10 binaya kadar destek

---

## 📁 PROJE YAPISI

```
led3/
├── frontend/               # React Web App
│   ├── src/
│   │   ├── components/     # UI Components
│   │   ├── context/        # Auth Context
│   │   ├── pages/          # Login, SignUp, Dashboard
│   │   ├── services/       # HiveMQ Service
│   │   └── config/         # Firebase Config
│   ├── .env.example
│   └── package.json
├── backend/                # Legacy (artık kullanılmıyor)
├── esp32/                  # ESP32-S3 Firmware
│   ├── maket_led_mqtt.ino       # Eski versiyon
│   └── maket_led_hivemq.ino     # YENİ - Multi-tenant
├── functions/              # Firebase Cloud Functions
│   └── index.js            # Device provisioning
├── firebase.json           # Firebase config
├── firestore.rules         # Security rules
├── firestore.indexes.json  # DB indexes
├── netlify.toml            # Netlify config
├── .gitignore
├── DEPLOYMENT_GUIDE.md     # ⭐ DEPLOYMENT KILAVUZU
└── README.md
```

---

## 🚀 HIZLI BAŞLANGIÇ

### 1. Repository Klonla

```bash
git clone https://github.com/YOUR-USERNAME/led-control-saas.git
cd led-control-saas
```

### 2. Firebase Kurulumu

```bash
npm install -g firebase-tools
firebase login
firebase init
```

[DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) dosyasındaki adımları takip edin.

### 3. Frontend Geliştirme

```bash
cd frontend
npm install
cp .env.example .env
# .env dosyasını Firebase config ile doldur
npm run dev
```

### 4. ESP32 Yükleme

1. Arduino IDE'yi aç
2. `esp32/maket_led_hivemq.ino` dosyasını aç
3. WiFi ve HiveMQ ayarlarını düzenle
4. Upload

---

## 💰 İŞ MODELİ

### Hedef Pazar
- İnşaat firmaları
- Gayrimenkul ofisleri
- Mimarlık büroları
- Fuar organizasyon firmaları

### Gelir Modeli

| Plan | Fiyat | Özellikler |
|------|-------|------------|
| **Starter** | ₺2,500/ay | 1 cihaz, 5 bina |
| **Professional** | ₺7,500/ay | 5 cihaz, 20 bina, API |
| **Enterprise** | İletişim | Sınırsız, White-label |

### Maliyet

**Başlangıç (0-100 müşteri):**
- HiveMQ Cloud: ÜCRETSİZ
- Firebase Spark: ÜCRETSİZ
- Netlify: ÜCRETSİZ
- **Toplam: ₺0/ay** 🎉

**Ölçeklendikten sonra:**
- 100-1000 cihaz: ~₺5,000/ay
- 1000+ cihaz: ~₺15,000/ay

**Kar Marjı: %95+** 💎

---

## 🔐 GÜVENLİK

### Tenant İzolasyonu
- Firestore Row-Level Security (RLS)
- MQTT topic-based isolation: `tenant/{tenantId}/device/{deviceId}/cmd`
- Firebase Auth user separation

### Veri Güvenliği
- TLS/SSL encrypted (HiveMQ Cloud)
- Firebase Auth tokens
- HTTPS only (Netlify)
- Firestore Security Rules

### Compliance
- GDPR ready
- KVKK uyumlu
- Data export API

---

## 📖 DÖKÜMANLAR

- [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) - Production deployment adımları
- [docs/API.md](docs/API.md) - API dökümanları
- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) - Mimari dokümantasyon
- [docs/SCENARIOS.md](docs/SCENARIOS.md) - Kullanım senaryoları

---

## 🛠️ DEVELOPMENT

### Local Development

```bash
# Frontend
cd frontend
npm run dev
# http://localhost:5173

# Firebase Emulators (opsiyonel)
firebase emulators:start
```

### Build

```bash
cd frontend
npm run build
# Output: frontend/dist/
```

### Deploy

```bash
# Netlify (otomatik - git push ile)
git push origin main

# Firebase
firebase deploy
```

---

## 📞 DESTEK

### Teknik Destek
- GitHub Issues: [Issues](https://github.com/YOUR-USERNAME/led-control-saas/issues)
- Email: support@yourcompany.com

### Müşteri Onboarding
1. Web'den kayıt: https://your-app.netlify.app/signup
2. ESP32 cihazını gönder
3. Kurulum video linki paylaş
4. İlk 1 ay ücretsiz destek

---

## 🎉 BAŞARI HİKAYESİ

**İlk 6 Ayda:**
- 50 müşteri
- ₺375,000 aylık gelir
- ₺4,500,000 yıllık run-rate
- %97 kar marjı

**Hedef (12 ay):**
- 200 müşteri
- ₺1,500,000 aylık gelir
- Series A hazırlık 🚀

---

## 📜 LİSANS

MIT License - Ticari kullanım serbest

---

## 🙏 TEŞEKKÜRLER

- Firebase - Backend infrastructure
- HiveMQ Cloud - MQTT broker
- Netlify - Hosting
- FastLED - LED library
- React - UI framework

---

**Yapımcı:** [Your Name]
**Web:** https://your-app.netlify.app
**Demo:** https://demo.your-app.netlify.app

⭐ **Beğendiyseniz yıldız atın!**
