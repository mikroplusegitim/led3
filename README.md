# Maket Aydınlatma Kontrol Uygulaması

Modern web tabanlı maket aydınlatma kontrol sistemi. ESP32-S3 ile MQTT üzerinden iletişim sağlar.

## 🚀 Özellikler

- 🏢 **Bina Yönetimi**: Birden fazla bina arasında geçiş yapabilme
- 🏠 **Daire Kontrolü**: Her binadan herhangi bir daireyi kontrol edebilme
- 💡 **Durumlar**: MÜSAİT, SATILDI, REZ, KAPAT
- 🌳 **Çevre Aydınlatma**: Peyzaj ve Sokak lambaları kontrolü
- 🎬 **Senaryolar**: Karşılama Modu, Gece Ambiyansı
- 🔒 **Güvenlik**: TLS ve kimlik doğrulama desteği
- 📡 **MQTT**: JSON mesaj yapısı ile iletişim

## 📁 Proje Yapısı

```
├── frontend/          # React web uygulaması
│   ├── src/
│   │   ├── components/    # React bileşenleri
│   │   ├── services/      # MQTT servisi
│   │   └── App.tsx        # Ana uygulama
│   └── package.json
├── backend/           # Node.js MQTT servisi
│   ├── server.js
│   └── package.json
├── esp32/             # ESP32-S3 Arduino kodu
│   └── maket_led_mqtt.ino
└── docs/              # Dokümantasyon
```

## 🛠️ Kurulum

### 1. Bağımlılıkları Yükle

```bash
npm run install:all
```

### 2. MQTT Broker Kurulumu

Mosquitto veya başka bir MQTT broker kullanabilirsiniz:

```bash
# Ubuntu/Debian
sudo apt install mosquitto mosquitto-clients

# macOS
brew install mosquitto
```

### 3. ESP32 Kurulumu

1. Arduino IDE'yi açın
2. `esp32/maket_led_mqtt.ino` dosyasını açın
3. WiFi ve MQTT ayarlarını düzenleyin:
   ```cpp
   #define WIFI_SSID "YOUR_WIFI_SSID"
   #define WIFI_PASS "YOUR_WIFI_PASSWORD"
   #define MQTT_BROKER "your-mqtt-broker.com"
   ```
4. ESP32-S3 kartına yükleyin

### 4. Backend Ayarları

```bash
cd backend
cp .env.example .env
# .env dosyasını düzenleyin
```

## ▶️ Çalıştırma

### Geliştirme Modu

```bash
# Frontend ve Backend birlikte
npm run dev

# Sadece Frontend
npm run dev:frontend

# Sadece Backend
npm run dev:backend
```

### Üretim Derlemesi

```bash
npm run build
```

## 📡 MQTT Mesaj Yapısı

### Komut Gönderme (maket/cmd)

**Daire Durumu:**
```json
{
  "building": 1,
  "apartment": 25,
  "status": 1
}
```

**Çevre Aydınlatma:**
```json
{
  "environment": "peyzaj",
  "state": true
}
```

**Senaryo:**
```json
{
  "scenario": 1
}
```

### Durum Mesajları (maket/status)

```json
{
  "deviceId": "ESP32-MAKET-001",
  "building": 1,
  "showSold": true,
  "peyzaj": false,
  "sokak": false,
  "animation": 0,
  "apartments": [1, 1, 0, 2, 1, ...]
}
```

## 🎯 Durum Kodları

| Kod | Durum | Renk |
|-----|-------|------|
| 0 | SATILDI | Kırmızı |
| 1 | MÜSAİT | Yeşil |
| 2 | REZERVE | Mavi |
| 3 | KAPALI | Kapalı |

## 🎬 Senaryolar

| Kod | Senaryo | Açıklama |
|-----|---------|----------|
| 0 | KAPALI | Senaryo kapalı |
| 1 | KARŞILAMA | Sıralı yanma + flaş |
| 2 | GECE AMBİYANSI | Nefes alma efekti |

## 📝 Lisans

MIT
