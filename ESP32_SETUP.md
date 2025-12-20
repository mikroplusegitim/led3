# 🔌 ESP32-S3 Kurulum Kılavuzu

## 📋 Gereksinimler

1. **Arduino IDE** (1.8.x veya 2.x)
2. **ESP32 Board Desteği**
3. **Gerekli Kütüphaneler:**
   - FastLED
   - PubSubClient
   - ArduinoJson
   - WiFi (ESP32 için dahili)

## 🔧 Adım 1: Arduino IDE Kurulumu

1. Arduino IDE'yi indirin: https://www.arduino.cc/en/software
2. Kurulumu tamamlayın

## 🔧 Adım 2: ESP32 Board Desteği Ekleme

1. Arduino IDE'yi açın
2. **File → Preferences** (veya **Dosya → Tercihler**)
3. **Additional Board Manager URLs** kısmına şunu ekleyin:
   ```
   https://raw.githubusercontent.com/espressif/arduino-esp32/gh-pages/package_esp32_index.json
   ```
4. **OK** tıklayın
5. **Tools → Board → Boards Manager** (veya **Araçlar → Kart → Kart Yöneticisi**)
6. "ESP32" arayın
7. **"esp32 by Espressif Systems"** paketini yükleyin
8. Kurulum tamamlandığında **Close** tıklayın

## 🔧 Adım 3: Gerekli Kütüphaneleri Yükleme

### FastLED
1. **Sketch → Include Library → Manage Libraries** (veya **Çizim → Kütüphane Ekle → Kütüphaneleri Yönet**)
2. "FastLED" arayın
3. **"FastLED by Daniel Garcia"** paketini yükleyin

### PubSubClient
1. Kütüphane yöneticisinde "PubSubClient" arayın
2. **"PubSubClient by Nick O'Leary"** paketini yükleyin

### ArduinoJson
1. Kütüphane yöneticisinde "ArduinoJson" arayın
2. **"ArduinoJson by Benoit Blanchon"** paketini yükleyin (v6 veya v7)

## 🔧 Adım 4: ESP32-S3 Kodunu Düzenleme

1. `esp32/maketLed.ino` dosyasını Arduino IDE'de açın

2. **WiFi Ayarlarını Düzenleyin:**
   ```cpp
   #define WIFI_SSID "your-wifi-name"      // WiFi adınızı yazın
   #define WIFI_PASS "your-wifi-password"  // WiFi şifrenizi yazın
   ```

3. **MQTT Broker Ayarlarını Düzenleyin:**
   ```cpp
   #define MQTT_BROKER "192.168.1.100"     // Bilgisayarınızın IP adresi
   #define MQTT_PORT 1883
   ```

### Bilgisayarınızın IP Adresini Öğrenme

**Windows PowerShell:**
```powershell
ipconfig
```
**IPv4 Address** değerini kullanın (örn: 192.168.1.100)

**Linux/macOS:**
```bash
ifconfig
# veya
ip addr
```

## 🔧 Adım 5: ESP32-S3'e Yükleme

1. **ESP32-S3'ü USB ile bilgisayara bağlayın**

2. **Board Seçimi:**
   - **Tools → Board → ESP32 Arduino → "ESP32S3 Dev Module"** seçin

