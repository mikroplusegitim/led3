import mqtt, { MqttClient } from 'mqtt';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

export interface ApartmentCommand {
  building: number;
  apartment: number;
  status: 0 | 1 | 2 | 3; // 0: SATILDI, 1: MÜSAİT, 2: REZ, 3: KAPAT
}

export interface EnvironmentCommand {
  environment: 'peyzaj' | 'sokak';
  state: boolean;
}

export interface ScenarioCommand {
  scenario: 0 | 1 | 2; // 0: KAPAT, 1: KARŞILAMA, 2: GECE AMBİYANSI
}

export interface StatusData {
  deviceId?: string;
  building?: number;
  showSold?: boolean;
  peyzaj?: boolean;
  sokak?: boolean;
  animation?: number;
  apartments?: number[];
  timestamp?: number;
}

type StatusCallback = (data: StatusData) => void;

interface HiveMQCredentials {
  username: string;
  password: string;
}

class HiveMQServiceClass {
  private client: MqttClient | null = null;
  private brokerUrl: string;
  private tenantId: string | null = null;
  private deviceId: string | null = null;
  private credentials: HiveMQCredentials | null = null;
  private onConnectCallback?: () => void;
  private onDisconnectCallback?: () => void;
  private onStatusCallback?: StatusCallback;

  constructor() {
    // HiveMQ Cloud WebSocket URL (TLS)
    this.brokerUrl = import.meta.env.VITE_HIVEMQ_BROKER_URL || 'wss://your-cluster.s1.eu.hivemq.cloud:8884/mqtt';
  }

  /**
   * Multi-tenant MQTT topic yapısı
   * tenant/{tenantId}/device/{deviceId}/cmd  - Komut gönderme
   * tenant/{tenantId}/device/{deviceId}/status - Durum alma
   */
  private getCmdTopic(): string {
    if (!this.tenantId || !this.deviceId) return '';
    return `tenant/${this.tenantId}/device/${this.deviceId}/cmd`;
  }

  private getStatusTopic(): string {
    if (!this.tenantId || !this.deviceId) return '';
    return `tenant/${this.tenantId}/device/${this.deviceId}/status`;
  }

  private getAllStatusTopic(): string {
    if (!this.tenantId) return '';
    // Tenant'ın tüm cihazlarını dinle
    return `tenant/${this.tenantId}/device/+/status`;
  }

  /**
   * HiveMQ Cloud'a bağlan
   * @param tenantId - Tenant ID (Firebase Auth'dan gelecek)
   * @param deviceId - Aktif cihaz ID (kullanıcı seçecek)
   */
  async connect(tenantId: string, deviceId: string = 'default') {
    if (this.client?.connected && this.tenantId === tenantId && this.deviceId === deviceId) {
      console.log('✅ Zaten bağlı');
      return;
    }

    this.tenantId = tenantId;
    this.deviceId = deviceId;

    try {
      // Firestore'dan MQTT credentials al
      const credDoc = await getDoc(doc(db, 'mqttCredentials', tenantId));

      if (!credDoc.exists()) {
        throw new Error('MQTT credentials bulunamadı. Lütfen yöneticinize başvurun.');
      }

      this.credentials = credDoc.data() as HiveMQCredentials;

      // HiveMQ Cloud'a bağlan
      const options = {
        clientId: `web-${tenantId}-${deviceId}-${Math.random().toString(16).substr(2, 8)}`,
        username: this.credentials.username,
        password: this.credentials.password,
        clean: true,
        reconnectPeriod: 5000,
        connectTimeout: 30 * 1000,
        protocol: 'wss' as const,
        protocolVersion: 5, // MQTT 5.0
      };

      this.client = mqtt.connect(this.brokerUrl, options);

      this.client.on('connect', () => {
        console.log('✅ HiveMQ Cloud bağlandı');
        console.log(`📡 Dinlenen topic: ${this.getAllStatusTopic()}`);

        // Tenant'ın tüm cihaz durumlarını dinle
        this.client?.subscribe(this.getAllStatusTopic(), { qos: 1 });
        this.onConnectCallback?.();
      });

      this.client.on('disconnect', () => {
        console.log('⚠️ HiveMQ bağlantısı kesildi');
        this.onDisconnectCallback?.();
      });

      this.client.on('error', (error) => {
        console.error('❌ HiveMQ hatası:', error);
      });

      this.client.on('message', (topic, message) => {
        try {
          const data = JSON.parse(message.toString()) as StatusData;
          console.log(`📨 Durum alındı [${topic}]:`, data);

          // Callback'i çağır
          if (this.onStatusCallback) {
            this.onStatusCallback(data);
          }
        } catch (e) {
          console.error('JSON parse hatası:', e);
        }
      });

    } catch (error) {
      console.error('HiveMQ bağlantı hatası:', error);
      throw error;
    }
  }

  disconnect() {
    if (this.client) {
      this.client.end();
      this.client = null;
    }
    this.tenantId = null;
    this.deviceId = null;
  }

  onConnect(callback: () => void) {
    this.onConnectCallback = callback;
  }

  onDisconnect(callback: () => void) {
    this.onDisconnectCallback = callback;
  }

  onStatus(callback: StatusCallback | undefined) {
    this.onStatusCallback = callback;
  }

  private publish(command: object) {
    if (!this.client?.connected) {
      console.warn('⚠️ HiveMQ bağlantısı yok, komut gönderilemedi');
      return;
    }

    const topic = this.getCmdTopic();
    if (!topic) {
      console.error('Topic oluşturulamadı. TenantId ve DeviceId eksik.');
      return;
    }

    const message = JSON.stringify({
      ...command,
      timestamp: Date.now(),
      tenantId: this.tenantId
    });

    this.client.publish(topic, message, { qos: 1 }, (err) => {
      if (err) {
        console.error('Publish hatası:', err);
      } else {
        console.log(`📤 Komut gönderildi [${topic}]:`, command);
      }
    });
  }

  setApartmentStatus(building: number, apartment: number, status: 0 | 1 | 2 | 3) {
    this.publish({
      building,
      apartment,
      status
    } as ApartmentCommand);
  }

  setEnvironment(environment: 'peyzaj' | 'sokak', state: boolean) {
    this.publish({
      environment,
      state
    } as EnvironmentCommand);
  }

  setShowSold(show: boolean) {
    this.publish({
      showSold: show
    });
  }

  setScenario(scenario: 0 | 1 | 2) {
    this.publish({
      scenario
    } as ScenarioCommand);
  }

  resetAll() {
    this.publish({
      reset: true
    });
  }

  changeBuilding(building: number) {
    this.publish({
      building
    });
  }

  /**
   * Aktif cihazı değiştir
   */
  switchDevice(newDeviceId: string) {
    if (this.tenantId) {
      this.disconnect();
      this.connect(this.tenantId, newDeviceId);
    }
  }

  isConnected(): boolean {
    return this.client?.connected || false;
  }
}

export const HiveMQService = new HiveMQServiceClass();
