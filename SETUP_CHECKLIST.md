# ✅ SETUP CHECKLIST - Sistemi Satışa Hazırlama

Bu checklist'i takip ederek sisteminizi **1-2 gün içinde** satışa hazır hale getirebilirsiniz.

---

## 📋 ÖN HAZIRLIK (30 dakika)

### Hesaplar Oluştur

- [ ] Firebase Console hesabı (Google ile ücretsiz)
  - URL: https://console.firebase.google.com
  - Plan: Spark (Ücretsiz)

- [ ] HiveMQ Cloud hesabı
  - URL: https://console.hivemq.cloud
  - Plan: Serverless (Ücretsiz 100 cihaz)

- [ ] Netlify hesabı
  - URL: https://app.netlify.com
  - GitHub ile giriş yap

- [ ] GitHub hesabı (kod için)
  - URL: https://github.com

---

## 🔥 FIREBASE SETUP (45 dakika)

### 1. Proje Oluştur

- [ ] Firebase Console > "Add project"
- [ ] Proje adı: `led-control-saas`
- [ ] Google Analytics: KAPALI (hızlı setup için)
- [ ] "Create project" tıkla

### 2. Web App Ekle

- [ ] Project Overview > Web icon `</>`
- [ ] App nickname: `LED Control Web`
- [ ] Firebase Hosting: ✅ işaretle
- [ ] "Register app"
- [ ] **ÖNEMLİ:** Config değerlerini kopyala ve kaydet

### 3. Authentication Aktif

- [ ] Authentication > "Get started"
- [ ] Sign-in method > Email/Password > "Enable"
- [ ] "Save"

### 4. Firestore Database

- [ ] Firestore Database > "Create database"
- [ ] **Production mode** seç
- [ ] Location: `europe-west` seç
- [ ] "Enable"

### 5. Deploy Rules & Indexes

```bash
cd /path/to/led3
npm install -g firebase-tools
firebase login
firebase init
# Sadece Firestore, Functions, Hosting seç
# Existing project > led-control-saas
# Mevcut dosyaları kullan (Y)
firebase deploy --only firestore
```

---

## 🐝 HIVEMQ CLOUD SETUP (20 dakika)

### 1. Cluster Oluştur

- [ ] Console > "Create new cluster"
- [ ] Plan: **Serverless** (ücretsiz)
- [ ] Name: `led-control-cluster`
- [ ] Region: `EU (Frankfurt)`
- [ ] "Create" (2-3 dakika bekle)

### 2. Credentials Oluştur

- [ ] Cluster açıldı > "Access Management"
- [ ] "Add new credential"
- [ ] Username: `led-control-user`
- [ ] Password: **GÜÇLÜ ŞİFRE OLUŞTUR VE KAYDET**
- [ ] Permissions:
  - Publish: `tenant/#`
  - Subscribe: `tenant/#`
- [ ] "Create"

### 3. Connection Details Kaydet

- [ ] Cluster Overview > Connection settings kopyala:
  ```
  Host: xxxxxxxx.s1.eu.hivemq.cloud
  Port: 8883 (TLS)
  WebSocket: wss://xxxxxxxx.s1.eu.hivemq.cloud:8884/mqtt
  ```

### 4. Firestore'a Credentials Ekle

- [ ] Firebase Console > Firestore > "Start collection"
- [ ] Collection: `mqttCredentials`
- [ ] Document ID: `default-tenant` (geçici)
- [ ] Fields:
  ```
  username: "led-control-user"
  password: "YOUR-STRONG-PASSWORD"
  ```

---

## 💻 FRONTEND SETUP (30 dakika)

### 1. Dependencies Yükle

```bash
cd led3/frontend
npm install react-router-dom@6.20.0
npm install firebase@10.7.0
npm install
```

### 2. Environment Variables

- [ ] `frontend/.env.example` dosyasını kopyala
  ```bash
  cp .env.example .env
  ```

