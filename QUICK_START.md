# 🚀 Hızlı Başlangıç ve Test Kılavuzu

## Adım 1: MQTT Broker Kurulumu ve Başlatma

### Windows için Mosquitto Kurulumu

1. **Mosquitto'yu İndirin:**
   - https://mosquitto.org/download/ adresinden Windows installer'ı indirin
   - Veya Chocolatey ile: `choco install mosquitto`

2. **Mosquitto'yu Başlatın:**
   ```powershell
   # Servis olarak başlatmak için (yönetici olarak)
   net start mosquitto
   
   # Veya manuel olarak
   mosquitto -c mosquitto.conf
   ```

3. **WebSocket Desteği İçin:**
   Mosquitto kurulum klasöründe `mosquitto.conf` dosyasını düzenleyin:
   ```
   listener 1883
   listener 9001
   protocol websockets
   ```

### Linux/macOS için

```bash
# Linux
sudo apt-get install mosquitto mosquitto-clients

# macOS
brew install mosquitto

# Başlat
mosquitto -c /etc/mosquitto/mosquitto.conf
```

### MQTT Broker'ın Çalıştığını Test Edin

Yeni bir terminal açın ve şunu çalıştırın:

```bash
# Mesajları dinle
mosquitto_sub -h localhost -t "maket/#" -v
```

Eğer hata almazsanız broker çalışıyor demektir! (Ctrl+C ile çıkın)

---

## Adım 2: Backend Kurulumu ve Başlatma

### 1. Backend Klasörüne Gidin

```bash
cd backend
```

### 2. Bağımlılıkları Yükleyin

```bash
npm install
```

### 3. Environment Dosyasını Oluşturun

`backend` klasöründe `.env` dosyası oluşturun:

```env
MQTT_BROKER_URL=mqtt://localhost
MQTT_PORT=1883
MQTT_USERNAME=
MQTT_PASSWORD=
MQTT_TLS=false
PORT=3001
CORS_ORIGIN=http://localhost:3000
JWT_SECRET=test-secret-key-12345
```

**Not:** Eğer `.env.example` dosyası varsa kopyalayın:
```bash
# Windows PowerShell
copy .env.example .env

# Linux/macOS
cp .env.example .env
```

### 4. Backend'i Başlatın

```bash
npm run dev
```

**Başarılı olursa şunu göreceksiniz:**
```
🚀 Backend server 3001 portunda çalışıyor
📡 MQTT Broker: localhost:1883
✅ MQTT Broker'a bağlandı
📡 maket/status topic'i dinleniyor
```

### 5. Backend'i Test Edin

Yeni bir terminal açın:

```bash
# Health check
curl http://localhost:3001/api/health
```

**Beklenen çıktı:**
```json
{"status":"ok","mqtt":"connected","timestamp":"2024-..."}
```

---

## Adım 3: Frontend Kurulumu ve Başlatma

### 1. Frontend Klasörüne Gidin

Yeni bir terminal açın:

```bash
cd frontend
```

### 2. Bağımlılıkları Yükleyin

```bash
npm install
```

### 3. Frontend'i Başlatın

```bash
npm run dev
```

**Başarılı olursa şunu göreceksiniz:**
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: use --host to expose
```

### 4. Tarayıcıda Açın

Tarayıcınızda şu adresi açın:
```
http://localhost:3000
```

**Göreceğiniz:**
- Arka planda bina görseli
- Alt kısımda kontrol paneli (3 bölüm)
- Sağ altta ayarlar butonu (☰)

---

## Adım 4: ESP32-S3 Kurulumu (Opsiyonel - Demo İçin)

### 1. Arduino IDE Kurulumu

- https://www.arduino.cc/en/software adresinden indirin
- ESP32 board desteğini ekleyin:
  - File → Preferences → Additional Board Manager URLs
  - Şunu ekleyin: `https://raw.githubusercontent.com/espressif/arduino-esp32/gh-pages/package_esp32_index.json`
  - Tools → Board → Boards Manager → "ESP32" ara ve yükle

