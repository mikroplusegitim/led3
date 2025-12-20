# Kurulum ve Yapılandırma

## Gereksinimler

- Node.js 18+ 
- npm veya yarn
- MQTT Broker (Mosquitto, HiveMQ, vb.)
- ESP32-S3 geliştirme kartı
- Arduino IDE veya PlatformIO

## MQTT Broker Kurulumu

### Mosquitto (Önerilen)

**Windows:**
```bash
# Chocolatey ile
choco install mosquitto

# Veya indirip kurun: https://mosquitto.org/download/
```

**Linux:**
```bash
sudo apt-get update
sudo apt-get install mosquitto mosquitto-clients
```

**macOS:**
```bash
brew install mosquitto
```

### Mosquitto WebSocket Desteği

`mosquitto.conf` dosyasına ekleyin:

```
listener 1883
listener 9001
protocol websockets
```

## Backend Kurulumu

```bash
cd backend
npm install
cp .env.example .env
# .env dosyasını düzenleyin
npm run dev
```

### .env Dosyası Örneği

```env
MQTT_BROKER_URL=mqtt://localhost
MQTT_PORT=1883
MQTT_USERNAME=
MQTT_PASSWORD=
MQTT_TLS=false
PORT=3001
CORS_ORIGIN=http://localhost:3000
JWT_SECRET=your-secret-key-change-in-production
```

## Frontend Kurulumu

```bash
cd frontend
npm install
npm run dev
```

Frontend varsayılan olarak `http://localhost:3000` adresinde çalışacaktır.

## ESP32-S3 Kurulumu

1. Arduino IDE'yi açın
2. Gerekli kütüphaneleri yükleyin:
   - FastLED
   - PubSubClient
   - ArduinoJson
   - WiFi (ESP32 için dahili)

3. `esp32/maketLed.ino` dosyasını açın
4. WiFi ve MQTT ayarlarını düzenleyin:

```cpp
#define WIFI_SSID "your-wifi-ssid"
#define WIFI_PASS "your-wifi-password"
#define MQTT_BROKER "your-mqtt-broker-ip"
#define MQTT_PORT 1883
```

5. Kodu ESP32-S3'e yükleyin

## TLS Yapılandırması (Opsiyonel)

### Sertifika Oluşturma

```bash
# CA sertifikası oluştur
openssl req -new -x509 -days 365 -extensions v3_ca -keyout ca.key -out ca.crt

# Server sertifikası oluştur
openssl genrsa -out server.key 2048
openssl req -new -out server.csr -key server.key
openssl x509 -req -in server.csr -CA ca.crt -CAkey ca.key -CAcreateserial -out server.crt -days 365
```

### Backend TLS Ayarları

`.env` dosyasına ekleyin:

```env
MQTT_TLS=true
MQTT_CA_PATH=./certs/ca.crt
MQTT_CERT_PATH=./certs/server.crt
MQTT_KEY_PATH=./certs/server.key
```

### ESP32-S3 TLS Ayarları

`maketLed.ino` dosyasında:

```cpp
#define USE_TLS true
const char* ca_cert = R"(
-----BEGIN CERTIFICATE-----
...
-----END CERTIFICATE-----
)";
```

## Test

1. MQTT Broker'ın çalıştığını kontrol edin:
```bash
mosquitto_sub -h localhost -t "maket/#" -v
```

2. Backend'i başlatın ve `/api/health` endpoint'ini test edin

3. Frontend'i açın ve MQTT bağlantısını kontrol edin

4. ESP32-S3'ü başlatın ve Serial Monitor'de bağlantı mesajlarını kontrol edin

## Sorun Giderme

### MQTT Bağlantı Sorunları

- Broker'ın çalıştığından emin olun
- Firewall ayarlarını kontrol edin
- IP adreslerinin doğru olduğundan emin olun

### ESP32 Bağlantı Sorunları

- WiFi SSID ve şifresini kontrol edin
- MQTT broker IP adresini kontrol edin
- Serial Monitor'de hata mesajlarını kontrol edin

### Frontend Bağlantı Sorunları

- Browser console'da hata mesajlarını kontrol edin
- MQTT WebSocket portunun açık olduğundan emin olun (varsayılan: 9001)

