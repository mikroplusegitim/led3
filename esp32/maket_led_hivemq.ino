#include <Arduino.h>
#include <WiFi.h>
#include <WiFiClientSecure.h>
#include <PubSubClient.h>
#include <FastLED.h>
#include <Preferences.h>
#include <ArduinoJson.h>
#include <HTTPClient.h>

// --- KULLANICI AYARLARI ---
#define WIFI_SSID "YOUR_WIFI_SSID"
#define WIFI_PASS "YOUR_WIFI_PASSWORD"
#define LED_PIN 4
#define NUM_LEDS 200
#define BRIGHTNESS 255
#define LED_TYPE WS2812B
#define COLOR_ORDER GRB
#define PEYZAJ_PIN 5
#define SOKAK_PIN 18

// --- HiveMQ CLOUD AYARLARI ---
// HiveMQ Cloud Console'dan alınacak
#define HIVEMQ_BROKER "your-cluster.s1.eu.hivemq.cloud"
#define HIVEMQ_PORT 8883  // TLS port
#define HIVEMQ_USER "your-username"
#define HIVEMQ_PASS "your-password"

// --- DEVICE PROVISIONING ---
// Provisioning API endpoint (Firebase Functions)
#define PROVISION_URL "https://us-central1-your-project.cloudfunctions.net/provisionDevice"
#define CLAIM_TOKEN "YOUR_CLAIM_TOKEN"  // Üretimde her device'a unique

// --- MULTI-TENANT TOPIC YAPISI ---
// tenant/{tenantId}/device/{deviceId}/cmd
// tenant/{tenantId}/device/{deviceId}/status

String tenantId = "";
String deviceId = "";
String topicCmd = "";
String topicStatus = "";

// --- SİSTEM DEĞİŞKENLERİ ---
CRGB leds[NUM_LEDS];
Preferences preferences;
WiFiClientSecure wifiClient;
PubSubClient mqttClient(wifiClient);

int apartmentStatus[150];
bool showSold = true;
bool peyzajState = false;
bool sokakState = false;
int currentAnimation = 0;
int currentBuilding = 1;

unsigned long lastAnimUpdate = 0;
int animStep = 0;
bool isProvisioned = false;

// HiveMQ Cloud Root CA Certificate
const char* hivemq_root_ca = \
"-----BEGIN CERTIFICATE-----\n" \
"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\n" \
"-----END CERTIFICATE-----\n";

void updateLeds() {
  for(int i=0; i<150; i++) {
    int st = apartmentStatus[i];
    if(st==0) leds[i] = showSold ? CRGB::Red : CRGB::Black;
    else if(st==1) leds[i] = CRGB::Green;
    else if(st==2) leds[i] = CRGB::Blue;
    else leds[i] = CRGB::Black;
  }
  if(peyzajState) fill_solid(leds+150, 25, CRGB::Gold);
  else fill_solid(leds+150, 25, CRGB::Black);
  if(sokakState) fill_solid(leds+175, 25, CRGB::FairyLight);
  else fill_solid(leds+175, 25, CRGB::Black);
}

void publishStatus() {
  if (!mqttClient.connected() || topicStatus.length() == 0) return;

  StaticJsonDocument<1024> doc;
  doc["deviceId"] = deviceId;
  doc["tenantId"] = tenantId;
  doc["building"] = currentBuilding;
  doc["showSold"] = showSold;
  doc["peyzaj"] = peyzajState;
  doc["sokak"] = sokakState;
  doc["animation"] = currentAnimation;
  doc["timestamp"] = millis();

  JsonArray apartments = doc.createNestedArray("apartments");
  for(int i=0; i<150; i++) {
    apartments.add(apartmentStatus[i]);
  }

  char buffer[1536];
  serializeJson(doc, buffer);
  mqttClient.publish(topicStatus.c_str(), buffer, true); // Retained message
  Serial.println("✅ Status published");
}

