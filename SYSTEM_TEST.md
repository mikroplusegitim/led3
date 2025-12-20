# 🧪 Sistem Test Kılavuzu

## ✅ Tam Sistem Testi

Tüm bileşenlerin birlikte çalıştığını test edin.

## 📋 Test Öncesi Kontrol Listesi

- [x] Frontend çalışıyor (`http://localhost:3003`)
- [x] Backend çalışıyor (`http://localhost:3001`)
- [x] MQTT Broker çalışıyor
- [ ] ESP32-S3 bağlı ve çalışıyor (opsiyonel)

## 🧪 Test Senaryoları

### Test 1: Frontend-Backend Bağlantısı

1. Tarayıcıda `http://localhost:3003` açın
2. Sağ üstteki bağlantı durumunu kontrol edin:
   - ✅ **"● Bağlı"** (yeşil) → Başarılı
   - ❌ **"○ Bağlantı Yok"** (kırmızı) → MQTT Broker'ı kontrol edin

**Beklenen:** Yeşil "Bağlı" durumu

---

### Test 2: Daire Durumu Değiştirme

1. Frontend'de "Daire Kontrol" bölümünde **5** yazın
2. **"Musait"** butonuna tıklayın
3. MQTT dinleyici terminalinde şunu görmelisiniz:
   ```
   maket/cmd {"building":1,"apartment":5,"status":1}
   ```
4. ESP32-S3 Serial Monitor'de (eğer bağlıysa):
   ```
   MQTT Mesaj alindi [maket/cmd]: {"building":1,"apartment":5,"status":1}
   >> Daire 5 -> MUSAIT
   ```

**Beklenen:** MQTT mesajı gönderilmeli ve ESP32 tarafından alınmalı

---

### Test 3: Çevre Aydınlatma Kontrolü

#### Peyzaj Aydınlatma
1. **"Peyzaj Aydinlatma"** butonuna tıklayın
2. Buton altın rengine dönmeli (aktif)
3. MQTT mesajı:
   ```
   maket/cmd {"environment":"peyzaj","state":true}
   ```
4. ESP32-S3'te GPIO 5 HIGH olmalı

#### Sokak Lambaları
1. **"Sokak Lambalari"** butonuna tıklayın
2. Buton altın rengine dönmeli (aktif)
3. MQTT mesajı:
   ```
   maket/cmd {"environment":"sokak","state":true}
   ```
4. ESP32-S3'te GPIO 18 HIGH olmalı

**Beklenen:** Butonlar aktif olmalı ve MQTT mesajları gönderilmeli

---

### Test 4: Satılanları Göster/Gizle

1. **"Satilanlari Goster/Gizle"** butonuna tıklayın
2. Buton aktif/pasif duruma geçmeli
3. MQTT mesajı:
   ```
   maket/cmd {"showSold":false}
   ```
4. ESP32-S3'te satılan daireler gizlenmeli/gösterilmeli

**Beklenen:** Buton durumu değişmeli ve LED'ler güncellenmeli

---

### Test 5: Senaryo Kontrolü

#### Karşılama Modu
1. **"Karsilama Modu"** butonuna tıklayın
2. Buton yanıp sönmeye başlamalı (aktif)
3. MQTT mesajı:
   ```
   maket/cmd {"scenario":1}
   ```
4. ESP32-S3'te LED'ler sırayla yanmalı

#### Gece Ambiyansı
1. **"Gece Ambiyansi"** butonuna tıklayın
2. Buton yanıp sönmeye başlamalı (aktif)
3. MQTT mesajı:
   ```
   maket/cmd {"scenario":2}
   ```
4. ESP32-S3'te LED'ler nefes alma efekti ile yanmalı

#### Senaryo Kapatma
1. Aktif senaryo butonuna tekrar tıklayın
2. Buton normal duruma dönmeli
3. MQTT mesajı:
   ```
   maket/cmd {"scenario":0}
   ```

**Beklenen:** Senaryolar çalışmalı ve animasyonlar görünmeli

---

### Test 6: Tümünü Kapat

1. **"Tumunu Kapat"** butonuna tıklayın
2. Tüm çevre aydınlatmalar kapanmalı
3. Senaryolar durmalı
4. MQTT mesajı:
   ```
   maket/cmd {"reset":true}
   ```
