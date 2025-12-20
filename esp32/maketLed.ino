#include <Arduino.h>
#include <WiFi.h>
#include <PubSubClient.h>
#include <FastLED.h>
#include <Preferences.h>
#include <ArduinoJson.h>
#include <WiFiClientSecure.h>

// --- KULLANICI AYARLARI ---
#define WIFI_SSID "onur1"
#define WIFI_PASS "onur1212"
#define LED_PIN 4
#define NUM_LEDS 200
#define BRIGHTNESS 255
#define LED_TYPE WS2812B
#define COLOR_ORDER GRB
#define PEYZAJ_PIN 5
#define SOKAK_PIN 18

// --- MQTT AYARLARI ---
#define MQTT_BROKER "your-mqtt-broker.com"
#define MQTT_PORT 1883
#define MQTT_USER ""
#define MQTT_PASS ""
#define MQTT_CLIENT_ID "ESP32-MAKET-001"
#define MQTT_TOPIC_CMD "maket/cmd"
#define MQTT_TOPIC_STATUS "maket/status"

// TLS için (opsiyonel)
#define USE_TLS false
const char* ca_cert = "";  // CA sertifikası buraya eklenecek

// --- SİSTEM DEĞİŞKENLERİ ---
CRGB leds[NUM_LEDS];
Preferences preferences;
WiFiClient wifiClient;
WiFiClientSecure wifiClientSecure;
PubSubClient mqttClient(wifiClient);

int apartmentStatus[150];
bool showSold = true;
bool peyzajState = false;
bool sokakState = false;
int currentAnimation = 0;
int currentBuilding = 1;  // Aktif bina numarası

unsigned long lastAnimUpdate = 0;
int animStep = 0;

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
  StaticJsonDocument<512> doc;
  doc["deviceId"] = MQTT_CLIENT_ID;
  doc["building"] = currentBuilding;
  doc["showSold"] = showSold;
  doc["peyzaj"] = peyzajState;
  doc["sokak"] = sokakState;
  doc["animation"] = currentAnimation;
  
  JsonArray apartments = doc.createNestedArray("apartments");
  for(int i=0; i<150; i++) {
    apartments.add(apartmentStatus[i]);
  }
  
  char buffer[1024];
  serializeJson(doc, buffer);
  mqttClient.publish(MQTT_TOPIC_STATUS, buffer);
}

void mqttCallback(char* topic, byte* payload, unsigned int length) {
  Serial.print("MQTT Mesaj alindi [");
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
    int building = doc["building"];
    if(building > 0 && building <= 10) {  // Maksimum 10 bina
      currentBuilding = building;
      Serial.print(">> Bina degisti: ");
      Serial.println(currentBuilding);
    }
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
      Serial.print(">> PEYZAJ AYDINLATMA: ");
      Serial.println(peyzajState ? "ACIK" : "KAPALI");
    }
    else if(env == "sokak") {
      sokakState = state;
      digitalWrite(SOKAK_PIN, sokakState ? HIGH : LOW);
      Serial.print(">> SOKAK LAMBALARI: ");
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

void reconnectMQTT() {
  while (!mqttClient.connected()) {
    Serial.print("MQTT baglaniyor...");
    
    if (mqttClient.connect(MQTT_CLIENT_ID, MQTT_USER, MQTT_PASS)) {
      Serial.println(" baglandi!");
      mqttClient.subscribe(MQTT_TOPIC_CMD);
      Serial.print("Topic dinleniyor: ");
      Serial.println(MQTT_TOPIC_CMD);
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
  Serial.println("  MIMARI LED KONTROL SISTEMI");
  Serial.println("  MQTT VERSIYON");
  Serial.println("=================================");
  
  preferences.begin("maket-v2", false);
  FastLED.addLeds<LED_TYPE, LED_PIN, COLOR_ORDER>(leds, NUM_LEDS);
  FastLED.setBrightness(BRIGHTNESS);

  pinMode(PEYZAJ_PIN, OUTPUT);
  pinMode(SOKAK_PIN, OUTPUT);
  digitalWrite(PEYZAJ_PIN, LOW);
  digitalWrite(SOKAK_PIN, LOW);
  Serial.println("OK Role pinleri hazir (GPIO 5 & 18)");

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

  // MQTT Setup
  #if USE_TLS
    wifiClientSecure.setCACert(ca_cert);
    mqttClient.setClient(wifiClientSecure);
    mqttClient.setServer(MQTT_BROKER, 8883);
  #else
    mqttClient.setClient(wifiClient);
    mqttClient.setServer(MQTT_BROKER, MQTT_PORT);
  #endif
  
  mqttClient.setCallback(mqttCallback);
  
  Serial.println("=================================");
  Serial.println("SISTEM HAZIR!");
  Serial.println("=================================\n");
}

void loop() {
  if (!mqttClient.connected()) {
    reconnectMQTT();
  }
  mqttClient.loop();
  
  if(currentAnimation > 0) {
    unsigned long now = millis();
    
    // KARŞILAMA MODU - Sıralı Yanma
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
    
    // GECE AMBİYANSI (Nefes Alma)
    else if(currentAnimation == 2 && now - lastAnimUpdate > 30) {
      float b = (exp(sin(millis()/2000.0*PI)) - 0.368)*108.0;
      fill_solid(leds, NUM_LEDS, CHSV(160, 255, b));
      FastLED.show(); 
      lastAnimUpdate = now;
    }
  } else {
    animStep = 0;
  }
}

