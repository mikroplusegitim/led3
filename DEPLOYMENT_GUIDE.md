# 🚀 DEPLOYMENT GUIDE - SATIŞ İÇİN HAZIR SİSTEM

Bu döküman sistemi **HiveMQ Cloud + Firebase + Netlify** ile production'a almanız için gerekli tüm adımları içerir.

## 📋 ÖN HAZIRLIK

### 1. Gerekli Hesaplar

- [ ] [Firebase Console](https://console.firebase.google.com) - Google hesabı ile ücretsiz
- [ ] [HiveMQ Cloud](https://console.hivemq.cloud) - Ücretsiz Serverless plan
- [ ] [Netlify](https://app.netlify.com) - GitHub ile ücretsiz kayıt
- [ ] GitHub hesabı (kod repository için)

---

## 🔥 FIREBASE KURULUMU

### Adım 1: Firebase Projesi Oluştur

1. [Firebase Console](https://console.firebase.google.com)'a git
2. "Add project" tıkla
3. Proje adı gir: `led-control-saas`
4. Google Analytics opsiyonel (kapatabilirsiniz)
5. Proje oluşturulsun (30 saniye sürer)

### Adım 2: Firebase Web App Ekle

1. Project Overview > Web icon (</>) tıkla
2. App nickname: `LED Control Web`
3. Firebase Hosting ✅ seç
4. "Register app" tıkla
5. **ÖNEMLİ:** Firebase config değerlerini kopyala

```javascript
// Bu değerleri kopyalayın ve frontend/.env dosyasına ekleyin
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "led-control-saas.firebaseapp.com",
  projectId: "led-control-saas",
  storageBucket: "led-control-saas.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123:web:abc",
  measurementId: "G-ABC123"
};
```

### Adım 3: Authentication Aktifleştir

1. Firebase Console > Authentication
2. "Get started" tıkla
3. Sign-in method sekmesi
4. "Email/Password" aktif et
5. "Save"

### Adım 4: Firestore Database Oluştur

1. Firebase Console > Firestore Database
2. "Create database"
3. **Production mode** seç (security rules zaten hazır)
4. Location: `europe-west` seç
5. "Enable"

### Adım 5: Firestore Rules Deploy

```bash
cd /home/user/led3
npm install -g firebase-tools
firebase login
firebase init firestore
# Mevcut firestore.rules ve firestore.indexes.json kullan
firebase deploy --only firestore:rules,firestore:indexes
```

### Adım 6: Cloud Functions (Opsiyonel - Provisioning için)

```bash
firebase init functions
# JavaScript seç
# ESLint evet
cd functions
npm install
```

`functions/index.js` oluştur:

```javascript
const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

exports.provisionDevice = functions.https.onRequest(async (req, res) => {
  const { deviceMac, claimToken } = req.body;

  // Claim token doğrula (hardcoded veya database'den)
  const validTokens = ['CLAIM-TOKEN-123', 'CLAIM-TOKEN-456'];

  if (!validTokens.includes(claimToken)) {
    return res.status(403).json({ error: 'Invalid claim token' });
  }

  // Device ID oluştur
  const deviceId = deviceMac.replace(/:/g, '').toLowerCase();

  // Tenant ID - ilk kullanıcı için yeni tenant, sonrakiler mevcut tenant
  // Bu örnekte her device yeni tenant (gerçekte admin panelinden atanmalı)
  const tenantId = 'tenant-' + deviceId.substring(0, 8);

  try {
    // Firestore'a device kaydı
    await admin.firestore().collection('devices').doc(deviceId).set({
      deviceId,
      deviceMac,
      tenantId,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      isOnline: false
    });

    res.json({
      success: true,
      deviceId,
      tenantId,
      message: 'Device provisioned successfully'
    });
  } catch (error) {
    console.error('Provisioning error:', error);
    res.status(500).json({ error: 'Provisioning failed' });
  }
});
```

Deploy:

```bash
firebase deploy --only functions
```

---

## 🐝 HIVEMQ CLOUD KURULUMU

### Adım 1: HiveMQ Cloud Hesabı Oluştur

1. [HiveMQ Cloud Console](https://console.hivemq.cloud)'a git
2. "Sign Up Free" tıkla
3. Email ile kayıt ol

### Adım 2: Serverless Cluster Oluştur

1. "Create new cluster" tıkla
2. **Serverless** plan seç (ücretsiz)
3. Cluster adı: `led-control-cluster`
4. Region: `EU (Frankfurt)` veya size yakın bölge
5. "Create" tıkla (2-3 dakika sürer)

### Adım 3: Credentials Oluştur

1. Cluster açıldıktan sonra "Access Management" sekmesi
2. "Add new credential" tıkla
3. Username: `led-control-user`
4. Password: Güçlü bir şifre (kaydet!)
5. Permissions:
   - **Publish:** `tenant/#` (tüm tenant'lara publish izni)
   - **Subscribe:** `tenant/#` (tüm tenant'lara subscribe izni)
6. "Create"

### Adım 4: Connection Details

Cluster Overview'dan kopyala:

```
Host: abc123def456.s1.eu.hivemq.cloud
Port: 8883 (TLS)
WebSocket URL: wss://abc123def456.s1.eu.hivemq.cloud:8884/mqtt
```

### Adım 5: Firestore'a MQTT Credentials Ekle

Firebase Console > Firestore > "Start collection":

```
Collection ID: mqttCredentials
Document ID: <tenant-id> (örn: tenant-12345678)
Fields:
  username: "led-control-user"
  password: "your-strong-password"
```

**ÖNEMLİ:** Production'da şifreler encrypted olmalı!

---

## 🌐 NETLIFY DEPLOYMENT

### Adım 1: GitHub Repository Oluştur

```bash
cd /home/user/led3
git init
git add .
git commit -m "Initial commit - Multi-tenant LED control system"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/led-control-saas.git
git push -u origin main
```

### Adım 2: Netlify'da Site Oluştur

1. [Netlify Dashboard](https://app.netlify.com)'a git
2. "Add new site" > "Import an existing project"
3. GitHub ile bağlan
4. Repository seç: `led-control-saas`
5. Build settings:
   - **Build command:** `cd frontend && npm run build`
   - **Publish directory:** `frontend/dist`
6. "Deploy site" tıkla

### Adım 3: Environment Variables Ekle

Netlify Dashboard > Site settings > Build & deploy > Environment variables

```
VITE_FIREBASE_API_KEY=AIza...
VITE_FIREBASE_AUTH_DOMAIN=led-control-saas.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=led-control-saas
VITE_FIREBASE_STORAGE_BUCKET=led-control-saas.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123:web:abc
VITE_FIREBASE_MEASUREMENT_ID=G-ABC123
VITE_HIVEMQ_BROKER_URL=wss://abc123def456.s1.eu.hivemq.cloud:8884/mqtt
VITE_HIVEMQ_USERNAME=led-control-user
VITE_HIVEMQ_PASSWORD=your-strong-password
```

"Save" ve "Trigger deploy"

### Adım 4: Firebase Authorized Domains Ekle

1. Firebase Console > Authentication > Settings > Authorized domains
2. Netlify URL'i ekle: `your-app-name.netlify.app`
3. (Opsiyonel) Custom domain varsa onu da ekle

---

## 📱 ESP32 KURULUMU

### Adım 1: Arduino IDE Hazırlık

1. Arduino IDE'yi aç
2. File > Preferences > Additional Board Manager URLs:
   ```
   https://raw.githubusercontent.com/espressif/arduino-esp32/gh-pages/package_esp32_index.json
   ```
3. Tools > Board > Boards Manager
4. "esp32" ara ve yükle
5. Gerekli kütüphaneler:
   - FastLED
   - PubSubClient
   - ArduinoJson

### Adım 2: Kod Güncelleme

`esp32/maket_led_hivemq.ino` dosyasını aç:

```cpp
// WiFi ayarları
#define WIFI_SSID "YourWiFiName"
#define WIFI_PASS "YourWiFiPassword"

// HiveMQ Cloud ayarları
#define HIVEMQ_BROKER "abc123def456.s1.eu.hivemq.cloud"
#define HIVEMQ_PORT 8883
#define HIVEMQ_USER "led-control-user"
#define HIVEMQ_PASS "your-strong-password"

// Provisioning
#define PROVISION_URL "https://us-central1-led-control-saas.cloudfunctions.net/provisionDevice"
#define CLAIM_TOKEN "CLAIM-TOKEN-123"  // Her cihaz için unique olmalı
```

### Adım 3: Upload

1. ESP32-S3'ü bilgisayara bağla
2. Tools > Board > ESP32 > ESP32-S3 Dev Module
3. Tools > Port > (ESP32'nin bağlı olduğu port)
4. Upload

### Adım 4: Test

1. Serial Monitor aç (115200 baud)
2. WiFi bağlantısını kontrol et
3. Provisioning başarılı mı?
4. HiveMQ Cloud bağlantısı OK mı?

---

## ✅ TEST SÜRECİ

### Frontend Test

1. Netlify URL'i aç: `https://your-app.netlify.app`
2. "Kayıt Ol" tıkla
3. Firma adı, email, şifre gir
4. Giriş yap
5. Dashboard açıldı mı?

### MQTT Test

1. [HiveMQ WebSocket Client](https://www.hivemq.com/demos/websocket-client/) aç
2. Connect:
   - Host: `abc123def456.s1.eu.hivemq.cloud`
   - Port: `8884`
   - Path: `/mqtt`
   - Username/Password: credentials
3. Subscribe: `tenant/+/device/+/status`
4. ESP32'den status mesajı geldi mi?

### End-to-End Test

1. Web arayüzünden daire durumu değiştir
2. ESP32'de LED yandı mı?
3. HiveMQ WebSocket'te mesaj gördün mü?
4. Firestore'da kayıt oluştu mu?

---

## 💰 FİYATLANDIRMA (Başlangıç)

Sistemi şu şekilde satabilirsiniz:

### Starter Plan - ₺2,500/ay

- 1 ESP32 cihaz
- 5 bina kontrolü
- Email destek
- Web dashboard

### Professional Plan - ₺7,500/ay

- 5 ESP32 cihaz
- 20 bina kontrolü
- API erişimi
- Priority destek
- Analytics

### Enterprise Plan - İletişim

- Sınırsız cihaz
- Sınırsız bina
- White-label
- Custom integration
- 7/24 destek

---

## 🎯 İLK MÜŞTERİ ADIMLAR

1. ✅ Demo ortam hazır (Netlify URL)
2. ✅ Test cihazı yapılandırılmış
3. ✅ Prezentasyon materyalleri:
   - Landing page (web site)
   - Demo video (ekran kaydı)
   - Teknik döküman (bu dosya)
4. ✅ Müşteri onboarding:
   - Kayıt formu
   - ESP32 gönderimi
   - Kurulum desteği (email/video)
5. ✅ Payment:
   - Stripe/Iyzico entegrasyonu (sonraki aşama)
   - Manuel fatura (başlangıç için)

---

## 🔒 GÜVENLİK ÖNERİLERİ

### Production Checklist

- [ ] Firebase .env değerleri GitHub'a commitlenmemeli
- [ ] HiveMQ şifreleri Firestore'da encrypted
- [ ] Firestore Rules deploy edildi
- [ ] Firebase Auth email verification aktif
- [ ] Rate limiting (Firebase App Check)
- [ ] HTTPS everywhere (Netlify otomatik)
- [ ] ESP32 OTA update mekanizması
- [ ] Backup stratejisi (Firestore export)

---

## 📞 DESTEK

Herhangi bir sorun için:

- Firebase: [https://firebase.google.com/support](https://firebase.google.com/support)
- HiveMQ: [https://www.hivemq.com/support/](https://www.hivemq.com/support/)
- Netlify: [https://docs.netlify.com/](https://docs.netlify.com/)

---

## 🎉 BAŞARI!

Sisteminiz artık satışa hazır! Müşteri ekledikçe Firebase Firestore otomatik ölçeklenecek ve maliyetler pay-as-you-go olacak.

İlk 10 müşteri ile break-even, 50+ müşteri ile güzel gelir! 💰
