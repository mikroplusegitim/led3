# JSON Mesaj Örnekleri

## Komut Mesajları (maket/cmd)

### Daire Durumu Ayarla

**Müsaite Çevir:**
```json
{
  "building": 1,
  "apartment": 5,
  "status": 1
}
```

**Satıldı Olarak İşaretle:**
```json
{
  "building": 1,
  "apartment": 10,
  "status": 0
}
```

**Rezerve Et:**
```json
{
  "building": 1,
  "apartment": 15,
  "status": 2
}
```

**Kapat:**
```json
{
  "building": 1,
  "apartment": 20,
  "status": 3
}
```

### Çevre Aydınlatma Kontrolü

**Peyzaj Aydınlatmayı Aç:**
```json
{
  "environment": "peyzaj",
  "state": true
}
```

**Sokak Lambalarını Kapat:**
```json
{
  "environment": "sokak",
  "state": false
}
```

### Satılanları Göster/Gizle

**Satılanları Göster:**
```json
{
  "showSold": true
}
```

**Satılanları Gizle:**
```json
{
  "showSold": false
}
```

### Senaryo Kontrolü

**Karşılama Modunu Başlat:**
```json
{
  "scenario": 1
}
```

**Gece Ambiyansını Başlat:**
```json
{
  "scenario": 2
}
```

**Senaryoyu Kapat:**
```json
{
  "scenario": 0
}
```

### Tümünü Kapat

```json
{
  "reset": true
}
```

### Bina Değiştir

**Bina 2'ye Geç:**
```json
{
  "building": 2
}
```

## Durum Mesajları (maket/status)

### Tam Durum Raporu

```json
{
  "deviceId": "ESP32-MAKET-001",
  "building": 1,
  "showSold": true,
  "peyzaj": false,
  "sokak": true,
  "animation": 0,
  "apartments": [
    1, 1, 0, 1, 2, 1, 0, 1, 1, 1,
    0, 1, 1, 2, 1, 0, 1, 1, 1, 1,
    1, 0, 1, 1, 1, 1, 1, 1, 0, 1,
    // ... 150 daire durumu
  ]
}
```

### Senaryo Aktifken Durum

```json
{
  "deviceId": "ESP32-MAKET-001",
  "building": 1,
  "showSold": true,
  "peyzaj": false,
  "sokak": false,
  "animation": 1,
  "apartments": [
    // ... daire durumları
  ]
}
```

## HTTP API Request Örnekleri

### Daire Durumu Ayarla

```bash
curl -X POST http://localhost:3001/api/apartment \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "building": 1,
    "apartment": 5,
    "status": 1
  }'
```

### Çevre Aydınlatma

```bash
curl -X POST http://localhost:3001/api/environment \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "environment": "peyzaj",
    "state": true
  }'
```

### Senaryo Başlat

```bash
curl -X POST http://localhost:3001/api/scenario \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "scenario": 1
  }'
```

### Login

```bash
curl -X POST http://localhost:3001/api/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "admin"
  }'
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImFkbWluIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNjEwMjM5MDIyfQ...",
  "username": "admin"
}
```

