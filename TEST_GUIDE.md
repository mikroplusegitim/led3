# 🧪 Test Kılavuzu - Adım Adım

## ⚡ Hızlı Test (5 Dakika)

### 1️⃣ MQTT Broker'ı Başlatın

**Windows:**
```powershell
# Mosquitto kurulu değilse önce kurun
# https://mosquitto.org/download/

# Servis olarak başlat (Yönetici olarak)
net start mosquitto

# VEYA manuel başlat
mosquitto
```

**Test edin:**
```bash
mosquitto_sub -h localhost -t "test" -v
```
Başka bir terminalde:
```bash
mosquitto_pub -h localhost -t "test" -m "merhaba"
```
İlk terminalde "merhaba" görünmeli ✅

---

### 2️⃣ Backend'i Başlatın

```bash
cd backend
npm install
```

**`.env` dosyası oluşturun:**
```bash
# Windows PowerShell
copy env.example.txt .env

# Linux/macOS
cp env.example.txt .env
```

**Backend'i başlatın:**
```bash
npm run dev
```

**Başarılı çıktı:**
```
🚀 Backend server 3001 portunda çalışıyor
📡 MQTT Broker: localhost:1883
✅ MQTT Broker'a bağlandı
📡 maket/status topic'i dinleniyor
```

**Test edin:**
Tarayıcıda açın: http://localhost:3001/api/health

Görmeli: `{"status":"ok","mqtt":"connected",...}` ✅

---

### 3️⃣ Frontend'i Başlatın

**Yeni bir terminal açın:**
```bash
cd frontend
npm install
npm run dev
```

**Başarılı çıktı:**
```
  VITE v5.x.x  ready in xxx ms
  ➜  Local:   http://localhost:3000/
```

**Tarayıcıda açın:**
```
http://localhost:3000
```

**Göreceğiniz:**
- ✅ Bina görseli arka planda
- ✅ Alt kısımda kontrol paneli (3 bölüm)
- ✅ Sağ üstte "● Bağlı" (yeşil) yazısı
- ✅ Sağ altta ayarlar butonu (☰)

---

## 🎯 İnteraktif Testler

### Test 1: Daire Durumu Değiştirme

1. "Daire Kontrol" bölümünde **5** yazın
2. **"Musait"** butonuna tıklayın
3. MQTT dinleyici terminalinde şunu görmelisiniz:
   ```
   maket/cmd {"building":1,"apartment":5,"status":1}
   ```
   ✅ **BAŞARILI!**

### Test 2: Çevre Aydınlatma

1. **"Peyzaj Aydinlatma"** butonuna tıklayın
2. Buton altın rengine dönmeli (aktif)
3. MQTT mesajı:
   ```
   maket/cmd {"environment":"peyzaj","state":true}
   ```
   ✅ **BAŞARILI!**

### Test 3: Senaryo

1. **"Karsilama Modu"** butonuna tıklayın
2. Buton yanıp sönmeye başlamalı
3. MQTT mesajı:
   ```
   maket/cmd {"scenario":1}
   ```
   ✅ **BAŞARILI!**

### Test 4: Bina Değiştirme

1. Sağ alttaki **☰** butonuna tıklayın
2. Sağdan panel açılmalı
3. **"Bina 2"** butonuna tıklayın
4. Ana ekranda "Bina: 2" görünmeli
   ✅ **BAŞARILI!**

---

## 📡 MQTT Mesajlarını İzleme

**Yeni bir terminal açın ve şunu çalıştırın:**
```bash
mosquitto_sub -h localhost -t "maket/#" -v
```

Bu terminalde tüm MQTT mesajlarını göreceksiniz!

**Örnek çıktı:**
```
maket/cmd {"building":1,"apartment":5,"status":1}
maket/cmd {"environment":"peyzaj","state":true}
maket/cmd {"scenario":1}
maket/status {"deviceId":"ESP32-MAKET-001","building":1,...}
```

---

## 🔧 ESP32-S3 Testi (Opsiyonel)

### Hazırlık

1. **Arduino IDE** kurulu olmalı
2. **ESP32 board desteği** eklenmeli
3. **Kütüphaneler** yüklenmeli:
   - FastLED
   - PubSubClient
   - ArduinoJson

### Kod Düzenleme

`esp32/maketLed.ino` dosyasını açın:

```cpp
// WiFi ayarlarınızı girin
#define WIFI_SSID "WiFi-Adiniz"
#define WIFI_PASS "WiFi-Sifreniz"

// Bilgisayarınızın IP adresini girin
#define MQTT_BROKER "192.168.1.100"  // ipconfig ile öğrenin
```

### Yükleme

1. ESP32-S3'ü USB ile bağlayın
2. Tools → Board → "ESP32S3 Dev Module" seçin
3. Tools → Port → COM portunu seçin
4. Upload butonuna tıklayın

### Serial Monitor

Tools → Serial Monitor (115200 baud)

**Başarılı çıktı:**
```
=================================
  MIMARI LED KONTROL SISTEMI
  MQTT VERSIYON
=================================
OK Role pinleri hazir
OK LEDler basladi
WiFi baglaniyor.....
OK WiFi baglandi!
IP Adresi: 192.168.1.50
MQTT baglaniyor... baglandi!
=================================
SISTEM HAZIR!
=================================
```

### Test

1. Frontend'den bir daire durumu değiştirin
2. Serial Monitor'de şunu görmelisiniz:
   ```
   MQTT Mesaj alindi [maket/cmd]: {"building":1,"apartment":5,"status":1}
   >> Daire 5 -> MUSAIT
   ```
   ✅ **BAŞARILI!**

---

## ❌ Sorun Giderme

### Backend Başlamıyor

**Hata:** `Cannot find module 'express'`
**Çözüm:**
```bash
cd backend
npm install
```

**Hata:** `Port 3001 already in use`
**Çözüm:**
```bash
# Windows
netstat -ano | findstr :3001
taskkill /PID <PID_NUMARASI> /F

# Linux/macOS
lsof -i :3001
kill -9 <PID_NUMARASI>
```

### Frontend Bağlanamıyor

**Sorun:** "○ Bağlantı Yok" görünüyor

**Kontrol listesi:**
1. ✅ Backend çalışıyor mu? (`http://localhost:3001/api/health`)
2. ✅ MQTT Broker çalışıyor mu?
3. ✅ Browser Console'da hata var mı? (F12)
4. ✅ Ayarlar panelinden MQTT URL doğru mu? (`ws://localhost:9001`)

**Çözüm:**
- Ayarlar butonuna (☰) tıklayın
- MQTT URL'ini kontrol edin: `ws://localhost:9001`
- Kaydet ve sayfayı yenileyin

### MQTT Broker Bağlantı Hatası

**Hata:** `MQTT Broker'a bağlanılamadı`

**Çözüm:**
1. Mosquitto çalışıyor mu?
   ```bash
   # Windows
   net start mosquitto
   
   # Test
   mosquitto_sub -h localhost -t "test" -v
   ```

2. `.env` dosyasını kontrol edin:
   ```
   MQTT_BROKER_URL=mqtt://localhost
   MQTT_PORT=1883
   ```

### ESP32 Bağlanamıyor

**Sorun:** WiFi bağlanamıyor

**Kontrol:**
- WiFi SSID ve şifre doğru mu?
- ESP32 WiFi menzilinde mi?
- Serial Monitor'de hata mesajı var mı?

**Sorun:** MQTT bağlanamıyor

**Kontrol:**
- MQTT broker IP adresi doğru mu? (`ipconfig` ile kontrol edin)
- ESP32 ve bilgisayar aynı ağda mı?
- Firewall MQTT portunu engelliyor mu? (1883)

---

## ✅ Başarı Checklist

- [ ] MQTT Broker çalışıyor ve mesaj alıyor
- [ ] Backend başladı ve `/api/health` çalışıyor
- [ ] Frontend açılıyor ve "● Bağlı" görünüyor
- [ ] Daire durumu değiştirme çalışıyor
- [ ] Çevre aydınlatma çalışıyor
- [ ] Senaryolar çalışıyor
- [ ] Bina değiştirme çalışıyor
- [ ] Ayarlar paneli açılıyor
- [ ] ESP32 bağlanıyor (opsiyonel)
- [ ] LED'ler güncelleniyor (opsiyonel)

---

## 🎉 Tebrikler!

Tüm testler başarılıysa sisteminiz çalışıyor demektir! 

**Sonraki adımlar:**
- Production için TLS kurulumu (`docs/SETUP.md`)
- Güvenlik ayarları (JWT secret değiştirme)
- Senaryo parametrelerini özelleştirme (`docs/SCENARIOS.md`)