- [ ] `.env` dosyasını Firebase config ile doldur:
  ```env
  VITE_FIREBASE_API_KEY=AIza...
  VITE_FIREBASE_AUTH_DOMAIN=led-control-saas.firebaseapp.com
  VITE_FIREBASE_PROJECT_ID=led-control-saas
  VITE_FIREBASE_STORAGE_BUCKET=led-control-saas.appspot.com
  VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
  VITE_FIREBASE_APP_ID=1:123:web:abc

  VITE_HIVEMQ_BROKER_URL=wss://xxxxxxxx.s1.eu.hivemq.cloud:8884/mqtt
  VITE_HIVEMQ_USERNAME=led-control-user
  VITE_HIVEMQ_PASSWORD=your-strong-password
  ```

### 3. Update Files

- [ ] `frontend/package.json` → package_UPDATED.json içeriği ile değiştir
- [ ] `frontend/src/App.tsx` → App_Updated.tsx içeriği ile değiştir
- [ ] Auth pages ve Dashboard eklendi mi kontrol et

### 4. Local Test

```bash
npm run dev
# http://localhost:5173 açılacak
```

- [ ] Sign Up sayfası açılıyor mu?
- [ ] Kayıt oluşturabiliyor musun?
- [ ] Giriş yapabiliyor musun?
- [ ] Dashboard açılıyor mu?

---

## 🌐 NETLIFY DEPLOYMENT (20 dakika)

### 1. GitHub Repository

```bash
cd /path/to/led3
git init
git add .
git commit -m "Multi-tenant SaaS ready for deployment"
git branch -M main
```

- [ ] GitHub'da yeni repo oluştur: `led-control-saas`
- [ ] Push kodu:
  ```bash
  git remote add origin https://github.com/YOUR-USERNAME/led-control-saas.git
  git push -u origin main
  ```

### 2. Netlify Site Oluştur

- [ ] Netlify Dashboard > "Add new site"
- [ ] "Import an existing project"
- [ ] GitHub > `led-control-saas` seç
- [ ] Build settings:
  - Build command: `cd frontend && npm run build`
  - Publish directory: `frontend/dist`
- [ ] "Deploy site"

### 3. Environment Variables

- [ ] Site settings > Build & deploy > Environment
- [ ] "Add environment variable" her biri için:
  ```
  VITE_FIREBASE_API_KEY=...
  VITE_FIREBASE_AUTH_DOMAIN=...
  VITE_FIREBASE_PROJECT_ID=...
  VITE_FIREBASE_STORAGE_BUCKET=...
  VITE_FIREBASE_MESSAGING_SENDER_ID=...
  VITE_FIREBASE_APP_ID=...
  VITE_HIVEMQ_BROKER_URL=...
  VITE_HIVEMQ_USERNAME=...
  VITE_HIVEMQ_PASSWORD=...
  ```
- [ ] "Trigger deploy"

### 4. Firebase Authorized Domains

- [ ] Firebase Console > Authentication > Settings
- [ ] Authorized domains > "Add domain"
- [ ] Netlify URL ekle: `your-app-name.netlify.app`
- [ ] "Add"

### 5. Test Production

- [ ] Netlify URL'i aç
- [ ] Kayıt ol
- [ ] Giriş yap
- [ ] Dashboard kontrol et

---

## 📱 ESP32 SETUP (1 saat)

### 1. Arduino IDE Hazırlık

- [ ] Arduino IDE yükle (eğer yoksa)
- [ ] File > Preferences > Additional Board Manager URLs:
  ```
  https://raw.githubusercontent.com/espressif/arduino-esp32/gh-pages/package_esp32_index.json
  ```
- [ ] Tools > Board > Boards Manager > "esp32" ara ve yükle
- [ ] Kütüphaneler yükle:
  - FastLED
  - PubSubClient
  - ArduinoJson

### 2. Kod Yapılandır

- [ ] `esp32/maket_led_hivemq.ino` aç
- [ ] WiFi ayarları:
  ```cpp
  #define WIFI_SSID "YOUR_WIFI"
  #define WIFI_PASS "YOUR_PASSWORD"
  ```
