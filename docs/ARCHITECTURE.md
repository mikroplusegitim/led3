# Mimari Dokümantasyon

## Sistem Mimarisi

```
┌─────────────┐         ┌─────────────┐         ┌─────────────┐
│   Frontend  │────────▶│   Backend   │────────▶│ MQTT Broker │
│  (React)    │  HTTP   │  (Node.js)  │  MQTT   │  (Mosquitto)│
└─────────────┘         └─────────────┘         └─────────────┘
       │                                               │
       │ MQTT (WebSocket)                              │ MQTT
       └───────────────────────────────────────────────┼──────┐
                                                       │      │
                                                       ▼      ▼
                                                ┌─────────────┐
                                                │  ESP32-S3   │
                                                │   (LEDs)    │
                                                └─────────────┘
```

## Bileşenler

### Frontend (React + TypeScript)

- **Konum:** `frontend/`
- **Teknolojiler:**
  - React 18
  - TypeScript
  - Vite (build tool)
  - MQTT.js (WebSocket üzerinden MQTT)
- **Özellikler:**
  - Kullanıcı arayüzü
  - MQTT bağlantı yönetimi
  - Bina ve daire kontrolü
  - Senaryo yönetimi
  - Dashboard ayarlar paneli

### Backend (Node.js + Express)

- **Konum:** `backend/`
- **Teknolojiler:**
  - Express.js
  - MQTT.js
  - JWT (kimlik doğrulama)
  - CORS
- **Özellikler:**
  - RESTful API endpoints
  - MQTT broker bağlantısı
  - Komut yönlendirme
  - Durum takibi
  - Kimlik doğrulama

### ESP32-S3 Firmware

- **Konum:** `esp32/`
- **Teknolojiler:**
  - Arduino Framework
  - FastLED (LED kontrolü)
  - PubSubClient (MQTT)
  - WiFi (ESP32 dahili)
- **Özellikler:**
  - 200 LED kontrolü (150 daire + 25 peyzaj + 25 sokak)
  - MQTT komut dinleme
  - Durum yayınlama
  - Senaryo animasyonları
  - EEPROM ile durum saklama

## Veri Akışı

### Komut Gönderme

1. Kullanıcı frontend'de bir aksiyon yapar (ör: daire durumu değiştir)
2. Frontend MQTT servisi üzerinden komutu gönderir
3. MQTT broker mesajı ESP32-S3'e iletir
4. ESP32-S3 komutu alır ve işler
5. ESP32-S3 durum güncellemesi gönderir
6. Frontend durumu alır ve UI'ı günceller

### Durum Senkronizasyonu

1. ESP32-S3 durum değişikliğinde güncelleme gönderir
2. Frontend MQTT üzerinden durumu dinler
3. Dashboard'daki istatistikler güncellenir

## Güvenlik

### TLS/SSL

- MQTT bağlantıları TLS ile şifrelenebilir
- CA sertifikaları ile doğrulama
- Backend ve ESP32-S3 TLS desteği

### Kimlik Doğrulama

- JWT token tabanlı kimlik doğrulama
- API endpoint'leri token gerektirir (demo modunda opsiyonel)
- MQTT broker kullanıcı adı/şifre desteği

## Ölçeklenebilirlik

### Çoklu Bina Desteği

- Her ESP32-S3 bir bina numarası ile tanımlanır
- Frontend'de bina seçimi yapılabilir
- Komutlar bina numarası ile filtrelenir

### Çoklu Cihaz Desteği

- Her ESP32-S3 benzersiz bir `deviceId` ile tanımlanır
- MQTT topic'leri cihaz bazlı olabilir: `maket/{deviceId}/cmd`
- Backend tüm cihazları yönetebilir

## Performans

- MQTT QoS 1 kullanımı (en az bir kez teslimat garantisi)
- WebSocket üzerinden MQTT (düşük gecikme)
- LED güncellemeleri 30ms aralıklarla (smooth animasyonlar)
