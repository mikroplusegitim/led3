# Maket Aydınlatma Kontrol Uygulaması

Modern web tabanlı maket aydınlatma kontrol sistemi. ESP32-S3 ile MQTT üzerinden iletişim sağlar.

## Özellikler

- 🏢 **Bina Yönetimi**: Birden fazla bina arasında geçiş yapabilme
- 🏠 **Daire Kontrolü**: Her binadan herhangi bir daireyi kontrol edebilme
- 💡 **Durumlar**: MÜSAİT, SATILDI, REZ, KAPAT
- 🌳 **Çevre Aydınlatma**: Peyzaj ve Sokak lambaları kontrolü
- 🎬 **Senaryolar**: Karşılama Modu, Gece Ambiyansı
- 🔒 **Güvenlik**: TLS ve kimlik doğrulama
- 📡 **MQTT**: JSON mesaj yapısı ile iletişim

## Proje Yapısı

```
├── frontend/          # React web uygulaması
├── backend/           # Node.js MQTT servisi
├── esp32/             # ESP32-S3 Arduino kodu
└── docs/              # Dokümantasyon
```

## Kurulum

```bash
npm run install:all
```

## Çalıştırma

```bash
npm run dev
```

## Dokümantasyon

Detaylı dokümantasyon için `docs/` klasörüne bakın.

