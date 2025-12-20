# API Dokümantasyonu

## MQTT Mesaj Yapısı

### Komut Gönderme (maket/cmd)

Tüm komutlar `maket/cmd` topic'ine JSON formatında gönderilir.

#### Daire Durumu Ayarla

```json
{
  "building": 1,
  "apartment": 5,
  "status": 1
}
```

**Status kodları:**
- `0`: SATILDI
- `1`: MÜSAİT
- `2`: REZERVE
- `3`: KAPAT

#### Çevre Aydınlatma

```json
{
  "environment": "peyzaj",
  "state": true
}
```

**Environment değerleri:**
- `"peyzaj"`: Peyzaj Aydınlatma
- `"sokak"`: Sokak Lambaları

#### Satılanları Göster/Gizle

```json
{
  "showSold": true
}
```

#### Senaryo Kontrolü

```json
{
  "scenario": 1
}
```

**Senaryo kodları:**
- `0`: Kapat
- `1`: Karşılama Modu
- `2`: Gece Ambiyansı

#### Tümünü Kapat

```json
{
  "reset": true
}
```

#### Bina Değiştir

```json
{
  "building": 2
}
```

### Durum Güncellemeleri (maket/status)

ESP32-S3 cihazı durum güncellemelerini `maket/status` topic'ine gönderir:

```json
{
  "deviceId": "ESP32-MAKET-001",
  "building": 1,
  "showSold": true,
  "peyzaj": false,
  "sokak": false,
  "animation": 0,
  "apartments": [1, 1, 0, 1, 2, ...]
}
```

## HTTP API Endpoints

### Health Check

```
GET /api/health
```

**Response:**
```json
{
  "status": "ok",
  "mqtt": "connected",
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

### Daire Durumu Ayarla

```
POST /api/apartment
Content-Type: application/json
Authorization: Bearer <token>

{
  "building": 1,
  "apartment": 5,
  "status": 1
}
```

### Çevre Aydınlatma

```
POST /api/environment
Content-Type: application/json
Authorization: Bearer <token>

{
  "environment": "peyzaj",
  "state": true
}
```

### Satılanları Göster/Gizle

```
POST /api/show-sold
Content-Type: application/json
Authorization: Bearer <token>

{
  "showSold": true
}
```

### Senaryo Kontrolü

```
POST /api/scenario
Content-Type: application/json
Authorization: Bearer <token>

{
  "scenario": 1
}
```

### Tümünü Kapat

```
POST /api/reset
Authorization: Bearer <token>
```

### Bina Değiştir

```
POST /api/building
Content-Type: application/json
Authorization: Bearer <token>

{
  "building": 2
}
```

### Login

```
POST /api/login
Content-Type: application/json

{
  "username": "admin",
  "password": "admin"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "username": "admin"
}
```

