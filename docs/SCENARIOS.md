# Senaryo Dokümantasyonu

## Senaryo 1: Karşılama Modu

**Açıklama:** Tüm LED'ler sırayla yanar, ardından 3 kez yanıp söner ve döngü tekrar eder.

**Animasyon Parametreleri:**
- LED yanma hızı: 30ms per LED
- Yanıp sönme sayısı: 3 kez
- Renk: Altın (Gold - #FFD700)

**Kullanım:**
```json
{
  "scenario": 1
}
```

**Davranış:**
1. LED'ler sırayla (0'dan 199'a kadar) altın renginde yanar
2. Tüm LED'ler yandıktan sonra, hepsi birlikte 3 kez yanıp söner
3. Döngü başa döner

## Senaryo 2: Gece Ambiyansı

**Açıklama:** Tüm LED'ler yumuşak bir nefes alma efekti ile yanıp söner.

**Animasyon Parametreleri:**
- Güncelleme hızı: 30ms
- Renk: Cyan/Mavi tonları (HSV: 160, 255, değişken parlaklık)
- Parlaklık fonksiyonu: Sinüs tabanlı eksponansiyel (nefes alma efekti)
- Döngü süresi: ~2 saniye

**Kullanım:**
```json
{
  "scenario": 2
}
```

**Davranış:**
- LED'ler yumuşak bir şekilde yanıp söner
- Parlaklık 0 ile 108 arasında değişir
- Sürekli döngü halinde çalışır

## Senaryo 0: Kapat

**Açıklama:** Tüm animasyonları durdurur ve normal LED kontrolüne döner.

**Kullanım:**
```json
{
  "scenario": 0
}
```

**Davranış:**
- Aktif animasyon durdurulur
- LED'ler son durumlarına göre kalır
- Normal kontrol moduna dönülür

## Senaryo Parametrelerini Özelleştirme

ESP32 kodunda senaryo parametrelerini değiştirmek için `maket_led_mqtt.ino` dosyasındaki ilgili bölümleri düzenleyin:

### Karşılama Modu Parametreleri

```cpp
// LED yanma hızı (ms)
if(currentAnimation == 1 && now - lastAnimUpdate > 30) { // 30ms değiştirilebilir

// Yanıp sönme sayısı
if(flashCount >= 6) { // 6 = 3 kez yanıp sönme (2x3)
```

### Gece Ambiyansı Parametreleri

```cpp
// Döngü süresi (ms)
float b = (exp(sin(millis()/2000.0*PI)) - 0.368)*108.0; // 2000ms değiştirilebilir

// Renk (HSV)
fill_solid(leds, NUM_LEDS, CHSV(160, 255, b)); // 160 = hue değeri (renk)
```

## Senaryo Kombinasyonları

Senaryolar çalışırken diğer kontroller (daire durumu, çevre aydınlatma) devre dışı kalır. Senaryo kapatıldığında normal kontrole dönülür.

**Not:** Senaryo aktifken daire durumu değişiklikleri yapılabilir ancak animasyon durdurulur.
