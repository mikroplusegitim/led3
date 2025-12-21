# 🚀 Hızlı Başlangıç Kılavuzu

## Adım 1: MQTT Broker Kurulumu (Mosquitto)

### Windows

1. İndirin: https://mosquitto.org/download/
2. Kurun ve `mosquitto.conf` dosyasına ekleyin:

```
listener 1883
listener 9001
protocol websockets
```

3. Servisi başlatın:
```powershell
net start mosquitto
```

### Linux/macOS

```bash
# Linux
sudo apt-get install mosquitto mosquitto-clients

# macOS
brew install mosquitto
```

## Adım 2: Projeyi Kurun

```bash
# Tüm bağımlılıkları yükle
npm run install:all
```

## Adım 3: Backend Ayarları

```bash
cd backend
copy .env.example .env   # Windows
# veya
cp .env.example .env     # Linux/macOS
```

`.env` dosyasını düzenleyin:
```env
MQTT_BROKER_URL=localhost
MQTT_PORT=1883
PORT=3001
```

## Adım 4: Uygulamayı Başlatın

```bash
# Ana klasörde
npm run dev
```

Bu komut hem frontend hem backend'i başlatır:
- Frontend: http://localhost:3000
- Backend: http://localhost:3001

## Adım 5: Test Edin

1. Tarayıcıda http://localhost:3000 açın
2. Sağ üstte **"● Bağlı"** yazısını görmelisiniz
3. Daire numarası girin ve butonlara tıklayın

## ESP32 Kurulumu (Opsiyonel)

1. Arduino IDE'yi açın
2. `esp32/maket_led_mqtt.ino` dosyasını açın
3. WiFi ve MQTT ayarlarını düzenleyin:

```cpp
#define WIFI_SSID "your-wifi-name"
#define WIFI_PASS "your-wifi-password"
#define MQTT_BROKER "192.168.1.x"  // Bilgisayarınızın IP'si
```

4. ESP32'ye yükleyin

## Sorun Giderme

### "Bağlantı Yok" görünüyorsa:

1. Mosquitto çalışıyor mu kontrol edin
2. Backend çalışıyor mu kontrol edin
3. Tarayıcı konsolunda (F12) hataları kontrol edin

### MQTT bağlantı hatası:

```bash
# Mosquitto'yu test edin
mosquitto_sub -h localhost -t "test" -v
# Başka terminalde:
mosquitto_pub -h localhost -t "test" -m "merhaba"
```
