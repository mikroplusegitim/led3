import express from 'express'
import cors from 'cors'
import mqtt from 'mqtt'
import dotenv from 'dotenv'
import jwt from 'jsonwebtoken'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const app = express()
const PORT = process.env.PORT || 3001

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}))
app.use(express.json())

// MQTT Broker bağlantısı
const mqttOptions = {
  host: process.env.MQTT_BROKER_URL?.replace('mqtt://', '').replace('mqtts://', '') || 'localhost',
  port: parseInt(process.env.MQTT_PORT || '1883'),
  protocol: process.env.MQTT_TLS === 'true' ? 'mqtts' : 'mqtt',
  username: process.env.MQTT_USERNAME || '',
  password: process.env.MQTT_PASSWORD || '',
  rejectUnauthorized: process.env.MQTT_TLS === 'true'
}

if (process.env.MQTT_TLS === 'true') {
  const fs = await import('fs')
  if (process.env.MQTT_CA_PATH) {
    mqttOptions.ca = fs.readFileSync(process.env.MQTT_CA_PATH)
  }
  if (process.env.MQTT_CERT_PATH) {
    mqttOptions.cert = fs.readFileSync(process.env.MQTT_CERT_PATH)
  }
  if (process.env.MQTT_KEY_PATH) {
    mqttOptions.key = fs.readFileSync(process.env.MQTT_KEY_PATH)
  }
}

const mqttClient = mqtt.connect(mqttOptions)

mqttClient.on('connect', () => {
  console.log('✅ MQTT Broker\'a bağlandı')
  mqttClient.subscribe('maket/status', (err) => {
    if (err) {
      console.error('MQTT subscribe hatası:', err)
    } else {
      console.log('📡 maket/status topic\'i dinleniyor')
    }
  })
})

mqttClient.on('error', (error) => {
  console.error('❌ MQTT hatası:', error)
})

mqttClient.on('message', (topic, message) => {
  if (topic === 'maket/status') {
    try {
      const data = JSON.parse(message.toString())
      console.log('📨 Durum güncellendi:', data)
      // Burada WebSocket ile frontend'e gönderilebilir
    } catch (e) {
      console.error('JSON parse hatası:', e)
    }
  }
})

// Basit kimlik doğrulama middleware (JWT)
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if (!token) {
    // Demo için token zorunlu değil, production'da aktif edilmeli
    return next()
  }

  jwt.verify(token, process.env.JWT_SECRET || 'demo-secret', (err, user) => {
    if (err) {
      return res.sendStatus(403)
    }
    req.user = user
    next()
  })
}

// API Routes

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    mqtt: mqttClient.connected ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString()
  })
})

// Daire durumu ayarla
app.post('/api/apartment', authenticateToken, (req, res) => {
  const { building, apartment, status } = req.body

  if (!building || !apartment || status === undefined) {
    return res.status(400).json({ error: 'Eksik parametreler' })
  }

  if (apartment < 1 || apartment > 150) {
    return res.status(400).json({ error: 'Daire numarası 1-150 arasında olmalıdır' })
  }

  if (![0, 1, 2, 3].includes(status)) {
    return res.status(400).json({ error: 'Geçersiz durum kodu' })
  }

  const message = JSON.stringify({
    building: parseInt(building),
    apartment: parseInt(apartment),
    status: parseInt(status)
  })

  mqttClient.publish('maket/cmd', message, { qos: 1 }, (err) => {
    if (err) {
      console.error('MQTT publish hatası:', err)
      return res.status(500).json({ error: 'Komut gönderilemedi' })
    }
    res.json({ success: true, message: 'Komut gönderildi' })
  })
})

// Çevre aydınlatma kontrolü
app.post('/api/environment', authenticateToken, (req, res) => {
  const { environment, state } = req.body

  if (!environment || state === undefined) {
    return res.status(400).json({ error: 'Eksik parametreler' })
  }

  if (!['peyzaj', 'sokak'].includes(environment)) {
    return res.status(400).json({ error: 'Geçersiz çevre tipi' })
  }

  const message = JSON.stringify({
    environment,
    state: Boolean(state)
  })

  mqttClient.publish('maket/cmd', message, { qos: 1 }, (err) => {
    if (err) {
      console.error('MQTT publish hatası:', err)
      return res.status(500).json({ error: 'Komut gönderilemedi' })
    }
    res.json({ success: true, message: 'Komut gönderildi' })
  })
})

// Satılanları göster/gizle
app.post('/api/show-sold', authenticateToken, (req, res) => {
  const { showSold } = req.body

  if (showSold === undefined) {
    return res.status(400).json({ error: 'Eksik parametre' })
  }

  const message = JSON.stringify({
    showSold: Boolean(showSold)
  })

  mqttClient.publish('maket/cmd', message, { qos: 1 }, (err) => {
    if (err) {
      console.error('MQTT publish hatası:', err)
      return res.status(500).json({ error: 'Komut gönderilemedi' })
    }
    res.json({ success: true, message: 'Komut gönderildi' })
  })
})

// Senaryo kontrolü
app.post('/api/scenario', authenticateToken, (req, res) => {
  const { scenario } = req.body

  if (scenario === undefined) {
    return res.status(400).json({ error: 'Eksik parametre' })
  }

  if (![0, 1, 2].includes(scenario)) {
    return res.status(400).json({ error: 'Geçersiz senaryo kodu' })
  }

  const message = JSON.stringify({
    scenario: parseInt(scenario)
  })

  mqttClient.publish('maket/cmd', message, { qos: 1 }, (err) => {
    if (err) {
      console.error('MQTT publish hatası:', err)
      return res.status(500).json({ error: 'Komut gönderilemedi' })
    }
    res.json({ success: true, message: 'Komut gönderildi' })
  })
})

// Tümünü kapat
app.post('/api/reset', authenticateToken, (req, res) => {
  const message = JSON.stringify({
    reset: true
  })

  mqttClient.publish('maket/cmd', message, { qos: 1 }, (err) => {
    if (err) {
      console.error('MQTT publish hatası:', err)
      return res.status(500).json({ error: 'Komut gönderilemedi' })
    }
    res.json({ success: true, message: 'Tümü kapatıldı' })
  })
})

// Bina değiştir
app.post('/api/building', authenticateToken, (req, res) => {
  const { building } = req.body

  if (!building || building < 1 || building > 10) {
    return res.status(400).json({ error: 'Geçersiz bina numarası (1-10)' })
  }

  const message = JSON.stringify({
    building: parseInt(building)
  })

  mqttClient.publish('maket/cmd', message, { qos: 1 }, (err) => {
    if (err) {
      console.error('MQTT publish hatası:', err)
      return res.status(500).json({ error: 'Komut gönderilemedi' })
    }
    res.json({ success: true, message: 'Bina değiştirildi' })
  })
})

// Login endpoint (demo için basit)
app.post('/api/login', (req, res) => {
  const { username, password } = req.body

  // Demo için sabit kullanıcı (production'da veritabanı kullanılmalı)
  if (username === 'admin' && password === 'admin') {
    const token = jwt.sign(
      { username, role: 'admin' },
      process.env.JWT_SECRET || 'demo-secret',
      { expiresIn: '24h' }
    )
    res.json({ token, username })
  } else {
    res.status(401).json({ error: 'Geçersiz kullanıcı adı veya şifre' })
  }
})

app.listen(PORT, () => {
  console.log(`🚀 Backend server ${PORT} portunda çalışıyor`)
  console.log(`📡 MQTT Broker: ${mqttOptions.host}:${mqttOptions.port}`)
})