void mqttCallback(char* topic, byte* payload, unsigned int length) {
  Serial.print("📨 MQTT Mesaj alindi [");
  Serial.print(topic);
  Serial.print("]: ");

  char message[length + 1];
  memcpy(message, payload, length);
  message[length] = '\0';
  Serial.println(message);

  StaticJsonDocument<512> doc;
  DeserializationError error = deserializeJson(doc, message);

  if (error) {
    Serial.print("JSON parse hatasi: ");
    Serial.println(error.c_str());
    return;
  }

  // Bina kontrolü
  if(doc.containsKey("building")) {
    currentBuilding = doc["building"];
    Serial.print(">> Bina degisti: ");
    Serial.println(currentBuilding);
  }

  // Daire kontrolü
  if(doc.containsKey("apartment")) {
    int aptId = doc["apartment"];
    int status = doc["status"];

    if(aptId > 0 && aptId <= 150) {
      int idx = aptId - 1;
      apartmentStatus[idx] = status;
      char k[10];
      sprintf(k, "a%d", idx);
      preferences.putInt(k, status);

      Serial.print(">> Daire ");
      Serial.print(aptId);
      Serial.print(" -> ");
      if(status == 0) Serial.println("SATILDI");
      else if(status == 1) Serial.println("MUSAIT");
      else if(status == 2) Serial.println("REZERVE");
      else Serial.println("KAPALI");

      currentAnimation = 0;
      updateLeds();
      FastLED.show();
      publishStatus();
    }
  }

  // Çevre aydınlatma
  if(doc.containsKey("environment")) {
    String env = doc["environment"];
    bool state = doc["state"];

    if(env == "peyzaj") {
      peyzajState = state;
      digitalWrite(PEYZAJ_PIN, peyzajState ? HIGH : LOW);
      Serial.print(">> PEYZAJ: ");
      Serial.println(peyzajState ? "ACIK" : "KAPALI");
    }
    else if(env == "sokak") {
      sokakState = state;
      digitalWrite(SOKAK_PIN, sokakState ? HIGH : LOW);
      Serial.print(">> SOKAK: ");
      Serial.println(sokakState ? "ACIK" : "KAPALI");
    }

    currentAnimation = 0;
    updateLeds();
    FastLED.show();
    publishStatus();
  }

  // Satılanları göster/gizle
  if(doc.containsKey("showSold")) {
    showSold = doc["showSold"];
    Serial.print(">> Satilanlari Goster: ");
    Serial.println(showSold ? "ACIK" : "KAPALI");
    updateLeds();
    FastLED.show();
    publishStatus();
  }

  // Senaryo kontrolü
  if(doc.containsKey("scenario")) {
    int scenario = doc["scenario"];
    currentAnimation = scenario;
    animStep = 0;
    Serial.print(">> Senaryo: ");
    if(scenario == 1) Serial.println("KARSILAMA MODU");
    else if(scenario == 2) Serial.println("GECE AMBIYANSI");
    else Serial.println("KAPALI");
    publishStatus();
  }

  // Tümünü kapat
  if(doc.containsKey("reset") && doc["reset"] == true) {
    peyzajState = false;
    sokakState = false;
    currentAnimation = 0;
    digitalWrite(PEYZAJ_PIN, LOW);
    digitalWrite(SOKAK_PIN, LOW);
    Serial.println(">> TUMU KAPATILDI");
    FastLED.clear();
    FastLED.show();
    publishStatus();
  }
}

// Device Provisioning - Firebase Functions'a bağlanıp tenant bilgisi alır
bool provisionDevice() {
  Serial.println("\n🔧 Device provisioning başlatılıyor...");

  HTTPClient http;
  http.begin(PROVISION_URL);
  http.addHeader("Content-Type", "application/json");
  http.addHeader("Authorization", String("Bearer ") + CLAIM_TOKEN);

  StaticJsonDocument<256> reqDoc;
  reqDoc["deviceMac"] = WiFi.macAddress();
  reqDoc["claimToken"] = CLAIM_TOKEN;

  char reqBuffer[256];
  serializeJson(reqDoc, reqBuffer);

  int httpCode = http.POST(reqBuffer);

  if (httpCode == 200) {
    String payload = http.getString();
    StaticJsonDocument<512> resDoc;
    DeserializationError error = deserializeJson(resDoc, payload);

    if (!error) {
      tenantId = resDoc["tenantId"].as<String>();
      deviceId = resDoc["deviceId"].as<String>();

      // EEPROM'a kaydet
      preferences.putString("tenantId", tenantId);
      preferences.putString("deviceId", deviceId);

      // Topic'leri oluştur
      topicCmd = "tenant/" + tenantId + "/device/" + deviceId + "/cmd";
      topicStatus = "tenant/" + tenantId + "/device/" + deviceId + "/status";

      Serial.println("✅ Provisioning başarılı!");
      Serial.println("Tenant ID: " + tenantId);
      Serial.println("Device ID: " + deviceId);
      Serial.println("Cmd Topic: " + topicCmd);
      Serial.println("Status Topic: " + topicStatus);

      http.end();
      return true;
    }
  }

  Serial.printf("❌ Provisioning hatası: HTTP %d\n", httpCode);
  http.end();
  return false;
}