- [ ] HiveMQ ayarları:
  ```cpp
  #define HIVEMQ_BROKER "xxxxxxxx.s1.eu.hivemq.cloud"
  #define HIVEMQ_PORT 8883
  #define HIVEMQ_USER "led-control-user"
  #define HIVEMQ_PASS "your-strong-password"
  ```

### 3. Upload & Test

- [ ] ESP32-S3 bağla
- [ ] Tools > Board > ESP32-S3 Dev Module
- [ ] Tools > Port > (doğru portu seç)
- [ ] Upload (Ctrl+U)
- [ ] Serial Monitor aç (115200 baud)
- [ ] WiFi bağlandı mı?
- [ ] HiveMQ bağlandı mı?

### 4. Web'den Test

- [ ] Web dashboard'a gir
- [ ] Daire durumu değiştir
- [ ] ESP32'de LED yanıyor mu?
- [ ] Serial Monitor'de mesaj görüyormusun?

---

## ✅ SATIŞ HAZIRLIĞI (1 saat)

### 1. Landing Page (Opsiyonel)

- [ ] Landing page oluştur (Netlify'da ayrı site)
- [ ] Özellikler listele
- [ ] Fiyatlandırma göster
- [ ] Demo video ekle
- [ ] İletişim formu

### 2. Demo Video Çek

- [ ] Ekran kaydı başlat
- [ ] Web'de kayıt ol
- [ ] Dashboard'u göster
- [ ] Daire kontrolü yap
- [ ] LED'lerin yandığını göster
- [ ] Senaryoları göster
- [ ] Video'yu YouTube'a yükle

### 3. Dokümantasyon

- [ ] DEPLOYMENT_GUIDE.md hazır
- [ ] README_UPDATED.md hazır
- [ ] Müşteri onboarding dökümanı (basit PDF)

### 4. Fiyatlandırma Belirledi

- [ ] Starter: ₺2,500/ay
- [ ] Professional: ₺7,500/ay
- [ ] Enterprise: Custom

### 5. İletişim Kanalları

- [ ] Email: info@yourcompany.com
- [ ] WhatsApp Business: +90 XXX XXX XX XX
- [ ] LinkedIn profili
- [ ] Twitter/X hesabı

---

## 🎯 İLK MÜŞTERİ (1 gün)

### 1. Hedef Kitle

- [ ] İnşaat firmaları listesi çıkar (10-20 firma)
- [ ] Gayrimenkul ofisleri (10-20 ofis)
- [ ] Mimarlık büroları (5-10 büro)

### 2. Outreach

- [ ] Email template hazırla:
  ```
  Konu: Maket aydınlatmanız için modern çözüm

  Merhaba [Firma Adı],

  İnşaat projelerinizin satış ofislerinde kullandığınız
  maket aydınlatma sistemini modern bulut teknolojisi
  ile yönetmenizi sağlayan bir sistem geliştirdik.

  ✨ Web'den her daire için durum kontrolü
  🌐 Her yerden erişim (tablet, telefon, bilgisayar)
  💡 200+ LED kontrolü
  📊 Satış istatistikleri

  Demo: https://your-app.netlify.app
  Video: https://youtube.com/...

  İlk 3 ay %50 indirimli!

  [İsim]
  [Şirket]
  [Telefon]
  ```

### 3. Demo Randevuları

- [ ] İlk 5 randevu al
- [ ] Fiziksel demo cihazı hazırla
- [ ] Laptop + cihaz + internet

### 4. İlk Satış

- [ ] Fiyat teklifi sun
- [ ] Sözleşme hazırla
- [ ] Ödeme al (Stripe/Banka havalesi)
- [ ] ESP32 gönder
- [ ] Kurulum yap
- [ ] 1 hafta destek ver

---

## 🎉 BAŞARDINIZ!

Sisteminiz satışa hazır! 🚀

**Sonraki Adımlar:**
1. İlk 10 müşteri edin
2. Feedback topla
3. Geliştir
4. Ölçeklendir
5. Series A! 💰

---

**Sorular için:**
- GitHub Issues
- Email: support@yourcompany.com

**İyi satışlar! 🎯**