5. ESP32-S3'te:
   - Peyzaj ve Sokak relay'leri LOW olmalı
   - Senaryo durmalı
   - LED'ler temizlenmeli

**Beklenen:** Tüm sistem sıfırlanmalı

---

### Test 7: Bina Değiştirme

1. Sağ alttaki **☰** butonuna tıklayın
2. Ayarlar paneli açılmalı
3. **"Bina 2"** butonuna tıklayın
4. Ana ekranda "Bina: 2" görünmeli
5. MQTT mesajı:
   ```
   maket/cmd {"building":2}
   ```
6. ESP32-S3'te bina numarası güncellenmeli

**Beklenen:** Bina değişmeli ve komutlar yeni binaya gönderilmeli

---

### Test 8: Çoklu Daire Kontrolü

1. Farklı daireler için farklı durumlar seçin:
   - Daire 1 → Müsaite
   - Daire 2 → Satıldı
   - Daire 3 → Rezerve
   - Daire 4 → Kapat
2. Her komut için MQTT mesajı gönderilmeli
3. ESP32-S3'te LED'ler güncellenmeli:
   - Müsaite → Yeşil
   - Satıldı → Kırmızı (showSold=true ise)
   - Rezerve → Mavi
   - Kapat → Siyah

**Beklenen:** Her daire durumu doğru şekilde güncellenmeli

---

## 📊 MQTT Mesaj İzleme

### Tüm Mesajları İzleme

**Yeni bir terminal açın:**
```powershell
mosquitto_sub -h localhost -t "maket/#" -v
```

Bu terminalde tüm MQTT mesajlarını göreceksiniz:
- Komutlar (`maket/cmd`)
- Durum güncellemeleri (`maket/status`)

### Sadece Komutları İzleme

```powershell
mosquitto_sub -h localhost -t "maket/cmd" -v
```

### Sadece Durumları İzleme

```powershell
mosquitto_sub -h localhost -t "maket/status" -v
```

---

## 🔍 Hata Ayıklama

### Frontend'de Hata

1. **Browser Console'u açın (F12)**
2. **Console** sekmesinde hata var mı kontrol edin
3. **Network** sekmesinde MQTT bağlantısını kontrol edin
4. **Application → Storage → Local Storage** içinde ayarları kontrol edin

### Backend'de Hata

1. Backend terminal çıktısını kontrol edin
2. MQTT bağlantı durumunu kontrol edin
3. API endpoint'lerini test edin:
   ```powershell
   curl http://localhost:3001/api/health
   ```

### ESP32-S3'te Hata

1. **Serial Monitor'ü açın** (115200 baud)
2. Hata mesajlarını kontrol edin
3. WiFi bağlantısını kontrol edin
4. MQTT bağlantısını kontrol edin

---

## ✅ Başarı Kriterleri

Tüm testler başarılı olmalı:

- [x] Frontend açılıyor ve çalışıyor
- [x] Backend çalışıyor ve MQTT'ye bağlı
- [x] MQTT Broker çalışıyor
- [x] Frontend MQTT'ye bağlanıyor
- [x] Daire durumu değiştirme çalışıyor
- [x] Çevre aydınlatma kontrolü çalışıyor
- [x] Senaryolar çalışıyor
- [x] Bina değiştirme çalışıyor
- [x] MQTT mesajları gönderiliyor ve alınıyor
- [ ] ESP32-S3 bağlı ve çalışıyor (opsiyonel)
- [ ] LED'ler güncelleniyor (opsiyonel)

---

## 📝 Test Raporu

Test sonuçlarınızı kaydedin:

- **Test Tarihi:** ___________
- **Test Eden:** ___________
- **Frontend Versiyonu:** ___________
- **Backend Versiyonu:** ___________
- **ESP32-S3 Durumu:** ___________
- **Başarılı Testler:** ___________
- **Başarısız Testler:** ___________
- **Notlar:** ___________

---

## 🎉 Tebrikler!

Tüm testler başarılıysa sisteminiz tam olarak çalışıyor demektir!

**Sonraki adımlar:**
- Production ortamına geçiş
- TLS/SSL kurulumu
- Güvenlik ayarları
- Performans optimizasyonu