void reconnectMQTT() {
  while (!mqttClient.connected()) {
    Serial.print("MQTT baglaniyor (HiveMQ Cloud)...");

    String clientId = "esp32-" + deviceId + "-" + String(random(0xffff), HEX);

    if (mqttClient.connect(clientId.c_str(), HIVEMQ_USER, HIVEMQ_PASS)) {
      Serial.println(" baglandi!");
      mqttClient.subscribe(topicCmd.c_str(), 1);
      Serial.print("Topic dinleniyor: ");
      Serial.println(topicCmd);
      publishStatus();
    } else {
      Serial.print(" baglanamadi, rc=");
      Serial.print(mqttClient.state());
      Serial.println(" 5 saniye sonra tekrar denenecek");
      delay(5000);
    }
  }
}

void setup() {
  Serial.begin(115200);
  Serial.println("\n\n=================================");
  Serial.println("  LED KONTROL MULTI-TENANT");
  Serial.println("  HiveMQ Cloud + Firebase");
  Serial.println("=================================");

  preferences.begin("led-control", false);

  // Daha önce provisioned mi?
  tenantId = preferences.getString("tenantId", "");
  deviceId = preferences.getString("deviceId", "");

  if (tenantId.length() > 0 && deviceId.length() > 0) {
    isProvisioned = true;
    topicCmd = "tenant/" + tenantId + "/device/" + deviceId + "/cmd";
    topicStatus = "tenant/" + tenantId + "/device/" + deviceId + "/status";
    Serial.println("✅ Daha önce provision edilmiş");
  }

  FastLED.addLeds<LED_TYPE, LED_PIN, COLOR_ORDER>(leds, NUM_LEDS);
  FastLED.setBrightness(BRIGHTNESS);

  pinMode(PEYZAJ_PIN, OUTPUT);
  pinMode(SOKAK_PIN, OUTPUT);
  digitalWrite(PEYZAJ_PIN, LOW);
  digitalWrite(SOKAK_PIN, LOW);
  Serial.println("OK Role pinleri hazir");

  for(int i=0; i<150; i++) {
    char key[10];
    sprintf(key, "a%d", i);
    apartmentStatus[i] = preferences.getInt(key, 1);
  }
  updateLeds();
  FastLED.show();
  Serial.println("OK LEDler basladi");

  WiFi.begin(WIFI_SSID, WIFI_PASS);
  Serial.print("WiFi baglaniyor");
  while(WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nOK WiFi baglandi!");
  Serial.print("IP Adresi: ");
  Serial.println(WiFi.localIP());

  // Provision gerekiyorsa
  if (!isProvisioned) {
    if (provisionDevice()) {
      isProvisioned = true;
    } else {
      Serial.println("❌ Provisioning başarısız! Manuel yapılandırma gerekli.");
      // Hata LED'i göster
      fill_solid(leds, NUM_LEDS, CRGB::Red);
      FastLED.show();
      while(1) delay(1000); // Durdur
    }
  }

  // HiveMQ Cloud TLS bağlantısı
  wifiClient.setCACert(hivemq_root_ca);
  mqttClient.setServer(HIVEMQ_BROKER, HIVEMQ_PORT);
  mqttClient.setCallback(mqttCallback);
  mqttClient.setBufferSize(2048); // Büyük mesajlar için

  Serial.println("=================================");
  Serial.println("SISTEM HAZIR!");
  Serial.println("=================================\n");
}

void loop() {
  if (!mqttClient.connected()) {
    reconnectMQTT();
  }
  mqttClient.loop();

  // Animasyonlar (öncekiyle aynı)
  if(currentAnimation > 0) {
    unsigned long now = millis();

    if(currentAnimation == 1 && now - lastAnimUpdate > 30) {
      if(animStep < NUM_LEDS) {
        leds[animStep] = CRGB::Gold;
        animStep++;
      }
      else if(animStep == NUM_LEDS) {
        static int flashCount = 0;
        static bool flashState = true;

        if(flashState) {
          fill_solid(leds, NUM_LEDS, CRGB::Gold);
        } else {
          FastLED.clear();
        }

        flashState = !flashState;
        flashCount++;

        if(flashCount >= 6) {
          flashCount = 0;
          animStep = 0;
          FastLED.clear();
        }
      }

      FastLED.show();
      lastAnimUpdate = now;
    }

    else if(currentAnimation == 2 && now - lastAnimUpdate > 30) {
      float b = (exp(sin(millis()/2000.0*PI)) - 0.368)*108.0;
      fill_solid(leds, NUM_LEDS, CHSV(160, 255, b));
      FastLED.show();
      lastAnimUpdate = now;
    }
  } else {
    animStep = 0;
  }

  // Her 30 saniyede bir heartbeat
  static unsigned long lastHeartbeat = 0;
  if (millis() - lastHeartbeat > 30000) {
    publishStatus();
    lastHeartbeat = millis();
  }
}