### 2. Gerekli Kütüphaneleri Yükleyin

Arduino IDE'de:
- Sketch → Include Library → Manage Libraries
- Şunları arayın ve yükleyin:
  - **FastLED** (by Daniel Garcia)
  - **PubSubClient** (by Nick O'Leary)
  - **ArduinoJson** (by Benoit Blanchon)

### 3. ESP32 Kodunu Düzenleyin

`esp32/maketLed.ino` dosyasını açın ve şu satırları düzenleyin:

```cpp
// WiFi ayarları
#define WIFI_SSID "your-wifi-name"      // WiFi adınızı yazın
#define WIFI_PASS "your-wifi-password"  // WiFi şifrenizi yazın

// MQTT ayarları
#define MQTT_BROKER "192.168.1.100"     // Bilgisayarınızın IP adresi
#define MQTT_PORT 1883
```

**Bilgisayarınızın IP adresini öğrenmek için:**
```bash
# Windows
ipconfig

# Linux/macOS
ifconfig
# veya
ip addr
```

### 4. ESP32'ye Yükleyin

1. ESP32-S3'ü USB ile bilgisayara bağlayın
2. Tools → Board → ESP32 Arduino → "ESP32S3 Dev Module" seçin
3. Tools → Port → COM portunu seçin
4. Upload butonuna tıklayın

### 5. Serial Monitor'ü Açın

Tools → Serial Monitor (115200 baud)

**Başarılı olursa şunu göreceksiniz:**
```
=================================
  MIMARI LED KONTROL SISTEMI
  MQTT VERSIYON
=================================
OK Role pinleri hazir (GPIO 5 & 18)
OK LEDler basladi
WiFi baglaniyor.....
OK WiFi baglandi!
IP Adresi: 192.168.1.50
MQTT baglaniyor... baglandi!
Topic dinleniyor: maket/cmd
=================================
SISTEM HAZIR!
=================================
```

---

## Adım 5: Test Senaryoları

### Test 1: Frontend-Backend Bağlantısı

1. Tarayıcıda `http://localhost:3000` açın
2. Sağ üstteki bağlantı durumuna bakın
   - **● Bağlı** (yeşil) = Başarılı
   - **○ Bağlantı Yok** (kırmızı) = MQTT bağlantısı yok

### Test 2: Daire Durumu Değiştirme

1. "Daire Kontrol" bölümünde bir numara girin (örn: 5)
2. "Musait" butonuna tıklayın
3. MQTT dinleyici terminalinde şunu görmelisiniz:
   ```
   maket/cmd {"building":1,"apartment":5,"status":1}
   ```

### Test 3: Çevre Aydınlatma

1. "Cevre & Filtre" bölümünde "Peyzaj Aydinlatma" butonuna tıklayın
2. Buton altın rengine dönmeli (aktif)
3. MQTT mesajı:
   ```
   maket/cmd {"environment":"peyzaj","state":true}
   ```

### Test 4: Senaryo Testi

1. "Senaryolar" bölümünde "Karsilama Modu" butonuna tıklayın
2. Buton yanıp sönmeye başlamalı (aktif)
3. MQTT mesajı:
   ```
   maket/cmd {"scenario":1}
   ```

### Test 5: Bina Değiştirme

1. Sağ alttaki ayarlar butonuna (☰) tıklayın
2. Sağdan açılan panelde "Bina 2" butonuna tıklayın
3. Ana ekranda "Bina: 2" yazısı görünmeli

### Test 6: ESP32-S3 ile Entegrasyon (Fiziksel Test)

1. ESP32-S3 bağlı ve çalışıyor olmalı
2. Frontend'den bir daire durumu değiştirin
3. ESP32 Serial Monitor'de şunu görmelisiniz:
   ```
   MQTT Mesaj alindi [maket/cmd]: {"building":1,"apartment":5,"status":1}
   >> Daire 5 -> MUSAIT
   ```
4. LED'ler güncellenmeli

---

## Sorun Giderme

### ❌ Backend MQTT Bağlantı Hatası

**Sorun:** `MQTT Broker'a bağlanılamadı`

**Çözüm:**
1. Mosquitto'nun çalıştığından emin olun
2. `.env` dosyasındaki `MQTT_BROKER_URL` değerini kontrol edin
3. Firewall'u kontrol edin

### ❌ Frontend MQTT Bağlantı Yok

**Sorun:** Tarayıcıda "○ Bağlantı Yok" görünüyor

**Çözüm:**
1. Backend'in çalıştığından emin olun
2. MQTT broker'ın WebSocket portunu kontrol edin (9001)
3. Browser console'u açın (F12) ve hataları kontrol edin
4. Ayarlar panelinden MQTT URL'ini kontrol edin

### ❌ ESP32 WiFi Bağlantı Hatası

**Sorun:** `WiFi baglaniyor.....` sonsuz döngüde

**Çözüm:**
1. WiFi SSID ve şifresini kontrol edin
2. ESP32'nin WiFi sinyal menzilinde olduğundan emin olun
3. Serial Monitor'de hata mesajlarını kontrol edin

### ❌ ESP32 MQTT Bağlantı Hatası

**Sorun:** `MQTT baglaniyor...` bağlanamıyor

**Çözüm:**
1. MQTT broker IP adresini kontrol edin
2. ESP32 ve bilgisayarın aynı ağda olduğundan emin olun
3. Firewall'u kontrol edin
4. MQTT broker'ın çalıştığından emin olun

### ❌ Port Zaten Kullanılıyor

**Sorun:** `Port 3001 already in use`

**Çözüm:**
```bash
# Windows - Port'u kullanan process'i bul
netstat -ano | findstr :3001

# Linux/macOS
lsof -i :3001

# Process'i sonlandırın veya .env'de farklı port kullanın
```

---

## Hızlı Test Komutları

### MQTT Mesaj Gönderme (Test)

```bash
# Daire durumu değiştir
mosquitto_pub -h localhost -t maket/cmd -m '{"building":1,"apartment":5,"status":1}'

# Peyzaj aydınlatmayı aç
mosquitto_pub -h localhost -t maket/cmd -m '{"environment":"peyzaj","state":true}'

# Senaryo başlat
mosquitto_pub -h localhost -t maket/cmd -m '{"scenario":1}'
```

### MQTT Mesaj Dinleme

```bash
# Tüm maket mesajlarını dinle
mosquitto_sub -h localhost -t "maket/#" -v

# Sadece komutları dinle
mosquitto_sub -h localhost -t "maket/cmd" -v

# Sadece durumları dinle
mosquitto_sub -h localhost -t "maket/status" -v
```

---

## Başarılı Test Checklist ✅

- [ ] MQTT Broker çalışıyor
- [ ] Backend başarıyla başladı ve MQTT'ye bağlandı
- [ ] Frontend tarayıcıda açılıyor
- [ ] Frontend'de "● Bağlı" durumu görünüyor
- [ ] Daire durumu değiştirme çalışıyor
- [ ] Çevre aydınlatma kontrolü çalışıyor
- [ ] Senaryolar çalışıyor
- [ ] Bina değiştirme çalışıyor
- [ ] ESP32-S3 bağlanıyor ve mesaj alıyor (opsiyonel)
- [ ] LED'ler güncelleniyor (opsiyonel)

---

## Sonraki Adımlar

1. **Production için TLS kurulumu:** `docs/SETUP.md` dosyasına bakın
2. **Güvenlik:** JWT secret'ı değiştirin ve kimlik doğrulamayı aktif edin
3. **Özelleştirme:** Senaryo parametrelerini `docs/SCENARIOS.md` dosyasına göre ayarlayın

**Sorularınız için:** `docs/` klasöründeki dokümantasyonlara bakın veya GitHub issues açın.



