import mqtt, { MqttClient } from 'mqtt'

export interface ApartmentCommand {
  building: number
  apartment: number
  status: 0 | 1 | 2 | 3  // 0: SATILDI, 1: MÜSAİT, 2: REZ, 3: KAPAT
}

export interface EnvironmentCommand {
  environment: 'peyzaj' | 'sokak'
  state: boolean
}

export interface ScenarioCommand {
  scenario: 0 | 1 | 2  // 0: KAPAT, 1: KARŞILAMA, 2: GECE AMBİYANSI
}

class MQTTServiceClass {
  private client: MqttClient | null = null
  private brokerUrl: string
  private topicCmd: string = 'maket/cmd'
  private topicStatus: string = 'maket/status'
  private onConnectCallback?: () => void
  private onDisconnectCallback?: () => void

  constructor() {
    // WebSocket üzerinden MQTT bağlantısı (browser için)
    this.brokerUrl = import.meta.env.VITE_MQTT_WS_URL || 'ws://localhost:9001'
  }

  connect() {
    if (this.client?.connected) return

    const options = {
      clientId: `web-client-${Math.random().toString(16).substr(2, 8)}`,
      clean: true,
      reconnectPeriod: 1000,
      connectTimeout: 30 * 1000,
    }

    try {
      this.client = mqtt.connect(this.brokerUrl, options)

      this.client.on('connect', () => {
        console.log('MQTT bağlandı')
        this.client?.subscribe(this.topicStatus)
        this.onConnectCallback?.()
      })

      this.client.on('disconnect', () => {
        console.log('MQTT bağlantısı kesildi')
        this.onDisconnectCallback?.()
      })

      this.client.on('error', (error) => {
        console.error('MQTT hatası:', error)
      })

      this.client.on('message', (topic, message) => {
        if (topic === this.topicStatus) {
          try {
            const data = JSON.parse(message.toString())
            console.log('Durum güncellendi:', data)
          } catch (e) {
            console.error('JSON parse hatası:', e)
          }
        }
      })
    } catch (error) {
      console.error('MQTT bağlantı hatası:', error)
    }
  }

  disconnect() {
    if (this.client) {
      this.client.end()
      this.client = null
    }
  }

  onConnect(callback: () => void) {
    this.onConnectCallback = callback
  }

  onDisconnect(callback: () => void) {
    this.onDisconnectCallback = callback
  }

  private publish(command: object) {
    if (!this.client?.connected) {
      console.warn('MQTT bağlantısı yok, komut gönderilemedi')
      return
    }

    const message = JSON.stringify(command)
    this.client.publish(this.topicCmd, message, { qos: 1 })
    console.log('Komut gönderildi:', command)
  }

  setApartmentStatus(building: number, apartment: number, status: 0 | 1 | 2 | 3) {
    this.publish({
      building,
      apartment,
      status
    } as ApartmentCommand)
  }

  setEnvironment(environment: 'peyzaj' | 'sokak', state: boolean) {
    this.publish({
      environment,
      state
    } as EnvironmentCommand)
  }

  setShowSold(show: boolean) {
    this.publish({
      showSold: show
    })
  }

  setScenario(scenario: 0 | 1 | 2) {
    this.publish({
      scenario
    } as ScenarioCommand)
  }

  resetAll() {
    this.publish({
      reset: true
    })
  }

  changeBuilding(building: number) {
    this.publish({
      building
    })
  }
}

export const MQTTService = new MQTTServiceClass()