3. **Port Seçimi:**
   - **Tools → Port → COMx** (ESP32-S3'ün bağlı olduğu port)
   - Windows'ta genellikle COM3, COM4, COM5 gibi görünür

4. **Upload Speed:**
   - **Tools → Upload Speed → "921600"** (veya daha düşük bir değer seçin)

5. **Upload:**
   - **Sketch → Upload** (veya **Ctrl+U**)
   - Veya araç çubuğundaki **→** (Upload) butonuna tıklayın

6. **Yükleme sırasında:**
   - ESP32-S3'teki **BOOT** butonuna basılı tutmanız gerekebilir
   - Yükleme tamamlandığında "Done uploading" mesajını göreceksiniz

## 🔧 Adım 6: Serial Monitor ile Kontrol

1. **Tools → Serial Monitor** (veya **Ctrl+Shift+M**)
2. **Baud Rate:** 115200 seçin
3. Serial Monitor'de şunu görmelisiniz:

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

## 🧪 Test Senaryoları

### Test 1: WiFi Bağlantısı
- Serial Monitor'de "OK WiFi baglandi!" mesajını görmelisiniz
- IP adresi görünmeli

### Test 2: MQTT Bağlantısı
- Serial Monitor'de "MQTT baglaniyor... baglandi!" mesajını görmelisiniz
- "Topic dinleniyor: maket/cmd" mesajı görünmeli

### Test 3: Komut Alma
1. Frontend'den bir daire durumu değiştirin
2. Serial Monitor'de şunu görmelisiniz:
   ```
   MQTT Mesaj alindi [maket/cmd]: {"building":1,"apartment":5,"status":1}
   >> Daire 5 -> MUSAIT
   ```

### Test 4: LED Kontrolü
- Daire durumu değiştirdiğinizde LED'ler güncellenmeli
- Senaryo butonlarına tıkladığınızda animasyonlar çalışmalı

## ❌ Sorun Giderme

### WiFi Bağlanamıyor

**Sorun:** "WiFi baglaniyor....." sonsuz döngüde

**Çözümler:**
1. WiFi SSID ve şifresini kontrol edin
2. ESP32-S3'ün WiFi sinyal menzilinde olduğundan emin olun
3. 2.4GHz WiFi kullanın (ESP32-S3 5GHz desteklemez)
4. Serial Monitor'de hata mesajlarını kontrol edin

### MQTT Bağlanamıyor

**Sorun:** "MQTT baglaniyor..." bağlanamıyor

**Çözümler:**
1. MQTT broker IP adresini kontrol edin (`ipconfig` ile)
2. ESP32-S3 ve bilgisayarın aynı ağda olduğundan emin olun
3. Firewall'u kontrol edin (Port 1883 açık olmalı)
4. MQTT broker'ın çalıştığından emin olun:
   ```powershell
   mosquitto_sub -h localhost -t "test" -v
   ```

### Port Bulunamıyor

**Sorun:** Arduino IDE'de COM port görünmüyor

**Çözümler:**
1. ESP32-S3'ün USB kablosunu çıkarıp takın
2. Farklı bir USB portu deneyin
3. USB kablosunun veri aktarımı yapabildiğinden emin olun (sadece şarj kablosu değil)
4. Device Manager'da (Aygıt Yöneticisi) COM port görünüyor mu kontrol edin

### Yükleme Hatası

**Sorun:** "Failed to connect to ESP32" veya benzeri hata

**Çözümler:**
1. ESP32-S3'teki **BOOT** butonuna basılı tutun
2. **RESET** butonuna basın ve bırakın
3. **BOOT** butonunu bırakın
4. Upload butonuna tekrar tıklayın
5. Upload speed'i düşürün (115200 veya 460800)

### LED'ler Çalışmıyor

**Sorun:** Komutlar alınıyor ama LED'ler güncellenmiyor

**Çözümler:**
1. LED pin bağlantısını kontrol edin (GPIO 4)
2. LED sayısını kontrol edin (`NUM_LEDS` değeri)
3. LED tipini kontrol edin (`LED_TYPE WS2812B`)
4. Serial Monitor'de hata mesajlarını kontrol edin

## 📝 Pin Bağlantıları

- **LED Strip:** GPIO 4
- **Peyzaj Relay:** GPIO 5
- **Sokak Relay:** GPIO 18
- **GND:** GND
- **5V:** 5V (veya harici güç kaynağı)

## 🎯 Başarı Checklist

- [ ] Arduino IDE kuruldu
- [ ] ESP32 board desteği eklendi
- [ ] Kütüphaneler yüklendi
- [ ] WiFi ayarları yapıldı
- [ ] MQTT broker ayarları yapıldı
- [ ] Kod ESP32-S3'e yüklendi
- [ ] Serial Monitor'de başarı mesajları görünüyor
- [ ] WiFi bağlantısı çalışıyor
- [ ] MQTT bağlantısı çalışıyor
- [ ] Komutlar alınıyor
- [ ] LED'ler güncelleniyor

## 📚 İlgili Dosyalar

- `esp32/maketLed.ino` - ESP32-S3 Arduino kodu
- `docs/API.md` - MQTT mesaj yapısı
- `docs/JSON_EXAMPLES.md` - JSON mesaj örnekleri
- `docs/SCENARIOS.md` - Senaryo dokümantasyonu



